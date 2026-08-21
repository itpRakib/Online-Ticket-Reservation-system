'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, ShieldCheck, Cpu, Zap, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#090014] text-[#E0E0E0] relative z-10 pt-16 pb-12 border-t-2 border-t-[#FF00FF] border-b border-b-[#00FFFF] shadow-[0_-5px_30px_rgba(255,0,255,0.25)] font-mono">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center h-10 w-10 border-2 border-[#FF00FF] bg-[#1a103c] text-[#00FFFF] shadow-[0_0_15px_#FF00FF]">
                <Terminal className="h-5 w-5 text-[#00FFFF]" />
              </div>
              <span className="text-xl font-black uppercase tracking-wider font-heading gradient-text-sunset drop-shadow-neon-magenta">
                &gt; BD GOTICKET_
              </span>
            </div>

            <p className="text-xs text-[#E0E0E0]/70 max-w-sm leading-relaxed tracking-wide">
              Synthwave &amp; Outrun multi-modal transit matrix reservation hub for Bangladesh. Book Bus, Train, and Flight tickets seamlessly with instant Gmail OTP verification.
            </p>

            <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 border border-[#00FFFF] bg-[#1a103c] text-xs font-mono text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.3)]">
              <Activity className="h-3.5 w-3.5 text-[#FF9900] animate-pulse" />
              <span>MATRIX STATUS: ALL NODES ONLINE [2088]</span>
            </div>
          </div>

          {/* Column I: Transit Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#00FFFF] uppercase tracking-wider font-heading drop-shadow-[0_0_5px_#00FFFF] border-b border-[#FF00FF]/40 pb-2">
              // TRANSIT MODES
            </h4>
            <ul className="space-y-2 text-xs text-[#E0E0E0]/80">
              <li>
                <Link href="/search?transport_type=BUS" className="hover:text-[#00FFFF] hover:drop-shadow-[0_0_5px_#00FFFF] transition-all flex items-center space-x-1">
                  <span>&gt; LUXURY BUS COACHES</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=TRAIN" className="hover:text-[#FF9900] hover:drop-shadow-[0_0_5px_#FF9900] transition-all flex items-center space-x-1">
                  <span>&gt; BANGLADESH RAILWAY</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=PLANE" className="hover:text-[#FF00FF] hover:drop-shadow-[0_0_5px_#FF00FF] transition-all flex items-center space-x-1">
                  <span>&gt; AIRLINES MATRIX</span>
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#00FFFF] hover:drop-shadow-[0_0_5px_#00FFFF] transition-all flex items-center space-x-1">
                  <span>&gt; SEAT MATRIX &amp; OTP</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column II: Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FF00FF] uppercase tracking-wider font-heading drop-shadow-[0_0_5px_#FF00FF] border-b border-[#00FFFF]/40 pb-2">
              // PORTAL ACCESS
            </h4>
            <ul className="space-y-2 text-xs text-[#E0E0E0]/80">
              <li>
                <Link href="/search" className="hover:text-[#00FFFF] transition-colors">
                  &gt; SEARCH MATRIX
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#FF00FF] transition-colors">
                  &gt; GMAIL OTP VERIFY
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#FF9900] transition-colors">
                  &gt; PASSENGER LOGIN
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#00FFFF] transition-colors">
                  &gt; REGISTER TERMINAL
                </Link>
              </li>
            </ul>
          </div>

          {/* Column III: Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#FF9900] uppercase tracking-wider font-heading drop-shadow-[0_0_5px_#FF9900] border-b border-[#FF00FF]/40 pb-2">
              // SECURITY PROTOCOL
            </h4>
            <div className="space-y-2 text-xs text-[#E0E0E0]/80">
              <div className="flex items-center space-x-2 text-[#00FFFF]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#00FFFF]" />
                <span className="font-bold">&gt; GMAIL OTP 2FA</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#E0E0E0]/60">
                Encrypted multi-factor seat allocation verified across all Bangladesh transport routes.
              </p>
            </div>
          </div>

        </div>

        {/* Outrun Laser Divider */}
        <div className="h-[2px] w-full bg-gradient-to-r from-[#FF9900] via-[#FF00FF] to-[#00FFFF]" />

        {/* Bottom Copyright & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#E0E0E0]/60 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} BD GOTICKET // VAPORWAVE MATRIX 2088</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-[#00FFFF] transition-colors">&gt; PRIVACY</Link>
            <Link href="/terms" className="hover:text-[#FF00FF] transition-colors">&gt; TERMS</Link>
            <span className="text-[#FF9900] font-bold">BANGLADESH 🇧🇩</span>
          </div>
        </div>

      </div>
    </footer>
  );
};



