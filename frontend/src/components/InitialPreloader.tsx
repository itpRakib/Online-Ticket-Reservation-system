'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Sparkles } from 'lucide-react';

export const InitialPreloader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing Transit Matrix...');

  useEffect(() => {
    // Smooth progress counter simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 35) {
          setStatusText('Loading Bangladesh Station Registries...');
          return prev + 4;
        } else if (prev < 70) {
          setStatusText('Syncing Telemetry & Security Protocols...');
          return prev + 6;
        } else if (prev < 95) {
          setStatusText('Calibrating Route Matrix...');
          return prev + 3;
        } else {
          setStatusText('Matrix Ready');
          return 100;
        }
      });
    }, 40);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1100);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.03, 
            filter: 'blur(12px)',
            transition: { duration: 0.55, ease: [0.65, 0, 0.35, 1] } 
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#06060D] text-white select-none overflow-hidden"
        >
          {/* Ambient Glow Orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-purple-700/30 via-indigo-600/20 to-cyan-500/20 blur-3xl pointer-events-none animate-pulse" />
          
          {/* Central Logo Box */}
          <div className="relative flex flex-col items-center space-y-6 z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative flex items-center justify-center"
            >
              {/* Outer Pulsing Ring */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 opacity-40 blur-lg animate-pulse" />
              
              {/* Brand Icon Box */}
              <div className="relative h-16 w-16 rounded-2xl bg-[#0E0C1E] border border-purple-500/30 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)] backdrop-blur-xl">
                <Ticket className="h-8 w-8 text-purple-400 transform -rotate-12 animate-bounce" />
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="text-center space-y-1"
            >
              <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                BD GoTicket
              </h2>
              <p className="text-[11px] font-mono text-purple-300/70 tracking-widest uppercase flex items-center justify-center gap-1.5">
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span>Ethereal Multi-Modal Transit</span>
              </p>
            </motion.div>

            {/* Progress Bar Container */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="w-64 space-y-3 pt-2"
            >
              <div className="h-1.5 w-full bg-[#16122C] border border-purple-500/20 rounded-full overflow-hidden p-0.5 backdrop-blur-md">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut' }}
                />
              </div>

              {/* Status and Percentage Display */}
              <div className="flex items-center justify-between text-[10px] font-mono text-purple-200/60">
                <span className="truncate max-w-[190px]">{statusText}</span>
                <span className="font-bold text-purple-400">{progress}%</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
