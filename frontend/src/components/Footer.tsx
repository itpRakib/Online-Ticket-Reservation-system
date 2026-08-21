'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, ShieldCheck, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0a0a0a] text-[#33ff00] relative z-10 pt-12 pb-10 border-t border-[#1f521f] font-mono text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center h-8 w-8 border border-[#33ff00] bg-[#0a0a0a] text-[#33ff00]">
                <Terminal className="h-4 w-4" />
              </div>
              <span className="text-base font-bold uppercase tracking-wider text-phosphor-green">
                [BD-GOTICKET:~$]
              </span>
            </div>

            <p className="text-xs text-[#33ff00]/70 max-w-sm leading-relaxed">
              Brutally functional Terminal CLI multi-modal transit matrix reservation mainframe for Bangladesh.
            </p>

            <div className="inline-flex items-center space-x-2 px-3 py-1 border border-[#1f521f] bg-[#0a0a0a] text-xs font-mono text-[#ffb000]">
              <Activity className="h-3.5 w-3.5 text-[#33ff00] animate-pulse" />
              <span>[ MAINFRAME STATUS: 200 OK ]</span>
            </div>
          </div>

          {/* Column I: Transit Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#ffb000] uppercase tracking-wider border-b border-[#1f521f] pb-1">
              // TRANSIT MODES
            </h4>
            <ul className="space-y-2 text-xs text-[#33ff00]/80">
              <li>
                <Link href="/search?transport_type=BUS" className="hover:text-[#33ff00] hover:underline flex items-center space-x-1">
                  <span>[01] LUXURY BUS COACHES</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=TRAIN" className="hover:text-[#ffb000] hover:underline flex items-center space-x-1">
                  <span>[02] BANGLADESH RAILWAY</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=PLANE" className="hover:text-[#33ff00] hover:underline flex items-center space-x-1">
                  <span>[03] AIRLINES MATRIX</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column II: Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#ffb000] uppercase tracking-wider border-b border-[#1f521f] pb-1">
              // PORTAL ACCESS
            </h4>
            <ul className="space-y-2 text-xs text-[#33ff00]/80">
              <li>
                <Link href="/search" className="hover:text-[#33ff00] hover:underline">
                  &gt; SEARCH MATRIX
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#ffb000] hover:underline">
                  &gt; PASSENGER LOGIN
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#33ff00] hover:underline">
                  &gt; REGISTER TERMINAL
                </Link>
              </li>
            </ul>
          </div>

          {/* Column III: Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#ffb000] uppercase tracking-wider border-b border-[#1f521f] pb-1">
              // SECURITY PROTOCOL
            </h4>
            <div className="space-y-2 text-xs text-[#33ff00]/80">
              <div className="flex items-center space-x-2 text-[#33ff00]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#33ff00]" />
                <span className="font-bold">GMAIL OTP 2FA</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#33ff00]/60">
                Multi-factor seat allocation verified across all Bangladesh transport routes.
              </p>
            </div>
          </div>

        </div>

        {/* ASCII Separator Divider */}
        <div className="text-xs text-[#1f521f] overflow-hidden whitespace-nowrap select-none font-mono">
          =================================================================================================================================
        </div>

        {/* Bottom Copyright & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#33ff00]/60 uppercase tracking-widest font-mono">
          <p>© {new Date().getFullYear()} BD GOTICKET // TERMINAL CLI v2088</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-[#33ff00] transition-colors">[ PRIVACY ]</Link>
            <Link href="/terms" className="hover:text-[#33ff00] transition-colors">[ TERMS ]</Link>
            <span className="text-[#ffb000] font-bold">BANGLADESH 🇧🇩</span>
          </div>
        </div>

      </div>
    </footer>
  );
};




