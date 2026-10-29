"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { RotateCw } from "lucide-react";

interface RotatingGlobeSceneProps {
  scrollProgress?: number;
  className?: string;
}

// Convert geographic coordinates to exact 3D coordinates aligned with Three.js SphereGeometry UVs
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const u = (lon + 180) / 360;
  const v = (lat + 90) / 180;
  const theta = (1 - v) * Math.PI;
  const phi = u * 2 * Math.PI;
  const x = -radius * Math.cos(phi) * Math.sin(theta);
  const y = radius * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

// Major global pharmaceutical trade & sourcing hubs
const PHARMA_HUBS = [
  { name: "Hyderabad (HQ)", lat: 17.385, lon: 78.4867, isHq: true, desc: "Global Central Hub" },
  { name: "Mumbai", lat: 19.076, lon: 72.8777, isHq: false, desc: "Port & API Trading" },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, isHq: false, desc: "Asia-Pacific Logistics" },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, isHq: false, desc: "MENA Distribution" },
  { name: "Basel (CH)", lat: 47.5596, lon: 7.5886, isHq: false, desc: "European Pharma Capital" },
  { name: "Frankfurt", lat: 50.1109, lon: 8.6821, isHq: false, desc: "EU Quality & Air Cargo" },
  { name: "London", lat: 51.5074, lon: -0.1278, isHq: false, desc: "UK & Global Procurement" },
  { name: "New Jersey (US)", lat: 40.0583, lon: -74.4057, isHq: false, desc: "US Pharma Corridor" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, isHq: false, desc: "Far East Formulation" },
  { name: "Sao Paulo", lat: -23.5505, lon: -46.6333, isHq: false, desc: "Latin America Gateway" },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, isHq: false, desc: "Oceania Regulatory Hub" },
];

