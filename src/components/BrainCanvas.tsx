import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const BrainCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Store mutable refs for animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const brainGroupRef = useRef<THREE.Group | null>(null);

  const scrollProgressRef = useRef(0);
  // Default in Hero: Lower right, partly behind the photo, away from his face
  const targetPosRef = useRef(new THREE.Vector3(2.4, -0.7, -0.5));
  const currentPosRef = useRef(new THREE.Vector3(2.4, -0.7, -0.5));
  const targetRotRef = useRef(new THREE.Euler(0.15, -0.3, 0.05));
  const currentRotRef = useRef(new THREE.Euler(0.15, -0.3, 0.05));
  const targetScaleRef = useRef(1.05);
  const currentScaleRef = useRef(1.05);
  const prefersReducedMotionRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;
    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Detect software WebGL as per guidelines
  const isSoftwareGl = (() => {
    if (typeof document === 'undefined') return true;
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();

  // Track window scroll to calculate glide target
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
      scrollProgressRef.current = progress;

      const isMobile = window.innerWidth < 768;

      if (isMobile) {
        // On mobile, position lower down with gentle scale
        targetPosRef.current.set(1.2, -0.9, -0.8);
        targetScaleRef.current = 0.8;
        targetRotRef.current.y = progress * Math.PI * 3;
        return;
      }

      // Responsive gliding choreography across portfolio sections
      if (progress < 0.12) {
        // Hero Section: Lower right, partly behind the photo, clear of face
        targetPosRef.current.set(2.4, -0.7, -0.5);
        targetRotRef.current.set(0.15, -0.3 + progress * 2, 0.05);
        targetScaleRef.current = 1.05;
      } else if (progress < 0.32) {
        // About Section: Glides smoothly to stage left
        targetPosRef.current.set(-2.2, -0.1, 0.2);
        targetRotRef.current.set(0.15, 0.6 + progress * 2, -0.1);
        targetScaleRef.current = 1.15;
      } else if (progress < 0.50) {
        // Area of Interest: Glides to right flank
        targetPosRef.current.set(2.3, 0.0, -0.1);
        targetRotRef.current.set(0.25, -0.7 + progress * 2, 0.0);
        targetScaleRef.current = 1.15;
      } else if (progress < 0.70) {
        // Academics & Skills: Glides smoothly to left
        targetPosRef.current.set(-2.1, -0.1, 0.2);
        targetRotRef.current.set(0.1, 0.4 + progress * 2, 0.05);
        targetScaleRef.current = 1.1;
      } else if (progress < 0.88) {
        // Achievements & Hobbies: Right flank
        targetPosRef.current.set(2.2, 0.0, 0);
        targetRotRef.current.set(0.2, 1.2 + progress * 1.5, -0.05);
        targetScaleRef.current = 1.05;
      } else {
        // Contact & Footer: Lower subtle resting position
        targetPosRef.current.set(0, -0.4, -0.5);
        targetRotRef.current.set(0.1, progress * 4, 0);
        targetScaleRef.current = 0.95;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Main Three.js setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Balanced Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.3);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x60c1e5, 1.2);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    // 4. Procedural Anatomical 3D Brain Construction
    const brainGroup = new THREE.Group();
    scene.add(brainGroup);
    brainGroupRef.current = brainGroup;

    // Lobe colors using ColorHunt palette & biological luminescence
    const lobeColors = {
      frontal: new THREE.Color(0x60c1e5), // Vibrant Cyan (#60C1E5)
      parietal: new THREE.Color(0xa0e0ef), // Ice Blue (#A0E0EF)
      occipital: new THREE.Color(0x005a9c), // Sapphire (#005A9C)
      temporal: new THREE.Color(0x38bdf8), // Sky Blue
      brainstem: new THREE.Color(0x1b365d), // Deep Navy (#1B365D)
    };

    const lobePointPositions: { [key: string]: number[] } = {
      frontal: [],
      parietal: [],
      occipital: [],
      temporal: [],
      brainstem: [],
    };

    const classifyLobe = (x: number, y: number, z: number): 'frontal' | 'parietal' | 'occipital' | 'temporal' | 'brainstem' => {
      if (y < -0.5 && z < 0.2) return 'brainstem';
      if (z > 0.35 && y > -0.3) return 'frontal';
      if (z < -0.55) return 'occipital';
      if (Math.abs(x) > 0.75 && y < 0.15 && z > -0.5) return 'temporal';
      if (y >= 0.25 && z <= 0.35) return 'parietal';
      if (z >= 0) return 'frontal';
      return 'temporal';
    };

    const numPoints = isSoftwareGl ? 1200 : 2600;
    const hemisphereOffsets = [-0.14, 0.14];

    hemisphereOffsets.forEach((hOffset) => {
      for (let i = 0; i < numPoints / 2; i++) {
        const theta = Math.acos(2 * Math.random() - 1);
        const phi = 2 * Math.PI * Math.random();

        let rx = 1.05 * Math.sin(theta) * Math.cos(phi);
        let ry = 1.15 * Math.sin(theta) * Math.sin(phi);
        let rz = 1.45 * Math.cos(theta);

        if (rz > 0.8) {
          rx *= 0.85;
          ry *= 0.9;
        } else if (rz < -0.7) {
          rx *= 0.75;
          ry *= 0.85;
        }

        if (rz > -0.4 && rz < 0.4 && ry < 0.1) {
          rx *= 1.18;
        }

        const gyriFreq = 7.5;
        const gyriNoise =
          Math.sin(rx * gyriFreq) * Math.cos(ry * gyriFreq) * Math.sin(rz * gyriFreq) * 0.09;
        
        rx += gyriNoise;
        ry += gyriNoise;
        rz += gyriNoise;

        const x = rx * 0.9 + hOffset;
        const y = ry * 0.9;
        const z = rz * 0.9;

        const lobe = classifyLobe(x, y, z);
        lobePointPositions[lobe].push(x, y, z);
      }
    });

    // Stem cluster
    const stemPoints = isSoftwareGl ? 250 : 500;
    for (let i = 0; i < stemPoints; i++) {
      const u = Math.random();
      const v = Math.random() * Math.PI * 2;
      const sy = -0.5 - u * 0.75;
      const sRadius = 0.28 + (1 - u) * 0.35 * Math.sin(v * 2);
      const sx = Math.cos(v) * sRadius * 1.1;
      const sz = -0.3 + Math.sin(v) * sRadius * 0.9;
      lobePointPositions.brainstem.push(sx, sy, sz);
    }

    // Add particle clouds and connecting axons for each lobe
    Object.keys(lobePointPositions).forEach((lobeKey) => {
      const coords = lobePointPositions[lobeKey];
      if (!coords || coords.length === 0) return;

      const pGeom = new THREE.BufferGeometry();
      pGeom.setAttribute('position', new THREE.Float32BufferAttribute(coords, 3));

      const pMat = new THREE.PointsMaterial({
        color: lobeColors[lobeKey as keyof typeof lobeColors],
        size: isSoftwareGl ? 0.035 : 0.026,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const pSystem = new THREE.Points(pGeom, pMat);
      brainGroup.add(pSystem);

      // Nerve tract fibers
      const linePositions: number[] = [];
      const step = isSoftwareGl ? 12 : 7;
      for (let i = 0; i < coords.length - step * 3; i += step * 3) {
        const x1 = coords[i];
        const y1 = coords[i + 1];
        const z1 = coords[i + 2];

        const x2 = coords[i + step * 3];
        const y2 = coords[i + step * 3 + 1];
        const z2 = coords[i + step * 3 + 2];

        const distSq = (x1 - x2) ** 2 + (y1 - y2) ** 2 + (z1 - z2) ** 2;
        if (distSq < 0.25) {
          linePositions.push(x1, y1, z1, x2, y2, z2);
        }
      }

      if (linePositions.length > 0) {
        const lineGeom = new THREE.BufferGeometry();
        lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({
          color: lobeColors[lobeKey as keyof typeof lobeColors],
          transparent: true,
          opacity: 0.25,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const lines = new THREE.LineSegments(lineGeom, lineMat);
        brainGroup.add(lines);
      }
    });

    // Frosted glass outer perimeter hull
    const glassHullGeom = new THREE.SphereGeometry(1.5, 24, 20);
    glassHullGeom.scale(1.05, 1.1, 1.35);
    const glassHullMat = new THREE.MeshPhysicalMaterial({
      color: 0x005a9c,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const glassHull = new THREE.Mesh(glassHullGeom, glassHullMat);
    brainGroup.add(glassHull);

    // 5. Render Loop with Smooth Damping
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      if (prefersReducedMotionRef.current) {
        // Under reduced motion: snap smoothly to scroll position without rotational spinning or bobbing
        currentPosRef.current.copy(targetPosRef.current);
        currentRotRef.current.copy(targetRotRef.current);
        currentScaleRef.current = targetScaleRef.current;

        brainGroup.position.copy(currentPosRef.current);
        brainGroup.scale.setScalar(currentScaleRef.current);
        brainGroup.rotation.copy(currentRotRef.current);
      } else {
        currentPosRef.current.x = THREE.MathUtils.damp(currentPosRef.current.x, targetPosRef.current.x, 3.5, delta);
        currentPosRef.current.y = THREE.MathUtils.damp(currentPosRef.current.y, targetPosRef.current.y, 3.5, delta);
        currentPosRef.current.z = THREE.MathUtils.damp(currentPosRef.current.z, targetPosRef.current.z, 3.5, delta);

        currentRotRef.current.x = THREE.MathUtils.damp(currentRotRef.current.x, targetRotRef.current.x, 3.0, delta);
        currentRotRef.current.y = THREE.MathUtils.damp(currentRotRef.current.y, targetRotRef.current.y, 3.0, delta);
        currentRotRef.current.z = THREE.MathUtils.damp(currentRotRef.current.z, targetRotRef.current.z, 3.0, delta);

        currentScaleRef.current = THREE.MathUtils.damp(currentScaleRef.current, targetScaleRef.current, 3.0, delta);

        brainGroup.position.copy(currentPosRef.current);
        brainGroup.scale.setScalar(currentScaleRef.current);

        brainGroup.rotation.x = currentRotRef.current.x + Math.sin(elapsed * 0.4) * 0.04;
        brainGroup.rotation.y = currentRotRef.current.y + elapsed * 0.2;
        brainGroup.rotation.z = currentRotRef.current.z + Math.cos(elapsed * 0.3) * 0.03;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [isSoftwareGl]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
