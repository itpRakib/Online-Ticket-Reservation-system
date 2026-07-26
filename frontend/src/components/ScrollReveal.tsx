'use client';

import { motion, useReducedMotion, Variants } from 'framer-motion';
import React, { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  staggerChildren?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.5,
  staggerChildren,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const getDirectionOffset = () => {
    switch (direction) {
      case 'up': return { y: 20, x: 0 };
      case 'down': return { y: -20, x: 0 };
      case 'left': return { x: 20, y: 0 };
      case 'right': return { x: -20, y: 0 };
      case 'none': return { x: 0, y: 0 };
      default: return { y: 20, x: 0 };
    }
  };

  const offset = getDirectionOffset();

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : offset.x,
      y: shouldReduceMotion ? 0 : offset.y,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: 'easeOut',
        staggerChildren,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
