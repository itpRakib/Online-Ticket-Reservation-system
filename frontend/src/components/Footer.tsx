'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#121212] border-t-4 border-[#F0C020] text-white relative z-10 pt-16 pb-12 shadow-[0_-8px_0px_0px_#121212]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              {/* Constructivist Geometric Emblem */}
              <div className="flex items-center space-x-1 p-1.5 bg-white border-2 border-white">
                <div className="h-4 w-4 rounded-full bg-[#D02020]" />
                <div className="h-4 w-4 bg-[#1040C0]" />
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#F0C020]" />
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter text-[#F0C020]" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                BD GOTICKET
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-sm leading-relaxed font-bold tracking-wide">
              Form Follows Function: Bangladesh&apos;s constructivist multi-modal transit matrix reservation hub. Book your Bus, Train, and Plane tickets seamlessly with instant mobile banking and Gmail OTP verification.
            </p>

            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[#D02020] text-white text-xs font-black uppercase tracking-wider border-2 border-white">
              <span className="h-2 w-2 rounded-full bg-[#F0C020] animate-ping" />
              <span>BAUHAUS VERIFIED PLATFORM</span>
            </div>
          </div>

          {/* Column I: Transit Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#F0C020] uppercase tracking-wider border-b-2 border-[#F0C020] pb-2">
              I. Transit Modes
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-300">
              <li>
                <Link href="/search?transport_type=BUS" className="hover:text-[#F0C020] transition-colors flex items-center space-x-1">
                  <span>🚌 Luxury Bus Coaches</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=TRAIN" className="hover:text-[#F0C020] transition-colors flex items-center space-x-1">
                  <span>🚆 Bangladesh Railway</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=PLANE" className="hover:text-[#F0C020] transition-colors flex items-center space-x-1">
                  <span>✈️ Air Lines</span>
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#F0C020] transition-colors flex items-center space-x-1">
                  <span>📐 Interactive Seat Layouts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column II: Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#F0C020] uppercase tracking-wider border-b-2 border-[#F0C020] pb-2">
              II. Quick Portals
            </h4>
            <ul className="space-y-2 text-xs font-bold text-slate-300">
              <li>
                <Link href="/search" className="hover:text-[#F0C020] transition-colors">
                  Search Matrix
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#F0C020] transition-colors">
                  Gmail OTP Showcase
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#F0C020] transition-colors">
                  Passenger Portal
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#F0C020] transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column III: Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#F0C020] uppercase tracking-wider border-b-2 border-[#F0C020] pb-2">
              III. Security & Trust
            </h4>
            <div className="space-y-2 text-xs font-bold text-slate-300">
              <div className="flex items-center space-x-2 text-[#F0C020]">
                <Shield className="h-4 w-4 shrink-0" />
                <span className="font-black">Gmail Verification Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Eliminating NID requirements for frictionless seat confirmation across all Bangladeshi transport routes.
              </p>
            </div>
          </div>

        </div>

        {/* Thick Border Divider */}
        <div className="border-t-2 border-slate-800" />

        {/* Bottom Copyright & Terms */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-black text-slate-400 tracking-wider uppercase">
          <p>© {new Date().getFullYear()} BD GOTICKET. BAUHAUS CONSTRUCTIVIST SYSTEM.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-[#F0C020] transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-[#F0C020] transition-colors">TERMS OF SERVICE</Link>
            <span className="text-[#F0C020]">BANGLADESH 🇧🇩</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
