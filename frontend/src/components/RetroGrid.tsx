'use client';

import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

interface RetroGridProps {
  className?: string;
  opacity?: number;
}

export const RetroGrid: React.FC<RetroGridProps> = ({
  className = '',
  opacity = 0.22,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

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

    const horizonY = height * 0.55;
    const speed = 0.04; // Slightly slower speed for layout integration so it remains a background element
    let offset = 0;

    const colorCyan = 'rgba(0, 240, 255, 0.45)';
    const colorMagenta = 'rgba(255, 0, 127, 0.5)'; // Hot magenta for high-contrast cyber theme

    // Stars
    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
    }

    const stars: Star[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * horizonY,
        size: Math.random() * 1.2,
        alpha: 0.1 + Math.random() * 0.8,
        speed: 0.003 + Math.random() * 0.007,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Stars (Twinkle)
      stars.forEach((star) => {
        star.alpha += star.speed;
        if (star.alpha > 0.95 || star.alpha < 0.1) {
          star.speed = -star.speed;
        }
        ctx.fillStyle = `rgba(0, 240, 255, ${star.alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Horizon Glow Laser
      ctx.strokeStyle = 'rgba(138, 43, 226, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // 3. Grid Lines Moving Forward
      offset += speed;
      if (offset >= 1) {
        offset = 0;
      }

      const gridY = horizonY;
      const viewHeight = height - gridY;

      // Vertical Receding Lines
      const verticalLineCount = 30;
      const spacingX = width / (verticalLineCount - 1);

      for (let i = 0; i < verticalLineCount; i++) {
        const xOffset = (i - (verticalLineCount - 1) / 2) * spacingX;
        const startX = width / 2 + xOffset * 0.03;
        const endX = width / 2 + xOffset * 1.6;

        ctx.strokeStyle = colorCyan;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(startX, gridY);
        ctx.lineTo(endX, height);
        ctx.stroke();
      }

      // Horizontal Lines scaling exponentially
      const horizontalLineCount = 10;
      for (let i = 0; i < horizontalLineCount; i++) {
        const progress = (i + offset) / horizontalLineCount;
        const y = gridY + Math.pow(progress, 2.5) * viewHeight;
        const lineOpacity = Math.min(0.7, progress * 1.3);

        ctx.strokeStyle = `rgba(138, 43, 226, ${lineOpacity * 0.75})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) {
    return null; // Suppress animations on reduced motion preferences
  }

  return (
    <div 
      className={`absolute inset-0 pointer-events-none -z-10 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Soft gradient mask overlaying grid bottom to fade it cleanly */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-deep)] pointer-events-none" />
    </div>
  );
};
