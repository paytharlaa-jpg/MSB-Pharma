"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface RotatingGlobeSceneProps {
  scrollProgress?: number;
  className?: string;
}

// Convert geographic coordinates to 3D Cartesian coordinates on sphere
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function RotatingGlobeScene({
  scrollProgress = 0,
  className = "",
}: RotatingGlobeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const prefersReducedMotion = useReducedMotion();
  const globeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    globeGroup: THREE.Group;
    pulseBeads: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; speed: number; progress: number }[];
    animFrameId: number;
  } | null>(null);

  // Mouse interaction state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Update on scroll
  useEffect(() => {
    if (!globeRef.current) return;
    const { camera, globeGroup } = globeRef.current;
    const t = scrollProgress;
    globeGroup.rotation.y = t * Math.PI * 0.7;
    camera.position.z = 7 - t * 1.5;
  }, [scrollProgress]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
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

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.8);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Initial slight tilt
    globeGroup.rotation.x = 0.28;
    globeGroup.rotation.z = -0.05;

    // Radius
    const R = 2.4;

    // 1. Dotted Globe Matrix (Latitude & Longitude grid points)
    const points: number[] = [];
    const colors: number[] = [];
    const colorBlue = new THREE.Color(0x1b4db3); // Royal Blue
    const colorGreen = new THREE.Color(0x3a991d); // Pharma Green
    const colorCyan = new THREE.Color(0x2563eb); // Bright Blue

    const latSteps = 38;
    const lonSteps = 72;

    for (let i = 0; i <= latSteps; i++) {
      const lat = -80 + (160 * i) / latSteps;
      const count = Math.floor(lonSteps * Math.cos((lat * Math.PI) / 180));
      for (let j = 0; j < count; j++) {
        const lon = -180 + (360 * j) / count;
        // Natural distribution with slight jitter for organic tech feel
        const p = latLonToVector3(lat, lon, R);
        points.push(p.x, p.y, p.z);

        // Mix between blue and green
        const mixRatio = Math.sin(lat * 0.08) * 0.5 + 0.5;
        const c = mixRatio > 0.6 ? colorGreen : mixRatio > 0.3 ? colorBlue : colorCyan;
        colors.push(c.r, c.g, c.b);
      }
    }

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    dotGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
    });
    const globePoints = new THREE.Points(dotGeo, dotMat);
    globeGroup.add(globePoints);

    // 2. Latitude and Longitude Wireframe Rings for high-tech look
    const wireframeSphereGeo = new THREE.SphereGeometry(R, 24, 16);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x1b4db3,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireframeSphere = new THREE.Mesh(wireframeSphereGeo, wireframeMat);
    globeGroup.add(wireframeSphere);

    // 3. Inner Translucent Core Sphere to give depth and occlusion
    const coreGeo = new THREE.SphereGeometry(R * 0.985, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 4. Outer Atmospheric Glowing Halo Ring
    const ringGeo = new THREE.RingGeometry(R * 1.02, R * 1.15, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x1b4db3,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    globeGroup.add(ringMesh);

    // Second inclined orbit ring
    const ring2Geo = new THREE.RingGeometry(R * 1.12, R * 1.16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x3a991d,
      transparent: true,
      opacity: 0.22,
      side: THREE.DoubleSide,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = Math.PI / 3;
    ring2Mesh.rotation.y = Math.PI / 6;
    globeGroup.add(ring2Mesh);

    // 5. Global Pharmaceutical Hub Locations
    const hubs = [
      { name: "Hyderabad (HQ)", lat: 17.385, lon: 78.4867, isHq: true },
      { name: "Mumbai", lat: 19.076, lon: 72.8777 },
      { name: "Singapore", lat: 1.3521, lon: 103.8198 },
      { name: "Dubai", lat: 25.2048, lon: 55.2708 },
      { name: "Basel (CH)", lat: 47.5596, lon: 7.5886 },
      { name: "Frankfurt", lat: 50.1109, lon: 8.6821 },
      { name: "London", lat: 51.5074, lon: -0.1278 },
      { name: "New Jersey (US)", lat: 40.0583, lon: -74.4057 },
      { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
      { name: "Sao Paulo", lat: -23.5505, lon: -46.6333 },
    ];

    const hqPos = latLonToVector3(hubs[0].lat, hubs[0].lon, R * 1.01);

    // Add marker for each hub
    const hubMat = new THREE.MeshBasicMaterial({ color: 0x1b4db3 });
    const hqMat = new THREE.MeshBasicMaterial({ color: 0x3a991d });

    hubs.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, R * 1.01);
      const size = hub.isHq ? 0.09 : 0.05;
      const markerGeo = new THREE.SphereGeometry(size, 16, 16);
      const marker = new THREE.Mesh(markerGeo, hub.isHq ? hqMat : hubMat);
      marker.position.copy(pos);
      globeGroup.add(marker);
    });

    // 6. Arcs connecting Hyderabad (HQ) to other global hubs
    const pulseBeads: {
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      speed: number;
      progress: number;
    }[] = [];

    const beadGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const beadMat = new THREE.MeshBasicMaterial({ color: 0x3a991d });

    for (let k = 1; k < hubs.length; k++) {
      const destPos = latLonToVector3(hubs[k].lat, hubs[k].lon, R * 1.01);

      // Midpoint elevated above sphere surface for natural ballistic arc
      const midPoint = new THREE.Vector3().addVectors(hqPos, destPos).multiplyScalar(0.5);
      const distance = hqPos.distanceTo(destPos);
      const elevation = R + distance * 0.32;
      midPoint.normalize().multiplyScalar(elevation);

      const curve = new THREE.CatmullRomCurve3([hqPos, midPoint, destPos]);
      const curvePoints = curve.getPoints(40);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);

      const curveMat = new THREE.LineBasicMaterial({
        color: k % 2 === 0 ? 0x1b4db3 : 0x3a991d,
        transparent: true,
        opacity: 0.5,
      });

      const line = new THREE.Line(curveGeo, curveMat);
      globeGroup.add(line);

      // Animated traveling pulse bead along the curve
      const bead = new THREE.Mesh(beadGeo, beadMat);
      globeGroup.add(bead);

      pulseBeads.push({
        mesh: bead,
        curve,
        speed: 0.003 + (k % 4) * 0.0015,
        progress: (k * 0.12) % 1,
      });
    }

    globeRef.current = {
      renderer,
      scene,
      camera,
      globeGroup,
      pulseBeads,
      animFrameId: 0,
    };

    // Mouse movement listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseRef.current.targetX = x * 0.6;
      mouseRef.current.targetY = y * 0.6;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Animation render loop
    let isVisible = true;
    const animate = () => {
      if (!isVisible) return;

      // Smooth mouse follow
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Continuous world rotation + subtle mouse influence
      globeGroup.rotation.y += 0.0038;
      globeGroup.rotation.x = 0.28 + mouseRef.current.y * 0.2;
      globeGroup.rotation.z = -0.05 + mouseRef.current.x * 0.2;

      // Advance pulse beads along connection arcs
      pulseBeads.forEach((item) => {
        item.progress += item.speed;
        if (item.progress > 1) item.progress = 0;
        const pt = item.curve.getPoint(item.progress);
        item.mesh.position.copy(pt);
      });

      renderer.render(scene, camera);

      if (globeRef.current) {
        globeRef.current.animFrameId = requestAnimationFrame(animate);
      }
    };

    globeRef.current.animFrameId = requestAnimationFrame(animate);

    // Pause when offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (!wasVisible && isVisible && globeRef.current) {
          cancelAnimationFrame(globeRef.current.animFrameId);
          globeRef.current.animFrameId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Resize handler
    const handleResize = () => {
      if (!container || !globeRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (globeRef.current) {
        cancelAnimationFrame(globeRef.current.animFrameId);
        renderer.dispose();
        dotGeo.dispose();
        dotMat.dispose();
        wireframeSphereGeo.dispose();
        wireframeMat.dispose();
        coreGeo.dispose();
        coreMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        ring2Geo.dispose();
        ring2Mat.dispose();
      }
      if (container) {
        container.innerHTML = "";
      }
      globeRef.current = null;
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || !webglSupported) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
        <div className="w-[320px] h-[320px] rounded-full border-2 border-dashed border-[#1b4db3]/30 flex items-center justify-center bg-gradient-to-tr from-[#1b4db3]/5 via-white to-[#3a991d]/5 shadow-xl">
          <div className="w-[240px] h-[240px] rounded-full border border-[#3a991d]/40 flex items-center justify-center">
            <span className="text-xs font-mono font-bold text-[#1b4db3]">
              GLOBAL SOURCING NETWORK
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full overflow-visible pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
}
