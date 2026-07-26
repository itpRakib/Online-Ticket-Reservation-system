'use client';

import React, { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type GlowColor = 'emerald' | 'amber' | 'indigo' | 'cyan' | 'purple' | 'none';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: GlowColor;
  intensity?: 'low' | 'medium' | 'high';
  rounded?: string;
}

const glowColors: Record<GlowColor, string> = {
  emerald: 'rgba(52, 211, 153, VAR)',
  amber: 'rgba(245, 158, 11, VAR)',
  indigo: 'rgba(99, 102, 241, VAR)',
  cyan: 'rgba(0, 240, 255, VAR)',
  purple: 'rgba(255, 0, 127, VAR)',
  none: 'transparent',
};

const intensityValues: Record<string, { base: number; hover: number; spread: string }> = {
  low:    { base: 0.04, hover: 0.07, spread: '80px' },
  medium: { base: 0.06, hover: 0.10, spread: '100px' },
  high:   { base: 0.08, hover: 0.14, spread: '120px' },
};

export const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  glowColor = 'emerald',
  intensity = 'medium',
  rounded = 'rounded-3xl',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const config = intensityValues[intensity];
  const colorTemplate = glowColors[glowColor];

  const baseGlow = colorTemplate.replace('VAR', String(config.base));
  const hoverGlow = colorTemplate.replace('VAR', String(config.hover));

  if (shouldReduceMotion || glowColor === 'none') {
    return <div className={`relative ${rounded} ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      className={`relative ${rounded} ${className}`}
      whileHover="hover"
      initial="rest"
    >
      {/* Ambient glow behind the card */}
      <motion.div
        className={`absolute -inset-px ${rounded} -z-10 blur-xl pointer-events-none`}
        variants={{
          rest: { 
            opacity: 1,
            background: `radial-gradient(ellipse at center, ${baseGlow} 0%, transparent 70%)`,
          },
          hover: { 
            opacity: 1,
            background: `radial-gradient(ellipse at center, ${hoverGlow} 0%, transparent 70%)`,
          },
        }}
        transition={{ duration: 0.4 }}
        style={{ filter: `blur(${config.spread})` }}
      />
      {children}
    </motion.div>
  );
};
