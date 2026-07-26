'use client';

import React, { useRef, useEffect, useState } from 'react';

export const FuturisticHUD: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Normalized coordinates from -1 to 1
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMouse((prev) => ({ ...prev, targetX: x, targetY: y }));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // 3D Point definition
    interface Point3D {
      x: number;
      y: number;
      z: number;
    }

    // Generate wireframe nodes (a stylized transit grid)
    const nodes: Point3D[] = [];
    const sphereRadius = Math.min(width, height) * 0.28;
    const nodeCount = 60;

    for (let i = 0; i < nodeCount; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * 2 * Math.PI;

      nodes.push({
        x: sphereRadius * Math.sin(theta) * Math.cos(phi),
        y: sphereRadius * Math.sin(theta) * Math.sin(phi),
        z: sphereRadius * Math.cos(theta),
      });
    }

    // Generate traveling data particles
    interface Particle {
      nodeA: Point3D;
      nodeB: Point3D;
      progress: number;
      speed: number;
      color: string;
    }

    const particles: Particle[] = [];
    const maxParticles = 15;

    const spawnParticle = () => {
      if (nodes.length < 2) return;
      const idxA = Math.floor(Math.random() * nodes.length);
      let idxB = Math.floor(Math.random() * nodes.length);
      while (idxA === idxB) {
        idxB = Math.floor(Math.random() * nodes.length);
      }
      particles.push({
        nodeA: nodes[idxA],
        nodeB: nodes[idxB],
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
        color: Math.random() > 0.4 ? '#00F0FF' : '#8A2BE2',
      });
    };

    // State parameters for rotation
    let angleX = 0.002;
    let angleY = 0.003;
    let curMouseX = 0;
    let curMouseY = 0;

    // Projection function
    const project = (p: Point3D, rotX: number, rotY: number, rotZ: number) => {
      // Rotation matrices
      // X-Axis
      let y1 = p.y * Math.cos(rotX) - p.z * Math.sin(rotX);
      let z1 = p.y * Math.sin(rotX) + p.z * Math.cos(rotX);
      let x1 = p.x;

      // Y-Axis
      let x2 = x1 * Math.cos(rotY) + z1 * Math.sin(rotY);
      let z2 = -x1 * Math.sin(rotY) + z1 * Math.cos(rotY);
      let y2 = y1;

      // Z-Axis
      let x3 = x2 * Math.cos(rotZ) - y2 * Math.sin(rotZ);
      let y3 = x2 * Math.sin(rotZ) + y2 * Math.cos(rotZ);
      let z3 = z2;

      // Perspective divide
      const fov = 400;
      const distance = 400;
      const scale = fov / (distance + z3);
      const projX = x3 * scale + width / 2;
      const projY = y3 * scale + height / 2;

      return { x: projX, y: projY, scale, depth: z3 };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse tracking interpolation
      curMouseX += (mouse.targetX - curMouseX) * 0.08;
      curMouseY += (mouse.targetY - curMouseY) * 0.08;

      // Dynamic tilt based on mouse position
      const rotX = curMouseY * 0.4 + angleX;
      const rotY = curMouseX * 0.4 + angleY;
      const rotZ = curMouseX * 0.15;

      angleX += 0.001;
      angleY += 0.0015;

      // Draw background cybernetic grids / ticks
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.lineWidth = 1;
      
      // Horizontal centerline HUD
      ctx.beginPath();
      ctx.moveTo(40, height / 2);
      ctx.lineTo(width - 40, height / 2);
      ctx.stroke();

      // Holographic HUD Rings (Outer Tilt)
      const ringRadius = sphereRadius * 1.35;
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(1, 0.35); // simulated perspective flat ring
      ctx.rotate(rotY * 0.5);
      
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(138, 43, 226, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius * 0.85, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();

      // Project all nodes
      const projectedNodes = nodes.map((node) => project(node, rotX, rotY, rotZ));

      // Draw lines between close nodes (wireframe grid)
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Connect node thresholds
          if (dist < sphereRadius * 0.55) {
            const nodeA = projectedNodes[i];
            const nodeB = projectedNodes[j];
            const avgDepth = (nodeA.depth + nodeB.depth) / 2;
            const opacity = Math.max(0.01, (1 - avgDepth / sphereRadius) * 0.15);

            ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(nodeA.x, nodeA.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.stroke();
          }
        }
      }

      // Draw node dots
      projectedNodes.forEach((p) => {
        const opacity = Math.max(0.1, (1 - p.depth / sphereRadius) * 0.4);
        const radius = Math.max(1, p.scale * 2.5);

        ctx.fillStyle = p.depth < 0 ? `rgba(0, 240, 255, ${opacity})` : `rgba(138, 43, 226, ${opacity * 0.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Soft outer glow on closer nodes
        if (p.depth < -sphereRadius * 0.5) {
          ctx.fillStyle = `rgba(0, 240, 255, ${opacity * 0.25})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Spawn and process traveling particles
      if (particles.length < maxParticles && Math.random() < 0.08) {
        spawnParticle();
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;
        
        if (p.progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        // Interpolated 3D position
        const current3DPt = {
          x: p.nodeA.x + (p.nodeB.x - p.nodeA.x) * p.progress,
          y: p.nodeA.y + (p.nodeB.y - p.nodeA.y) * p.progress,
          z: p.nodeA.z + (p.nodeB.z - p.nodeA.z) * p.progress,
        };

        const proj = project(current3DPt, rotX, rotY, rotZ);
        const opacity = Math.max(0.1, (1 - proj.depth / sphereRadius) * 0.85);

        ctx.fillStyle = p.color === '#00F0FF' ? `rgba(0, 240, 255, ${opacity})` : `rgba(138, 43, 226, ${opacity})`;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, Math.max(2, proj.scale * 3.5), 0, 2 * Math.PI);
        ctx.fill();

        // Particle trail
        ctx.strokeStyle = p.color === '#00F0FF' ? `rgba(0, 240, 255, ${opacity * 0.25})` : `rgba(138, 43, 226, ${opacity * 0.25})`;
        ctx.lineWidth = Math.max(1, proj.scale * 1.5);
        ctx.beginPath();
        
        // Project start of path
        const projA = project(p.nodeA, rotX, rotY, rotZ);
        ctx.moveTo(projA.x, projA.y);
        ctx.lineTo(proj.x, proj.y);
        ctx.stroke();
      }

      // Render overlay target reticles / cybernetic decorations
      ctx.lineWidth = 1;
      
      // Center HUD target reticle
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 25, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(138, 43, 226, 0.3)';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 45, 0, 2 * Math.PI);
      ctx.stroke();

      // Corner borders
      const borderLen = 15;
      const margin = 20;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(margin, margin + borderLen);
      ctx.lineTo(margin, margin);
      ctx.lineTo(margin + borderLen, margin);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(width - margin, margin + borderLen);
      ctx.lineTo(width - margin, margin);
      ctx.lineTo(width - margin - borderLen, margin);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(margin, height - margin - borderLen);
      ctx.lineTo(margin, height - margin);
      ctx.lineTo(margin + borderLen, height - margin);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(width - margin, height - margin - borderLen);
      ctx.lineTo(width - margin, height - margin);
      ctx.lineTo(width - margin - borderLen, height - margin);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [mouse]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[320px] md:min-h-[450px] relative overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      {/* Floating Holographic Telemetry Data */}
      <div className="absolute bottom-6 left-6 font-mono text-[10px] text-slate-500 space-y-1 bg-slate-950/60 p-3 rounded-lg border border-white/[0.03] backdrop-blur-sm pointer-events-none">
        <div className="flex items-center space-x-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-400 font-bold uppercase tracking-wider">Telemetry Link Online</span>
        </div>
        <div>VECTOR.ROT_X: {(mouse.targetX * 0.4).toFixed(3)}</div>
        <div>VECTOR.ROT_Y: {(mouse.targetY * 0.4).toFixed(3)}</div>
        <div>NODES.ACTIVE: 60</div>
      </div>
      <div className="absolute top-6 right-6 font-mono text-[9px] text-slate-500 uppercase tracking-widest pointer-events-none border border-slate-800/80 bg-slate-950/80 px-2 py-1 rounded">
        System Mode: <span className="text-[#00F0FF] font-bold">Orbit_Sync</span>
      </div>
    </div>
  );
};
