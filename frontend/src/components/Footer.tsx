'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket, ShieldCheck, Mail, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#E0E5EC] text-[#3D4852] relative z-10 pt-16 pb-12 shadow-[inset_6px_6px_10px_rgba(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] border-t border-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column (Spans 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-2xl bg-[#E0E5EC] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.6),inset_-4px_-4px_8px_rgba(255,255,255,0.5)] text-[#6C63FF]">
                <Ticket className="h-5 w-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-[#3D4852]" style={{ fontFamily: 'var(--font-display), sans-serif' }}>
                BD GOTICKET
              </span>
            </div>

            <p className="text-xs text-[#6B7280] max-w-sm leading-relaxed font-medium">
              Soft UI & Neumorphic multi-modal transit matrix reservation hub. Book your Bus, Train, and Flight tickets seamlessly with instant mobile banking and Gmail OTP verification.
            </p>

            <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] text-xs font-bold text-[#6C63FF]">
              <span className="h-2 w-2 rounded-full bg-[#38B2AC] animate-pulse" />
              <span>SOFT UI VERIFIED PLATFORM</span>
            </div>
          </div>

          {/* Column I: Transit Modes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#3D4852] uppercase tracking-wider font-display">
              Transit Modes
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#6B7280]">
              <li>
                <Link href="/search?transport_type=BUS" className="hover:text-[#6C63FF] transition-colors flex items-center space-x-1">
                  <span>🚌 Luxury Bus Coaches</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=TRAIN" className="hover:text-[#6C63FF] transition-colors flex items-center space-x-1">
                  <span>🚆 Bangladesh Railway</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=PLANE" className="hover:text-[#6C63FF] transition-colors flex items-center space-x-1">
                  <span>✈️ Air Lines</span>
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#6C63FF] transition-colors flex items-center space-x-1">
                  <span>📐 Interactive Seat Layouts</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column II: Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#3D4852] uppercase tracking-wider font-display">
              Quick Portals
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#6B7280]">
              <li>
                <Link href="/search" className="hover:text-[#6C63FF] transition-colors">
                  Search Matrix
                </Link>
              </li>
              <li>
                <Link href="/seat-selection" className="hover:text-[#6C63FF] transition-colors">
                  Gmail OTP Verification
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#6C63FF] transition-colors">
                  Passenger Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#6C63FF] transition-colors">
                  Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column III: Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#3D4852] uppercase tracking-wider font-display">
              Security & Trust
            </h4>
            <div className="space-y-2 text-xs font-medium text-[#6B7280]">
              <div className="flex items-center space-x-2 text-[#6C63FF]">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="font-bold">Gmail OTP Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#6B7280]">
                Frictionless seat verification across all Bangladeshi transport routes with multi-factor authentication.
              </p>
            </div>
          </div>

        </div>

        {/* Soft Divider */}
        <div className="h-px bg-[#C4CBD6]/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]" />

        {/* Bottom Copyright & Terms */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-bold text-[#6B7280] tracking-wider">
          <p>© {new Date().getFullYear()} BD GOTICKET. NEUMORPHIC SOFT UI SYSTEM.</p>
          <div className="flex items-center space-x-6">
            <Link href="/privacy" className="hover:text-[#6C63FF] transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-[#6C63FF] transition-colors">TERMS OF SERVICE</Link>
            <span className="text-[#6C63FF]">BANGLADESH 🇧🇩</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

