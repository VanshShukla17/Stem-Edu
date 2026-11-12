import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

/**
 * PendulumSimulation
 * 
 * Interactive 3D Virtual Physics Lab using Three.js with full 2D Canvas fallback.
 * Implements small-angle simple harmonic motion physics:
 *   T = 2π * √(L / g)
 *   ω = √(g / L)
 *   θ(t) = θ₀ * cos(ω * t)
 */
export default function PendulumSimulation({
  length = 1.0,         // String length L in meters (0.2 to 2.0)
  mass = 0.2,           // Bob mass m in kg (0.05 to 1.0)
  gravity = 9.80,       // Acceleration due to gravity g in m/s²
  initialAngle = 12,    // Initial release angle θ₀ in degrees
  isRunning = true,     // Simulation play/pause state
  isSlowMotion = false, // 0.5x time dilation toggle
  onReadoutUpdate       // Callback to parent with real-time stats (T, cycles, angle, time)
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null); // Fallback 2D canvas

  const [hasWebGL, setHasWebGL] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Simulation physics state mutable refs (avoids re-initializing Three.js on every frame)
  const simTimeRef = useRef(0);
  const lastTimestampRef = useRef(null);
  const currentAngleRef = useRef(initialAngle * (Math.PI / 180));
  const isDraggingRef = useRef(false);

  // Three.js object references
  const threeStateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    pendulumGroup: null,
    stringMesh: null,
    bobMesh: null,
    animFrameId: null
  });

  // Calculate theoretical period T
  const period = 2 * Math.PI * Math.sqrt(length / Math.max(0.1, gravity));
  const omega = Math.sqrt(gravity / Math.max(0.1, length));

  // Detect WebGL support on mount
  useEffect(() => {
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  // Update dynamic meshes when length or mass changes
  useEffect(() => {
    const { stringMesh, bobMesh } = threeStateRef.current;
    if (stringMesh && bobMesh) {
      // Re-scale string geometry based on length
      // Visual scale: 1 meter = 1.4 Three.js scene units
      const visualLength = length * 1.4;
      stringMesh.geometry.dispose();
      stringMesh.geometry = new THREE.CylinderGeometry(0.012, 0.012, visualLength, 16);
      stringMesh.position.set(0, -visualLength / 2, 0);

      // Re-scale bob geometry based on mass (r ∝ m^(1/3))
      const visualRadius = 0.12 * Math.pow(mass / 0.2, 1 / 3);
      bobMesh.geometry.dispose();
      bobMesh.geometry = new THREE.SphereGeometry(visualRadius, 32, 32);
      bobMesh.position.set(0, -visualLength, 0);
    }
  }, [length, mass]);

  // Handle Initial Angle adjustment from props
  useEffect(() => {
    if (!isDraggingRef.current) {
      currentAngleRef.current = initialAngle * (Math.PI / 180);
      simTimeRef.current = 0;
    }
  }, [initialAngle]);

  // -------------------------------------------------------------
  // THREE.JS 3D SCENE SETUP & ANIMATION LOOP
  // -------------------------------------------------------------
  useEffect(() => {
    if (!hasWebGL || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 300;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 4.2);
    camera.lookAt(0, -0.3, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous children and append
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 5, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 0.8, 10);
    rimLight.position.set(-3, -1, 2);
    scene.add(rimLight);

    // 5. Ceiling Mount & Stand
    const pivotY = 1.4;
    const mountGeo = new THREE.BoxGeometry(1.6, 0.1, 0.4);
    const mountMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const mountMesh = new THREE.Mesh(mountGeo, mountMat);
    mountMesh.position.set(0, pivotY + 0.05, 0);
    scene.add(mountMesh);

    // Pivot Pin
    const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 16);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const pinMesh = new THREE.Mesh(pinGeo, pinMat);
    pinMesh.rotation.x = Math.PI / 2;
    pinMesh.position.set(0, pivotY, 0);
    scene.add(pinMesh);

    // Subtle Angle Reference Arc on Background
    const arcRadius = 1.6;
    const arcPoints = [];
    for (let a = -30; a <= 30; a += 2) {
      const rad = (a * Math.PI) / 180;
      arcPoints.push(new THREE.Vector3(arcRadius * Math.sin(rad), pivotY - arcRadius * Math.cos(rad), -0.1));
    }
    const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const arcMat = new THREE.LineBasicMaterial({ color: 0x1e293b, linewidth: 2 });
    const arcLine = new THREE.Line(arcGeo, arcMat);
    scene.add(arcLine);

    // Vertical Equilibrium Plumb Line (Dashed)
    const plumbPoints = [
      new THREE.Vector3(0, pivotY, -0.05),
      new THREE.Vector3(0, pivotY - 2.8, -0.05)
    ];
    const plumbGeo = new THREE.BufferGeometry().setFromPoints(plumbPoints);
    const plumbMat = new THREE.LineDashedMaterial({ color: 0x475569, dashSize: 0.08, gapSize: 0.05 });
    const plumbLine = new THREE.Line(plumbGeo, plumbMat);
    plumbLine.computeLineDistances();
    scene.add(plumbLine);

    // 6. Pendulum Group (Pivoting at (0, pivotY, 0))
    const pendulumGroup = new THREE.Group();
    pendulumGroup.position.set(0, pivotY, 0);

    const visualLength = length * 1.4;
    const stringGeo = new THREE.CylinderGeometry(0.012, 0.012, visualLength, 16);
    const stringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const stringMesh = new THREE.Mesh(stringGeo, stringMat);
    stringMesh.position.set(0, -visualLength / 2, 0);
    pendulumGroup.add(stringMesh);

    const visualRadius = 0.12 * Math.pow(mass / 0.2, 1 / 3);
    const bobGeo = new THREE.SphereGeometry(visualRadius, 32, 32);
    const bobMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Cyan-400
      metalness: 0.85,
      roughness: 0.2
    });
    const bobMesh = new THREE.Mesh(bobGeo, bobMat);
    bobMesh.position.set(0, -visualLength, 0);
    bobMesh.castShadow = true;
    pendulumGroup.add(bobMesh);

    scene.add(pendulumGroup);

    // Save Three.js instance refs
    threeStateRef.current = {
      scene,
      camera,
      renderer,
      pendulumGroup,
      stringMesh,
      bobMesh,
      animFrameId: null
    };

    // 7. Render Loop with Exact Analytical Physics
    let lastTime = performance.now();

    const animate = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isDraggingRef.current && isRunning) {
        const speed = isSlowMotion ? 0.5 : 1.0;
        // Clamp dt to avoid time skipping when tab is blurred
        const clampedDt = Math.min(dt, 0.1) * speed;
        simTimeRef.current += clampedDt;

        // Analytical Harmonic Oscillation: θ(t) = θ₀ * cos(ω * t)
        const currentOmega = Math.sqrt(gravity / Math.max(0.1, length));
        const theta0 = initialAngle * (Math.PI / 180);
        const theta = theta0 * Math.cos(currentOmega * simTimeRef.current);

        currentAngleRef.current = theta;
        pendulumGroup.rotation.z = -theta; // Three.js rotates clockwise on negative Z

        // Send real-time updates to parent HUD
        if (onReadoutUpdate) {
          const currentT = 2 * Math.PI * Math.sqrt(length / Math.max(0.1, gravity));
          const cycles = Math.floor(simTimeRef.current / currentT);
          const angleDeg = (theta * (180 / Math.PI)).toFixed(1);
          onReadoutUpdate({
            period: currentT.toFixed(3),
            cycles,
            angleDeg,
            simTime: simTimeRef.current.toFixed(2)
          });
        }
      } else if (isDraggingRef.current) {
        pendulumGroup.rotation.z = -currentAngleRef.current;
        if (onReadoutUpdate) {
          const currentT = 2 * Math.PI * Math.sqrt(length / Math.max(0.1, gravity));
          const angleDeg = (currentAngleRef.current * (180 / Math.PI)).toFixed(1);
          onReadoutUpdate({
            period: currentT.toFixed(3),
            cycles: 0,
            angleDeg,
            simTime: '0.00'
          });
        }
      }

      renderer.render(scene, camera);
      threeStateRef.current.animFrameId = requestAnimationFrame(animate);
    };

    threeStateRef.current.animFrameId = requestAnimationFrame(animate);

    // Responsive window resizing observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 300;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      if (threeStateRef.current.animFrameId) {
        cancelAnimationFrame(threeStateRef.current.animFrameId);
      }
      resizeObserver.disconnect();
      mountGeo.dispose();
      mountMat.dispose();
      pinGeo.dispose();
      pinMat.dispose();
      arcGeo.dispose();
      arcMat.dispose();
      plumbGeo.dispose();
      plumbMat.dispose();
      stringGeo.dispose();
      stringMat.dispose();
      bobGeo.dispose();
      bobMat.dispose();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [hasWebGL, length, mass, gravity, initialAngle, isRunning, isSlowMotion]);

  // -------------------------------------------------------------
  // 2D CANVAS FALLBACK ENGINE (For Devices Without WebGL)
  // -------------------------------------------------------------
  useEffect(() => {
    if (hasWebGL) return; // Skip if WebGL is active

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let lastTime = performance.now();

    const render2D = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Simulation physics
      if (!isDraggingRef.current && isRunning) {
        const speed = isSlowMotion ? 0.5 : 1.0;
        const clampedDt = Math.min(dt, 0.1) * speed;
        simTimeRef.current += clampedDt;

        const currentOmega = Math.sqrt(gravity / Math.max(0.1, length));
        const theta0 = initialAngle * (Math.PI / 180);
        const theta = theta0 * Math.cos(currentOmega * simTimeRef.current);
        currentAngleRef.current = theta;

        if (onReadoutUpdate) {
          const currentT = 2 * Math.PI * Math.sqrt(length / Math.max(0.1, gravity));
          onReadoutUpdate({
            period: currentT.toFixed(3),
            cycles: Math.floor(simTimeRef.current / currentT),
            angleDeg: (theta * (180 / Math.PI)).toFixed(1),
            simTime: simTimeRef.current.toFixed(2)
          });
        }
      }

      const pivotX = width / 2;
      const pivotY = 50;
      const visualPxLength = length * 110;
      const theta = currentAngleRef.current;
      const bobX = pivotX + visualPxLength * Math.sin(theta);
      const bobY = pivotY + visualPxLength * Math.cos(theta);
      const bobRadius = 14 * Math.pow(mass / 0.2, 1 / 3);

      // 1. Draw Stand & Pivot
      ctx.fillStyle = '#334155';
      ctx.fillRect(pivotX - 60, pivotY - 14, 120, 14);

      // 2. Draw Reference Plumb Line
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#475569';
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(pivotX, pivotY + 230);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Draw String
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#E2E8F0';
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(bobX, bobY);
      ctx.stroke();

      // 4. Draw Bob with Gradient Specular Shading
      const grad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, bobRadius);
      grad.addColorStop(0, '#BAE6FD');
      grad.addColorStop(0.4, '#38BDF8');
      grad.addColorStop(1, '#0284C7');

      ctx.beginPath();
      ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 4;
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Pivot Pin Circle
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();

      animId = requestAnimationFrame(render2D);
    };

    animId = requestAnimationFrame(render2D);
    return () => cancelAnimationFrame(animId);
  }, [hasWebGL, length, mass, gravity, initialAngle, isRunning, isSlowMotion]);

  // Touch and Drag handlers to interactively pull and release the bob
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const rect = (containerRef.current || canvasRef.current).getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + 50);

    let angle = Math.atan2(dx, dy);
    // Clamp to -30° to +30°
    const maxRad = (30 * Math.PI) / 180;
    angle = Math.max(-maxRad, Math.min(maxRad, angle));

    currentAngleRef.current = angle;
    simTimeRef.current = 0;
  };

  const handlePointerUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      simTimeRef.current = 0;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        backgroundColor: '#0F172A',
        borderRadius: 'var(--radius-md, 8px)',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none'
      }}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    >
      {/* 3D WebGL Canvas Container */}
      {hasWebGL ? (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      ) : (
        /* Fallback 2D HTML Canvas */
        <canvas
          ref={canvasRef}
          width={400}
          height={320}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      )}

      {/* Mode / Fallback Indicator Badge */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: '600',
          backgroundColor: hasWebGL ? 'rgba(30, 41, 59, 0.85)' : 'rgba(234, 88, 12, 0.9)',
          color: '#F8FAFC',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none'
        }}
      >
        {hasWebGL ? '⚡ Three.js 3D WebGL' : '⚠️ 2D Canvas Fallback'}
      </div>

      {/* Touch Interaction Hint */}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          fontSize: '0.72rem',
          color: '#94A3B8',
          pointerEvents: 'none',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          padding: '3px 8px',
          borderRadius: '4px'
        }}
      >
        👆 Drag bob to release • Small angle SHM
      </div>
    </div>
  );
}
