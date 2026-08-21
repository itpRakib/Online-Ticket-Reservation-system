'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck, Sparkles, Flame } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0D0D1A] text-white relative z-10 pt-16 pb-12 border-t-8 border-[#FF3AF2] shadow-[0_-8px_30px_rgba(255,58,242,0.4)] pattern-dots">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-[#FF3AF2] border-4 border-[#FFE600] shadow-[4px_4px_0_#00F5D4] text-white">
                <Ticket className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter gradient-text-dopamine text-shadow-triple" style={{ fontFamily: 'var(--font-display), sans-serif' }}>
                BD GOTICKET 🔥
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-sm leading-relaxed font-bold tracking-wide">
              Maximalist & Dopamine multi-modal transit matrix reservation hub. Book your Bus, Train, and Flight tickets seamlessly with instant mobile banking and Gmail OTP verification.
            </p>

            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-full bg-[#FF3AF2] border-4 border-[#FFE600] shadow-[4px_4px_0_#00F5D4] text-xs font-black text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFE600] animate-ping" />
              <span>DOPAMINE VERIFIED PLATFORM ⚡</span>
            </div>
          </div>

          {/* Column I: Transit Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FFE600] uppercase tracking-wider text-shadow-single font-display border-b-4 border-[#FF3AF2] pb-2">
              Transit Modes
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-200">
              <li>
                <Link href="/search?transport_type=BUS" className="hover:text-[#00F5D4] transition-colors flex items-center space-x-1">
                  <span>🚌 Luxury Bus Coaches</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=TRAIN" className="hover:text-[#FFE600] transition-colors flex items-center space-x-1">
                  <span>🚆 Bangladesh Railway</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=PLANE" className="hover:text-[#FF3AF2] transition-colors flex items-center space-x-1">
                  <span>✈️ Air Lines</span>
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#FF6B35] transition-colors flex items-center space-x-1">
                  <span>📐 Interactive Seat Layouts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column II: Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#00F5D4] uppercase tracking-wider text-shadow-single font-display border-b-4 border-[#00F5D4] pb-2">
              Quick Portals
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-200">
              <li>
                <Link href="/search" className="hover:text-[#FF3AF2] transition-colors">
                  Search Matrix
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#FFE600] transition-colors">
                  Gmail OTP Verification
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#00F5D4] transition-colors">
                  Passenger Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#FF6B35] transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column III: Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#FF3AF2] uppercase tracking-wider text-shadow-single font-display border-b-4 border-[#7B2FFF] pb-2">
              Security & Trust
            </h4>
            <div className="space-y-2 text-xs font-bold text-slate-200">
              <div className="flex items-center space-x-2 text-[#FFE600]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#FFE600]" />
                <span className="font-black">Gmail OTP Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Frictionless seat verification across all Bangladeshi transport routes with multi-factor authentication.
              </p>
            </div>
          </div>

        </div>

        {/* Thick Clashing Border Divider */}
        <div className="border-t-4 border-dashed border-[#00F5D4]" />

        {/* Bottom Copyright & Terms */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-black text-slate-300 tracking-wider uppercase">
          <p>© {new Date().getFullYear()} BD GOTICKET. MAXIMALIST DOPAMINE SYSTEM.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-[#FFE600] transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-[#FF3AF2] transition-colors">TERMS OF SERVICE</Link>
            <span className="text-[#00F5D4] font-black">BANGLADESH 🇧🇩</span>
          </div>
        </div>

      </div>
    </footer>
  );
};


