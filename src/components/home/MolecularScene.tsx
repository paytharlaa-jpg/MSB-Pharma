"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MolecularSceneProps {
  scrollProgress?: number; // 0 to 1
  className?: string;
}

export function MolecularScene({ scrollProgress = 0, className = "" }: MolecularSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const sceneRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    moleculeGroup: THREE.Group;
    animFrameId: number;
  } | null>(null);

  // Update camera and molecule rotation when scrollProgress changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const { camera, moleculeGroup } = sceneRef.current;

    // As user scrolls through hero:
    // Scale slightly, orbit camera around structure, shift position
    const t = scrollProgress;
    camera.position.x = Math.sin(t * Math.PI) * 1.5;
    camera.position.y = -t * 1.2;
    camera.position.z = 7 - t * 2.5;
    camera.lookAt(0, -t * 0.4, 0);

    moleculeGroup.rotation.x = t * Math.PI * 0.8;
    moleculeGroup.rotation.y = t * Math.PI * 1.2;
  }, [scrollProgress]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL capability
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

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071827, 0.08);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const tealDirectional = new THREE.DirectionalLight(0x16b8a6, 2.4);
    tealDirectional.position.set(5, 5, 5);
    scene.add(tealDirectional);

    const cyanPoint = new THREE.PointLight(0x38bdf8, 2.0, 20);
    cyanPoint.position.set(-4, -2, 3);
    scene.add(cyanPoint);

    // Create Molecule Structure
    const moleculeGroup = new THREE.Group();

    // Geometries & Materials reuse
    const sphereGeoLarge = new THREE.SphereGeometry(0.38, 24, 24);
    const sphereGeoMed = new THREE.SphereGeometry(0.28, 20, 20);
    const sphereGeoSmall = new THREE.SphereGeometry(0.2, 16, 16);

    const matTealGlow = new THREE.MeshStandardMaterial({
      color: 0x16b8a6,
      emissive: 0x0e8e83,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });

    const matCrystalGlass = new THREE.MeshStandardMaterial({
      color: 0xe0f2fe,
      roughness: 0.15,
      metalness: 0.2,
      transparent: true,
      opacity: 0.75,
    });

    const matCyanAccent = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.4,
      roughness: 0.25,
      metalness: 0.7,
    });

    const matBond = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      emissive: 0x0f766e,
      emissiveIntensity: 0.4,
      roughness: 0.3,
      metalness: 0.6,
    });

    // Molecular nodes positions (representing an active steroid / polycyclic aromatic core)
    const atomNodes = [
      { pos: [0, 0, 0], mat: matTealGlow, geo: sphereGeoLarge },
      { pos: [1.1, 0.7, 0.2], mat: matCrystalGlass, geo: sphereGeoMed },
      { pos: [0.9, -1.0, -0.3], mat: matCyanAccent, geo: sphereGeoMed },
      { pos: [-1.2, 0.6, -0.2], mat: matCrystalGlass, geo: sphereGeoMed },
      { pos: [-0.9, -1.1, 0.3], mat: matTealGlow, geo: sphereGeoMed },
      { pos: [2.1, 0.2, -0.4], mat: matTealGlow, geo: sphereGeoSmall },
      { pos: [1.8, -1.3, 0.4], mat: matCrystalGlass, geo: sphereGeoSmall },
      { pos: [-2.1, 0.1, 0.5], mat: matCyanAccent, geo: sphereGeoSmall },
      { pos: [-1.6, -1.5, -0.4], mat: matCrystalGlass, geo: sphereGeoSmall },
      { pos: [0.1, 1.4, -0.5], mat: matTealGlow, geo: sphereGeoSmall },
      { pos: [1.4, 1.8, 0.3], mat: matCrystalGlass, geo: sphereGeoSmall },
      { pos: [-1.1, 1.7, 0.2], mat: matTealGlow, geo: sphereGeoSmall },
      { pos: [-0.2, -2.0, 0.1], mat: matCyanAccent, geo: sphereGeoSmall },
    ];

    atomNodes.forEach((node) => {
      const mesh = new THREE.Mesh(node.geo, node.mat);
      mesh.position.set(node.pos[0], node.pos[1], node.pos[2]);
      moleculeGroup.add(mesh);
    });

    // Helper to draw chemical bond cylinders between pairs
    const bonds = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 5], [2, 6], [3, 7], [4, 8],
      [1, 9], [3, 11], [4, 12], [9, 10],
      [5, 2], [7, 4], [9, 11],
    ];

    bonds.forEach(([i, j]) => {
      const p1 = new THREE.Vector3(...atomNodes[i].pos);
      const p2 = new THREE.Vector3(...atomNodes[j].pos);
      const distance = p1.distanceTo(p2);
      const cylinderGeo = new THREE.CylinderGeometry(0.045, 0.045, distance, 12);
      const cylinder = new THREE.Mesh(cylinderGeo, matBond);

      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      cylinder.position.copy(mid);

      const orientation = new THREE.Matrix4();
      orientation.lookAt(p1, p2, new THREE.Vector3(0, 1, 0));
      cylinder.quaternion.setFromRotationMatrix(orientation);
      cylinder.rotateX(Math.PI / 2);

      moleculeGroup.add(cylinder);
    });

    // Ambient floating particles
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let p = 0; p < particleCount * 3; p += 3) {
      positions[p] = (Math.random() - 0.5) * 12;
      positions[p + 1] = (Math.random() - 0.5) * 8;
      positions[p + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x16b8a6,
      size: 0.06,
      transparent: true,
      opacity: 0.5,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    scene.add(moleculeGroup);

    sceneRef.current = {
      renderer,
      scene,
      camera,
      moleculeGroup,
      animFrameId: 0,
    };

    // Render loop with IntersectionObserver to pause offscreen
    let isVisible = true;
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      if (!isVisible) return;
      const delta = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;

      // Subtle ambient rotation
      moleculeGroup.rotation.y += delta * 0.15;
      moleculeGroup.rotation.x += delta * 0.08;
      particleSystem.rotation.y += delta * 0.04;

      renderer.render(scene, camera);
      if (sceneRef.current) {
        sceneRef.current.animFrameId = requestAnimationFrame(animate);
      }
    };

    sceneRef.current.animFrameId = requestAnimationFrame(animate);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (!wasVisible && isVisible && sceneRef.current) {
          lastTime = performance.now();
          cancelAnimationFrame(sceneRef.current.animFrameId);
          sceneRef.current.animFrameId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Resize handler
    const handleResize = () => {
      if (!container || !sceneRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    // Cleanup on unmount
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animFrameId);
        renderer.dispose();
        sphereGeoLarge.dispose();
        sphereGeoMed.dispose();
        sphereGeoSmall.dispose();
        matTealGlow.dispose();
        matCrystalGlass.dispose();
        matCyanAccent.dispose();
        matBond.dispose();
        particleGeo.dispose();
        particleMat.dispose();
      }
      if (container) {
        container.innerHTML = "";
      }
      sceneRef.current = null;
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !webglSupported) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <Image
          src="/images/hero-molecular-environment.webp"
          alt="3D Pharmaceutical Molecular Structure"
          fill
          className="object-contain object-center opacity-85"
          priority
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
