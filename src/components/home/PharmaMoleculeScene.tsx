"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface PharmaMoleculeSceneProps {
  className?: string;
}

export function PharmaMoleculeScene({ className = "" }: PharmaMoleculeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  const sceneStateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    mainGroup: THREE.Group;
    moleculeGroup: THREE.Group;
    dnaGroup: THREE.Group;
    orbitalsGroup: THREE.Group;
    particlesMesh: THREE.Points;
    animFrameId: number;
  } | null>(null);

  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch {
      setWebglSupported(false);
      return;
    }

    // Master Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x2563eb, 2.5);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3a991d, 2.2);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x06b6d4, 3, 20);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // 2. Molecule Group (Core Active Pharmaceutical Structure)
    const moleculeGroup = new THREE.Group();
    mainGroup.add(moleculeGroup);

    // Atom definitions (coordinates & colors) representing a pharma active molecule
    const atomData = [
      { pos: [0, 0, 0], color: 0x1b4db3, radius: 0.38, name: "Core C" },
      { pos: [1.1, 0.6, 0.2], color: 0x3a991d, radius: 0.32, name: "O" },
      { pos: [-1.1, 0.6, -0.2], color: 0x2563eb, radius: 0.34, name: "N" },
      { pos: [0.7, -1.0, 0.4], color: 0x14b8a6, radius: 0.3, name: "C" },
      { pos: [-0.7, -1.0, -0.3], color: 0x1b4db3, radius: 0.32, name: "C" },
      { pos: [1.9, -0.2, 0.6], color: 0x06b6d4, radius: 0.26, name: "OH" },
      { pos: [-1.9, -0.2, -0.5], color: 0x3a991d, radius: 0.28, name: "Ring C" },
      { pos: [0, 1.4, 0.1], color: 0x2563eb, radius: 0.35, name: "Carbonyl O" },
      { pos: [-1.4, 1.6, -0.1], color: 0x1b4db3, radius: 0.28, name: "Amine N" },
      { pos: [1.4, 1.6, 0.3], color: 0x10b981, radius: 0.26, name: "Methyl" },
      { pos: [0, -1.8, 0.2], color: 0x3a991d, radius: 0.32, name: "Halogen" },
    ];

    const atomMeshes: THREE.Mesh[] = [];
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);

    atomData.forEach((atom) => {
      const mat = new THREE.MeshPhongMaterial({
        color: atom.color,
        emissive: atom.color,
        emissiveIntensity: 0.25,
        shininess: 90,
        specular: 0xffffff,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(atom.pos[0], atom.pos[1], atom.pos[2]);
      mesh.scale.setScalar(atom.radius);
      moleculeGroup.add(mesh);
      atomMeshes.push(mesh);
    });

    // Helper to draw a chemical bond cylinder between two atom indices
    const bonds = [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 7],
      [1, 5], [2, 6], [2, 8], [1, 9], [3, 10], [4, 10],
      [3, 5], [4, 6]
    ];

    const cylinderGeo = new THREE.CylinderGeometry(0.045, 0.045, 1, 16);
    const bondMat = new THREE.MeshPhongMaterial({
      color: 0x94a3b8,
      emissive: 0x1e293b,
      emissiveIntensity: 0.2,
      shininess: 70,
      transparent: true,
      opacity: 0.85,
    });

    bonds.forEach(([i1, i2]) => {
      const p1 = new THREE.Vector3(...atomData[i1].pos);
      const p2 = new THREE.Vector3(...atomData[i2].pos);
      const distance = p1.distanceTo(p2);
      const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      const bondMesh = new THREE.Mesh(cylinderGeo, bondMat);
      bondMesh.position.copy(midpoint);
      bondMesh.scale.set(1, distance, 1);

      const orientation = new THREE.Matrix4();
      orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
      orientation.multiply(new THREE.Matrix4().makeRotationX(Math.PI / 2));
      bondMesh.setRotationFromMatrix(orientation);

      moleculeGroup.add(bondMesh);
    });

    // 3. DNA Double-Helix Ring / Ribbon surrounding the molecule
    const dnaGroup = new THREE.Group();
    mainGroup.add(dnaGroup);

    const dnaSteps = 28;
    const dnaRadius = 2.4;
    const dnaHeight = 4.2;

    for (let i = 0; i < dnaSteps; i++) {
      const t = (i / dnaSteps) * Math.PI * 3.5;
      const y = ((i / dnaSteps) - 0.5) * dnaHeight;
      const x1 = Math.cos(t) * dnaRadius;
      const z1 = Math.sin(t) * dnaRadius;
      const x2 = Math.cos(t + Math.PI) * dnaRadius;
      const z2 = Math.sin(t + Math.PI) * dnaRadius;

      // Base pairs (rungs)
      const rungMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x06b6d4 : 0x3a991d,
        transparent: true,
        opacity: 0.55,
      });
      const rungPoints = [new THREE.Vector3(x1, y, z1), new THREE.Vector3(x2, y, z2)];
      const rungGeo = new THREE.BufferGeometry().setFromPoints(rungPoints);
      const rungLine = new THREE.Line(rungGeo, rungMat);
      dnaGroup.add(rungLine);

      // Node spheres at ends of rungs
      const nodeGeo = new THREE.SphereGeometry(0.065, 12, 12);
      const nodeMat1 = new THREE.MeshBasicMaterial({ color: 0x1b4db3 });
      const nodeMat2 = new THREE.MeshBasicMaterial({ color: 0x3a991d });

      const node1 = new THREE.Mesh(nodeGeo, nodeMat1);
      node1.position.set(x1, y, z1);
      dnaGroup.add(node1);

      const node2 = new THREE.Mesh(nodeGeo, nodeMat2);
      node2.position.set(x2, y, z2);
      dnaGroup.add(node2);
    }

    // 4. Multiple Angled Orbital Rings
    const orbitalsGroup = new THREE.Group();
    mainGroup.add(orbitalsGroup);

    const torusMat1 = new THREE.MeshBasicMaterial({
      color: 0x1b4db3,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const torus1 = new THREE.Mesh(new THREE.TorusGeometry(2.7, 0.015, 16, 80), torusMat1);
    torus1.rotation.x = Math.PI / 3;
    orbitalsGroup.add(torus1);

    const torusMat2 = new THREE.MeshBasicMaterial({
      color: 0x3a991d,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.015, 16, 80), torusMat2);
    torus2.rotation.y = Math.PI / 4;
    orbitalsGroup.add(torus2);

    const torusMat3 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.28,
      wireframe: true,
    });
    const torus3 = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.015, 16, 80), torusMat3);
    torus3.rotation.z = Math.PI / 5;
    orbitalsGroup.add(torus3);

    // 5. Floating Chemical Particle Dust Cloud
    const particleCount = 120;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x1b4db3);
    const color2 = new THREE.Color(0x3a991d);
    const color3 = new THREE.Color(0x06b6d4);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.8 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : color3;
      particleColors[i * 3] = chosenColor.r;
      particleColors[i * 3 + 1] = chosenColor.g;
      particleColors[i * 3 + 2] = chosenColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particlesMesh);

    // Mouse movement handler for interactive rotation
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.45;
    };

    container.addEventListener("mousemove", handleMouseMove);

    // Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 500;
      const newHeight = container.clientHeight || 500;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping (lerp)
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Continuous rotations
      moleculeGroup.rotation.y = elapsedTime * 0.35 + mouseRef.current.x;
      moleculeGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.2 + mouseRef.current.y;

      dnaGroup.rotation.y = -elapsedTime * 0.25;
      orbitalsGroup.rotation.y = elapsedTime * 0.4;
      orbitalsGroup.rotation.x = elapsedTime * 0.15;
      particlesMesh.rotation.y = elapsedTime * 0.08;

      // Subtle breathing pulse on atoms
      atomMeshes.forEach((mesh, idx) => {
        const pulse = 1 + Math.sin(elapsedTime * 2.5 + idx * 0.7) * 0.06;
        const baseRadius = atomData[idx].radius;
        mesh.scale.setScalar(baseRadius * pulse);
      });

      renderer.render(scene, camera);
      sceneStateRef.current!.animFrameId = requestAnimationFrame(animate);
    };

    sceneStateRef.current = {
      renderer,
      scene,
      camera,
      mainGroup,
      moleculeGroup,
      dnaGroup,
      orbitalsGroup,
      particlesMesh,
      animFrameId: 0,
    };

    animate();

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (sceneStateRef.current) {
        cancelAnimationFrame(sceneStateRef.current.animFrameId);
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, [prefersReducedMotion]);

  if (!webglSupported) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-[#1b4db3]/20 via-[#3a991d]/20 to-[#06b6d4]/20 blur-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-[380px] sm:h-[460px] lg:h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing ${className}`}
      aria-label="Interactive 3D Pharmaceutical Molecular Structure & DNA Helix"
    />
  );
}