export function RotatingGlobeScene({
  scrollProgress = 0,
  className = "",
}: RotatingGlobeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [, setIsLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Drag interaction tracking
  const dragRef = useRef({
    isDragging: false,
    prevX: 0,
    prevY: 0,
    velX: 0,
    velY: 0,
  });

  const globeRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    earthGroup: THREE.Group;
    earthMesh: THREE.Mesh;
    cloudMesh: THREE.Mesh;
    radarRings: { mesh: THREE.Mesh; scale: number; speed: number }[];
    pulseBeads: { mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; speed: number; progress: number }[];
    animFrameId: number;
    disposables: { dispose: () => void }[];
  } | null>(null);

  // Scroll reaction
  useEffect(() => {
    if (!globeRef.current) return;
    const { camera, earthGroup } = globeRef.current;
    const t = scrollProgress;
    earthGroup.rotation.y = t * Math.PI * 0.5;
    camera.position.z = 7.2 - t * 0.8;
  }, [scrollProgress]);

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

    const width = container.clientWidth || 540;
    const height = container.clientHeight || 540;

    // 1. Scene & Camera Setup (With generous viewport margin so no part clips)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

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

    const disposables: { dispose: () => void }[] = [];

    // Master Group tilted on Earth's authentic 23.4° axial tilt
    const earthGroup = new THREE.Group();
    earthGroup.rotation.x = 0.38; // ~22 degrees
    earthGroup.rotation.z = -0.05;
    scene.add(earthGroup);

    // 2. Realistic Cinematic Lighting System
    // Directional Sunlight casting day-night terminator
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(6, 3.5, 5);
    scene.add(sunLight);

    // Soft deep navy twilight ambient fill
    const ambientLight = new THREE.AmbientLight(0x243b64, 0.9);
    scene.add(ambientLight);

    // Subtle emerald rim light on limb for brand accent
    const rimLight = new THREE.DirectionalLight(0x3a991d, 0.5);
    rimLight.position.set(-6, -2, -4);
    scene.add(rimLight);

    // 3. Texture Loading
    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (path: string) => {
      const tex = textureLoader.load(path, () => {
        setIsLoaded(true);
      });
      tex.colorSpace = THREE.SRGBColorSpace;
      disposables.push(tex);
      return tex;
    };

    const earthMap = loadTexture("/textures/earth-blue-marble.jpg");
    const bumpMap = loadTexture("/textures/earth-topology.png");
    const specularMap = loadTexture("/textures/earth-specular.jpg");
    const cloudMap = loadTexture("/textures/earth-clouds.jpg");

    // Proportional Earth radius scaled to fit comfortably with complete circular clearance
    const R = 1.62;

    // 4. Photorealistic Earth Sphere
    const earthGeo = new THREE.SphereGeometry(R, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthMap,
      bumpMap: bumpMap,
      bumpScale: 0.04,
      specularMap: specularMap,
      specular: new THREE.Color(0x224488),
      shininess: 24,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);
    disposables.push(earthGeo, earthMat);

    // 5. Floating Real 3D Cloud Layer (Moving independently over continents)
    const cloudGeo = new THREE.SphereGeometry(R * 1.015, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudMap,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);
    disposables.push(cloudGeo, cloudMat);

    // 6. Seamless Atmospheric Limb Fresnel Glow (Wrapped onto sphere, impossible to clip into a box)
    const atmosphereGeo = new THREE.SphereGeometry(R * 1.025, 64, 64);
    const atmosphereMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float viewDot = max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
          float rim = pow(1.0 - viewDot, 2.8);
          gl_FragColor = vec4(0.12, 0.52, 0.98, 1.0) * rim * 0.92;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
      transparent: true,
      depthWrite: false,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    earthGroup.add(atmosphereMesh);
    disposables.push(atmosphereGeo, atmosphereMat);

    // 7. Elegant 3D Circular Orbit Ring (fits completely within camera view)
    const orbitCurvePoints: THREE.Vector3[] = [];
    const orbitRadius = R * 1.22;
    for (let a = 0; a <= 64; a++) {
      const angle = (a / 64) * Math.PI * 2;
      orbitCurvePoints.push(new THREE.Vector3(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius));
    }
    const orbitLineGeo = new THREE.BufferGeometry().setFromPoints(orbitCurvePoints);
    const orbitLineMat = new THREE.LineBasicMaterial({
      color: 0x3a991d,
      transparent: true,
      opacity: 0.35,
    });
    const orbitLine = new THREE.Line(orbitLineGeo, orbitLineMat);
    orbitLine.rotation.x = Math.PI / 4;
    orbitLine.rotation.y = Math.PI / 6;
    earthGroup.add(orbitLine);
    disposables.push(orbitLineGeo, orbitLineMat);

    // 8. Geographical Hubs & Real Position Markers
    const hqHub = PHARMA_HUBS.find((h) => h.isHq) || PHARMA_HUBS[0];
    const hqPos = latLonToVector3(hqHub.lat, hqHub.lon, R * 1.008);

    const hubMat = new THREE.MeshBasicMaterial({ color: 0x2563eb });
    const hqMat = new THREE.MeshBasicMaterial({ color: 0x3a991d });
    disposables.push(hubMat, hqMat);

    // Add 3D markers for all pharmaceutical hubs
    PHARMA_HUBS.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, R * 1.008);
      const markerRadius = hub.isHq ? 0.055 : 0.035;
      const markerGeo = new THREE.SphereGeometry(markerRadius, 16, 16);
      const marker = new THREE.Mesh(markerGeo, hub.isHq ? hqMat : hubMat);
      marker.position.copy(pos);
      earthGroup.add(marker);
      disposables.push(markerGeo);
    });

    // 9. Hyderabad HQ Vertical Light Beacon & Sonar Ripple Waves
    const normal = hqPos.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, normal);

    // Vertical beacon cylinder
    const beaconGeo = new THREE.CylinderGeometry(0.012, 0.028, 0.35, 16);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0x3a991d,
      transparent: true,
      opacity: 0.85,
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.setRotationFromQuaternion(quaternion);
    beacon.position.copy(hqPos.clone().add(normal.clone().multiplyScalar(0.18)));
    earthGroup.add(beacon);
    disposables.push(beaconGeo, beaconMat);

    // Sonar radar pulse ripple rings on Hyderabad
    const radarRings: { mesh: THREE.Mesh; scale: number; speed: number }[] = [];
    for (let r = 0; r < 2; r++) {
      const ringGeo = new THREE.RingGeometry(0.015, 0.045, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x3a991d,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.setRotationFromQuaternion(quaternion);
      ring.position.copy(hqPos.clone().add(normal.clone().multiplyScalar(0.01)));
      earthGroup.add(ring);
      disposables.push(ringGeo, ringMat);
      radarRings.push({ mesh: ring, scale: r * 0.5, speed: 0.012 });
    }

    // 10. High-Altitude Ballistic Supply Arcs connecting Hyderabad to Global Gateways
    const pulseBeads: {
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      speed: number;
      progress: number;
    }[] = [];

    const beadGeo = new THREE.SphereGeometry(0.03, 12, 12);
    const beadMat = new THREE.MeshBasicMaterial({ color: 0x3a991d });
    disposables.push(beadGeo, beadMat);

    PHARMA_HUBS.forEach((hub, idx) => {
      if (hub.isHq) return;

      const destPos = latLonToVector3(hub.lat, hub.lon, R * 1.008);
      const distance = hqPos.distanceTo(destPos);

      // Apex point elevated above planetary atmosphere, securely kept inside camera frustum
      const midPoint = new THREE.Vector3().addVectors(hqPos, destPos).multiplyScalar(0.5);
      const elevation = R + Math.min(distance * 0.22, 0.38);
      midPoint.normalize().multiplyScalar(elevation);

      const curve = new THREE.CatmullRomCurve3([hqPos, midPoint, destPos]);
      const curvePoints = curve.getPoints(40);
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);

      const curveMat = new THREE.LineBasicMaterial({
        color: idx % 2 === 0 ? 0x2563eb : 0x3a991d,
        transparent: true,
        opacity: 0.55,
      });

      const line = new THREE.Line(curveGeo, curveMat);
      earthGroup.add(line);
      disposables.push(curveGeo, curveMat);

      // Photon packet bead traveling on the arc
      const bead = new THREE.Mesh(beadGeo, beadMat);
      earthGroup.add(bead);

      pulseBeads.push({
        mesh: bead,
        curve,
        speed: 0.0035 + (idx % 4) * 0.0016,
        progress: (idx * 0.15) % 1,
      });
    });

    globeRef.current = {
      renderer,
      scene,
      camera,
      earthGroup,
      earthMesh,
      cloudMesh,
      radarRings,
      pulseBeads,
      animFrameId: 0,
      disposables,
    };

    // 11. Mouse & Touch Drag Interaction Handlers
    const onPointerDown = (e: PointerEvent) => {
      dragRef.current.isDragging = true;
      dragRef.current.prevX = e.clientX;
      dragRef.current.prevY = e.clientY;
      dragRef.current.velX = 0;
      dragRef.current.velY = 0;
      if (container) {
        container.style.cursor = "grabbing";
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.isDragging) return;
      const deltaX = e.clientX - dragRef.current.prevX;
      const deltaY = e.clientY - dragRef.current.prevY;
      dragRef.current.prevX = e.clientX;
      dragRef.current.prevY = e.clientY;

      dragRef.current.velX = deltaX * 0.005;
      dragRef.current.velY = deltaY * 0.005;

      earthGroup.rotation.y += deltaX * 0.005;
      earthGroup.rotation.x = Math.max(-0.8, Math.min(0.8, earthGroup.rotation.x + deltaY * 0.004));
    };

    const onPointerUp = () => {
      dragRef.current.isDragging = false;
      if (container) {
        container.style.cursor = "grab";
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    container.style.cursor = "grab";

    // 12. 60 FPS Render & Animation Loop
    let isVisible = true;
    const animate = () => {
      if (!isVisible) return;

      // Realistic planetary rotation
      if (!dragRef.current.isDragging) {
        // Natural inertial decay from drag
        if (Math.abs(dragRef.current.velX) > 0.0001 || Math.abs(dragRef.current.velY) > 0.0001) {
          earthGroup.rotation.y += dragRef.current.velX;
          earthGroup.rotation.x = Math.max(-0.8, Math.min(0.8, earthGroup.rotation.x + dragRef.current.velY));
          dragRef.current.velX *= 0.94;
          dragRef.current.velY *= 0.94;
        } else {
          // Standard majestic Earth auto-rotation
          earthGroup.rotation.y += 0.0022;
        }
      }

      // Independent dynamic cloud movement over Earth surface
      cloudMesh.rotation.y += 0.0027;

      // Animate sonar radar ripples from Hyderabad
      radarRings.forEach((r) => {
        r.scale += r.speed;
        if (r.scale > 1) {
          r.scale = 0.01;
        }
        r.mesh.scale.set(1 + r.scale * 4.5, 1 + r.scale * 4.5, 1);
        (r.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.8 * (1 - r.scale));
      });

      // Advance photon pulses along ballistic trade arcs
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

    // Pause when scrolled offscreen
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

    // Responsive Canvas Resize
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
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", handleResize);

      if (globeRef.current) {
        cancelAnimationFrame(globeRef.current.animFrameId);
        globeRef.current.disposables.forEach((item) => {
          try {
            item.dispose();
          } catch {
            // ignore
          }
        });
        renderer.dispose();
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
    <div className={`relative w-full h-full flex items-center justify-center select-none ${className}`}>
      {/* Velvety Circular Atmospheric Nebula Backdrop (100% round, no box corners) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-tr from-[#1b4db3]/14 via-[#3a991d]/8 to-transparent blur-3xl" />
      </div>

      {/* Real 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="w-full h-full overflow-visible touch-none"
        aria-label="Interactive 3D Photorealistic Rotating Globe"
      />

      {/* Floating 3D Globe Interactive Cue Pill */}
      <div className="absolute bottom-1 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-md text-[11px] font-semibold text-slate-700">
          <RotateCw className="w-3.5 h-3.5 text-[#1b4db3] animate-spin" style={{ animationDuration: "6s" }} />
          <span>Real 3D Earth · Drag to Rotate</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#3a991d] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
