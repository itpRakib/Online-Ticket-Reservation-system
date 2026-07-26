'use client';

import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export const PlexusBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { theme } = useTheme();

  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * dpr;
      height = canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Node particle definition
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      pulse: number;
    }

    const particles: Node[] = [];
    const particleCount = Math.min(110, Math.floor((window.innerWidth * window.innerHeight) / 13000));

    const canvasWidth = canvas.offsetWidth;
    const canvasHeight = canvas.offsetHeight;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.6 + 0.8,
        pulse: Math.random() * Math.PI * 2
      });
    }

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const currentTheme = themeRef.current;
      const isDark = currentTheme === 'dark';

      // Theme-adaptive drawing configurations
      const nodeColor = isDark
        ? 'rgba(0, 240, 255, 0.35)'   // Dark: Glowing Cyan
        : 'rgba(37, 99, 235, 0.25)';  // Light: Cobalt Blue

      const lineStrokeTemplate = isDark
        ? 'rgba(0, 240, 255, ALPHA)'  // Dark: Neon Cyan line
        : 'rgba(37, 99, 235, ALPHA)'; // Light: Cobalt Blue line

      const maxOpacity = isDark ? 0.18 : 0.12;

      // Draw all nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;

        // Bounce borders
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));

        // Mouse attraction/repel interaction
        if (mouse.x > 0) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelRadius = 150;

          if (dist < repelRadius) {
            const force = (repelRadius - dist) / repelRadius;
            const angle = Math.atan2(dy, dx);
            p.x += Math.cos(angle) * force * 2.0;
            p.y += Math.sin(angle) * force * 2.0;
          }
        }

        // Pulse size
        const currentRadius = p.radius + Math.sin(p.pulse) * 0.4;

        // Draw particle dot with glow
        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting lines
      const connectionDist = 140;
      ctx.lineWidth = 0.6;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const pA = particles[i];
          const pB = particles[j];

          const dx = pA.x - pB.x;
          const dy = pA.y - pB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * maxOpacity;
            ctx.strokeStyle = lineStrokeTemplate.replace('ALPHA', String(alpha));
            ctx.beginPath();
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return (
      <div className="fixed inset-0 pointer-events-none -z-50 bg-[var(--bg-deep)]">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/10 via-transparent to-fuchsia-950/10 opacity-70" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-50 w-full h-full overflow-hidden bg-[var(--bg-deep)]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Light leak radial masks with theme-aware variations */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,var(--accent-glow)_0%,transparent_70%)] pointer-events-none transition-all duration-500 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,var(--secondary-glow)_0%,transparent_70%)] pointer-events-none transition-all duration-500 animate-pulse" />
    </div>
  );
};
