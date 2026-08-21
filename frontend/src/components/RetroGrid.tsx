'use client';

import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface RetroGridProps {
  className?: string;
  opacity?: number;
}

export const RetroGrid: React.FC<RetroGridProps> = ({ opacity = 0.5 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Hand-drawn doodle particles
    const doodles = Array.from({ length: 25 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      type: Math.floor(Math.random() * 3), // 0: dot, 1: cross, 2: circle
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      rotation: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw hand-drawn floating sketch doodles
      doodles.forEach((doodle) => {
        doodle.x += doodle.speedX;
        doodle.y += doodle.speedY;

        if (doodle.x < 0) doodle.x = width;
        if (doodle.x > width) doodle.x = 0;
        if (doodle.y < 0) doodle.y = height;
        if (doodle.y > height) doodle.y = 0;

        ctx.strokeStyle = 'rgba(45, 45, 45, 0.15)';
        ctx.fillStyle = 'rgba(45, 45, 45, 0.15)';
        ctx.lineWidth = 1.5;

        if (doodle.type === 0) {
          // Pencil dot
          ctx.beginPath();
          ctx.arc(doodle.x, doodle.y, doodle.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (doodle.type === 1) {
          // Hand-drawn cross +
          ctx.beginPath();
          ctx.moveTo(doodle.x - doodle.size * 2, doodle.y);
          ctx.lineTo(doodle.x + doodle.size * 2, doodle.y);
          ctx.moveTo(doodle.x, doodle.y - doodle.size * 2);
          ctx.lineTo(doodle.x, doodle.y + doodle.size * 2);
          ctx.stroke();
        } else {
          // Hand-drawn sketchy circle
          ctx.beginPath();
          ctx.arc(doodle.x, doodle.y, doodle.size * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
};
