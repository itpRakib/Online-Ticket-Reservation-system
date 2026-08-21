'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, Shield, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0A0A0A] border-t-2 border-[#D4AF37]/50 text-[#F2F0E4] relative z-10 pt-16 pb-12 shadow-[0_-10px_30px_rgba(0,0,0,0.9)]">
      {/* Top Metallic Gold Accent Bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80 mb-12" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 art-deco-diamond border-2 border-[#D4AF37] bg-[#141414]">
                <Ticket className="h-4 w-4 text-[#D4AF37]" />
              </div>
              <span className="text-xl font-black uppercase tracking-[0.25em] text-[#D4AF37]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                BD GOTICKET
              </span>
            </div>

            <p className="text-xs text-[#888888] max-w-sm leading-relaxed tracking-wide">
              Bangladesh&apos;s imperial multi-modal transit matrix reservation hub. Book your Bus, Train, and Plane tickets seamlessly with instant mobile banking and Gmail OTP verification.
            </p>

            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#141414] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-ping" />
              <span>EST. 1925 • IMPERIAL VERIFIED PLATFORM</span>
            </div>
          </div>

          {/* Column I: Transit Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] border-b border-[#D4AF37]/30 pb-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              I. Transit Modes
            </h4>
            <ul className="space-y-2 text-xs text-[#888888]">
              <li>
                <Link href="/search?transport_type=BUS" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-1">
                  <span>🚌 Luxury Bus Coaches</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=TRAIN" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-1">
                  <span>🚆 Bangladesh Railway</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=PLANE" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-1">
                  <span>✈️ Imperial Air Lines</span>
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#D4AF37] transition-colors flex items-center space-x-1">
                  <span>📐 Interactive Seat Layouts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column II: Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] border-b border-[#D4AF37]/30 pb-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              II. Quick Portals
            </h4>
            <ul className="space-y-2 text-xs text-[#888888]">
              <li>
                <Link href="/search" className="hover:text-[#D4AF37] transition-colors">
                  Search Matrix
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#D4AF37] transition-colors">
                  Gmail OTP Showcase
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#D4AF37] transition-colors">
                  Passenger Portal
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#D4AF37] transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column III: Verification & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] border-b border-[#D4AF37]/30 pb-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
              III. Security & Trust
            </h4>
            <div className="space-y-2 text-xs text-[#888888]">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Shield className="h-4 w-4 shrink-0" />
                <span className="font-bold">Gmail Verification Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#888888]">
                Eliminating NID requirements for frictionless seat confirmation across all Bangladeshi transport routes.
              </p>
            </div>
          </div>

        </div>

        {/* Art Deco Geometric Divider */}
        <div className="art-deco-divider">
          <div className="art-deco-divider-diamond" />
        </div>

        {/* Bottom Copyright & Terms */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#888888] tracking-wider uppercase">
          <p>© {new Date().getFullYear()} BD GOTICKET. ALL IMPERIAL RIGHTS RESERVED.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">TERMS OF SERVICE</Link>
            <span className="text-[#D4AF37]">CRAFTED IN BANGLADESH 🇧🇩</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
