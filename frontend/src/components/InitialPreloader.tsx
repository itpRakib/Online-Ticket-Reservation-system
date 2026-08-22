'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles, Bus, Train, Plane, ArrowRight, ShieldCheck, CheckCircle2, Navigation, Compass } from 'lucide-react';

export const InitialPreloader: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing BD Transit Matrix...');
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    // Only show opening preloader once per session
    if (typeof window !== 'undefined' && sessionStorage.getItem('preloader_shown')) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 8;
        if (next < 35) {
          setStatusText('Syncing 26 Inter-district Bus & Railway Nodes...');
          setActiveStep(1);
          return next;
        } else if (next < 75) {
          setStatusText('Verifying NID & Gmail OTP Security Protocols...');
          setActiveStep(2);
          return next;
        } else if (next < 98) {
          setStatusText('Calibrating Route Matrix...');
          setActiveStep(3);
          return next;
        } else {
          setStatusText('Matrix Ready! Welcome to BD GoTicket');
          setActiveStep(3);
          return 100;
        }
      });
    }, 45);

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('preloader_shown', 'true');
      }
      setLoading(false);
    }, 700);

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
            scale: 1.04, 
            filter: 'blur(10px)',
            transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fdfbf7] text-[#2d2d2d] select-none overflow-hidden pattern-paper-dots"
        >
          {/* Ambient Sketch Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#2d2d2d_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

          {/* Decorative Floating Sketch Doodles in Background */}
          <motion.div 
            animate={{ rotate: [0, 360] }} 
            transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
            className="absolute top-10 left-10 pointer-events-none opacity-20"
          >
            <Compass className="h-24 w-24 text-[#2d5da1]" />
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute bottom-12 right-12 pointer-events-none opacity-20"
          >
            <Ticket className="h-28 w-28 text-[#ff4d4d] rotate-12" />
          </motion.div>

          {/* Central Sketchbook Glass Card */}
          <motion.div 
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative w-[92vw] max-w-lg bg-white border-[3.5px] border-[#2d2d2d] p-7 sm:p-9 shadow-[10px_10px_0px_#2d2d2d] -rotate-1 text-center space-y-6 wobbly-box"
          >
            {/* Top Tape Strip */}
            <div className="tape-strip" />

            {/* Brand Header */}
            <div className="space-y-2">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1 bg-[#ff4d4d] text-white font-extrabold text-xs tracking-wider uppercase border-[2px] border-[#2d2d2d] wobbly-badge shadow-[2px_2px_0px_#2d2d2d] -rotate-1"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#fff9c4]" />
                <span>Bangladesh Multi-Modal Transit</span>
              </motion.div>

              <h1 className="text-4xl font-black font-heading text-[#2d2d2d] tracking-tight">
                BD GoTicket
              </h1>
              <p className="text-sm font-bold text-[#2d2d2d]/70 font-body">
                Inter-district Bus, Railway & Flight Reservation Platform
              </p>
            </div>

            {/* Animated Vehicle Movement Track */}
            <div className="relative border-[2.5px] border-[#2d2d2d] bg-[#fdfbf7] p-4 wobbly-box shadow-[3px_3px_0px_#2d2d2d] space-y-3">
              
              <div className="flex items-center justify-between text-xs font-bold text-[#2d2d2d]">
                <span className="flex items-center space-x-1"><Navigation className="h-3.5 w-3.5 text-[#ff4d4d]" /> <span>Dhaka Hub</span></span>
                <span className="text-[#2d5da1] font-mono">26 Transit Terminals</span>
                <span className="flex items-center space-x-1"><Navigation className="h-3.5 w-3.5 text-[#2e7d32]" /> <span>Cox's Bazar / Sylhet</span></span>
              </div>

              {/* Dotted Track with Traveling Vehicles */}
              <div className="relative h-10 w-full border-t-2 border-b-2 border-dashed border-[#2d2d2d]/40 flex items-center justify-between px-2 overflow-hidden bg-white/60">
                
                {/* Moving Vehicle along progress */}
                <motion.div 
                  className="absolute z-10 flex items-center space-x-1 bg-[#fff9c4] border-[2px] border-[#2d2d2d] px-2 py-0.5 wobbly-badge shadow-[2px_2px_0px_#2d2d2d]"
                  style={{ left: `calc(${Math.min(progress, 85)}% )` }}
                  transition={{ ease: 'easeOut' }}
                >
                  {progress < 40 ? (
                    <Bus className="h-4 w-4 text-[#ff4d4d]" />
                  ) : progress < 75 ? (
                    <Train className="h-4 w-4 text-[#2d5da1]" />
                  ) : (
                    <Plane className="h-4 w-4 text-[#2e7d32]" />
                  )}
                  <span className="text-[10px] font-bold text-[#2d2d2d] font-mono">{progress}%</span>
                </motion.div>

                {/* Fixed Track Station Dots */}
                <div className="h-3 w-3 rounded-full bg-[#ff4d4d] border-[1.5px] border-[#2d2d2d]" />
                <div className="h-3 w-3 rounded-full bg-[#2d5da1] border-[1.5px] border-[#2d2d2d]" />
                <div className="h-3 w-3 rounded-full bg-[#2e7d32] border-[1.5px] border-[#2d2d2d]" />
              </div>

              {/* Dynamic Status Display */}
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-[#2d5da1] truncate max-w-[260px]">{statusText}</span>
                <span className="text-[#ff4d4d] font-extrabold">{progress}%</span>
              </div>

              {/* High-Fidelity Progress Bar */}
              <div className="h-3.5 w-full border-[2.5px] border-[#2d2d2d] bg-white p-0.5 wobbly-box overflow-hidden shadow-[2px_2px_0px_#2d2d2d]">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#ff4d4d] via-[#2d5da1] to-[#2e7d32]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Visual Step Checklist */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
              <div className={`p-2 border-[2px] border-[#2d2d2d] wobbly-badge transition-colors ${
                activeStep >= 1 ? 'bg-[#fff9c4] text-[#2d2d2d]' : 'bg-[#fdfbf7] text-[#2d2d2d]/40'
              }`}>
                <span className="block text-[10px] uppercase">Step 1</span>
                <span className="block truncate">🚌 Terminals</span>
              </div>

              <div className={`p-2 border-[2px] border-[#2d2d2d] wobbly-badge transition-colors ${
                activeStep >= 2 ? 'bg-[#e3f2fd] text-[#2d2d2d]' : 'bg-[#fdfbf7] text-[#2d2d2d]/40'
              }`}>
                <span className="block text-[10px] uppercase">Step 2</span>
                <span className="block truncate">🛡️ NID / 2FA</span>
              </div>

              <div className={`p-2 border-[2px] border-[#2d2d2d] wobbly-badge transition-colors ${
                activeStep >= 3 ? 'bg-[#e8f5e9] text-[#2d2d2d]' : 'bg-[#fdfbf7] text-[#2d2d2d]/40'
              }`}>
                <span className="block text-[10px] uppercase">Step 3</span>
                <span className="block truncate">✨ Route Ready</span>
              </div>
            </div>

            {/* Instant Enter Button */}
            <div className="pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSkip}
                className="w-full hand-btn-primary py-3 text-lg flex items-center justify-center space-x-2 shadow-[4px_4px_0px_#2d2d2d]"
              >
                <span>Enter Ticket Matrix</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Bottom Security Note */}
            <div className="flex items-center justify-center space-x-1.5 text-xs text-[#2d2d2d]/70 font-bold border-t border-dashed border-[#2d2d2d]/30 pt-3">
              <ShieldCheck className="h-4 w-4 text-[#2e7d32]" />
              <span>EC NID Database Cross-Verified & Gmail OTP Protected</span>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
