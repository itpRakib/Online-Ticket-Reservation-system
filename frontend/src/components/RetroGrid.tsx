'use client';

import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

interface RetroGridProps {
  className?: string;
  opacity?: number;
}

export const RetroGrid: React.FC<RetroGridProps> = ({
  className = '',
  opacity = 0.35,
}) => {
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
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    const horizonY = height * 0.55;
    const speed = 0.07;
    let offset = 0;

    // Stars
    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
    }
    const stars: Star[] = [];
    const starCount = 50;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * horizonY,
        size: Math.random() * 2.0 + 0.5,
        alpha: Math.random(),
        speed: 0.05 + Math.random() * 0.15,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background horizon glow
      const gradientSun = ctx.createRadialGradient(
        width / 2,
        horizonY,
        0,
        width / 2,
        horizonY,
        width * 0.45
      );
      gradientSun.addColorStop(0, 'rgba(51, 255, 0, 0.15)');
      gradientSun.addColorStop(0.5, 'rgba(255, 176, 0, 0.05)');
      gradientSun.addColorStop(1, 'transparent');

      ctx.fillStyle = gradientSun;
      ctx.beginPath();
      ctx.arc(width / 2, horizonY, width * 0.45, 0, Math.PI, true);
      ctx.fill();

      // Draw phosphor dots
      stars.forEach((star) => {
        star.alpha += star.speed * 0.04;
        if (star.alpha > 1) {
          star.alpha = 0;
          star.x = Math.random() * width;
        }
        ctx.fillStyle = `rgba(51, 255, 0, ${Math.sin(star.alpha) * 0.75})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw horizon line
      ctx.strokeStyle = 'rgba(51, 255, 0, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();

      // Draw receding grid lines
      const gridY = horizonY;
      const viewHeight = height - gridY;

      offset = (offset + speed) % 1;

      const colorGreen = 'rgba(51, 255, 0, 0.35)';

      // Vertical Lines
      const verticalLineCount = 36;
      const spacingX = width / (verticalLineCount - 8);
      for (let i = 0; i < verticalLineCount; i++) {
        const xOffset = (i - (verticalLineCount - 1) / 2) * spacingX;
        const startX = width / 2 + xOffset * 0.03;
        const endX = width / 2 + xOffset * 1.7;

        ctx.strokeStyle = colorGreen;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, gridY);
        ctx.lineTo(endX, height);
        ctx.stroke();
      }

      // Horizontal Lines
      const horizontalLineCount = 14;
      for (let i = 0; i < horizontalLineCount; i++) {
        const progress = (i + offset) / horizontalLineCount;
        const y = gridY + Math.pow(progress, 2.5) * viewHeight;
        const lineOpacity = Math.min(0.8, progress * 1.3);

        ctx.strokeStyle = `rgba(31, 82, 31, ${lineOpacity * 0.8})`;
        ctx.lineWidth = 1;
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
    return null;
  }

  return (
    <div 
      className={`absolute inset-0 pointer-events-none -z-10 overflow-hidden ${className}`}
      style={{ opacity: theme === 'dark' ? opacity : opacity * 0.4 }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Soft gradient mask overlaying grid bottom to fade it cleanly */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--bg-deep)] pointer-events-none" />
    </div>
  );
};
