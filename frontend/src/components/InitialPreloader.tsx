'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles, Bus, Train, Plane, ArrowRight, ShieldCheck } from 'lucide-react';

export const InitialPreloader: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing BD Transit Matrix...');

  useEffect(() => {
    // Only show opening preloader once per session
    if (typeof window !== 'undefined' && sessionStorage.getItem('preloader_shown')) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 40) {
          setStatusText('Loading Bus, Train & Flight Registries...');
          return prev + 10;
        } else if (prev < 80) {
          setStatusText('Verifying NID & Gmail OTP Security Protocols...');
          return prev + 15;
        } else if (prev < 95) {
          setStatusText('Transit Matrix Calibrated!');
          return prev + 10;
        } else {
          return 100;
        }
      });
    }, 45);

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('preloader_shown', 'true');
      }
      setLoading(false);
    }, 550);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('preloader_shown', 'true');
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.02, 
            filter: 'blur(8px)',
            transition: { duration: 0.45, ease: 'easeOut' } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fdfbf7] text-[#2d2d2d] select-none overflow-hidden pattern-paper-dots"
        >
          {/* Animated Background Doodled Rays */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#2d2d2d_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Central Sketchbook Glass Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative w-[90vw] max-w-md bg-white border-[3.5px] border-[#2d2d2d] p-8 shadow-[8px_8px_0px_#2d2d2d] -rotate-1 text-center space-y-6 wobbly-box"
          >
            {/* Top Tape Strip */}
            <div className="tape-strip" />

            {/* Floating Vehicle Icons Row */}
            <div className="flex items-center justify-center space-x-4 pt-2">
              <motion.div 
                animate={{ y: [0, -4, 0] }} 
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="p-3 border-[2.5px] border-[#2d2d2d] bg-[#fff9c4] wobbly-box shadow-[3px_3px_0px_#2d2d2d]"
              >
                <Bus className="h-6 w-6 text-[#ff4d4d]" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, -6, 0] }} 
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: 0.2 }}
                className="p-3 border-[2.5px] border-[#2d2d2d] bg-[#e3f2fd] wobbly-box shadow-[3px_3px_0px_#2d2d2d]"
              >
                <Train className="h-6 w-6 text-[#2d5da1]" />
              </motion.div>
              <motion.div 
                animate={{ y: [0, -5, 0] }} 
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.4 }}
                className="p-3 border-[2.5px] border-[#2d2d2d] bg-[#e8f5e9] wobbly-box shadow-[3px_3px_0px_#2d2d2d]"
              >
                <Plane className="h-6 w-6 text-[#2e7d32]" />
              </motion.div>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-1.5">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#ff4d4d] text-white font-extrabold text-xs tracking-wider uppercase border-[2px] border-[#2d2d2d] wobbly-badge shadow-[2px_2px_0px_#2d2d2d]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Bangladesh Multi-Modal Transit</span>
              </span>

              <h1 className="text-3xl font-black font-heading text-[#2d2d2d] tracking-tight">
                BD GoTicket
              </h1>
              <p className="text-sm font-bold text-[#2d2d2d]/70 font-body">
                Inter-district Bus, Railway & Flight Reservations
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-2.5 pt-2">
              <div className="h-3 w-full border-[2.5px] border-[#2d2d2d] bg-[#fdfbf7] p-0.5 wobbly-box overflow-hidden shadow-[2px_2px_0px_#2d2d2d]">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#ff4d4d] via-[#2d5da1] to-[#2e7d32]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              {/* Status and Percentage Display */}
              <div className="flex items-center justify-between text-xs font-bold font-mono text-[#2d2d2d]">
                <span className="truncate max-w-[240px] text-[#2d5da1]">{statusText}</span>
                <span className="text-[#ff4d4d]">{progress}%</span>
              </div>
            </div>

            {/* Instant Enter Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleSkip}
                className="w-full hand-btn-primary py-2.5 text-base flex items-center justify-center space-x-2"
              >
                <span>Enter Ticket Matrix</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom Security Note */}
            <div className="flex items-center justify-center space-x-1.5 text-xs text-[#2d2d2d]/60 font-bold border-t border-dashed border-[#2d2d2d]/30 pt-3">
              <ShieldCheck className="h-4 w-4 text-[#2e7d32]" />
              <span>NID Cross-Verified & Gmail OTP Protected</span>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
