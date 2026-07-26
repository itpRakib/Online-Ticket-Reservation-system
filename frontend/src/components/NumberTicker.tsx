'use client';

import { useInView, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface NumberTickerProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export const NumberTicker = ({
  value,
  duration = 2,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}: NumberTickerProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      let formatted: string;
      if (latest >= 1000 && decimals > 0) {
        // e.g., 15200 -> 15.2
        formatted = (latest / 1000).toFixed(decimals);
      } else {
        formatted = Math.floor(latest).toLocaleString();
      }
      setDisplayValue(formatted);
    });
  }, [springValue, decimals]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};
