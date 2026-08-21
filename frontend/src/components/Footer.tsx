'use client';

import React from 'react';
import Link from 'next/link';
import { Edit3, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#fdfbf7] text-[#2d2d2d] relative z-10 pt-12 pb-10 border-t-2 border-dashed border-[#2d2d2d] font-body text-base">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="flex items-center justify-center h-9 w-9 border-[3px] border-[#2d2d2d] bg-[#fff9c4] text-[#2d2d2d] wobbly-box shadow-[2px_2px_0px_#2d2d2d]">
                <Edit3 className="h-5 w-5 text-[#ff4d4d]" />
              </div>
              <span className="text-2xl font-bold font-heading text-[#2d2d2d]">
                BD GOTICKET<span className="text-[#ff4d4d]">.</span>
              </span>
            </div>

            <p className="text-base text-[#2d2d2d]/80 max-w-sm leading-relaxed">
              Authentic hand-drawn multi-modal ticket reservation sketchbook for Bangladesh. Book Bus, Train, and Flight seats with instant Gmail OTP verification.
            </p>

            <div className="inline-flex items-center space-x-2 px-3 py-1 border-[2px] border-[#2d2d2d] bg-[#fff9c4] text-sm font-bold text-[#2d5da1] wobbly-badge shadow-[2px_2px_0px_#2d2d2d]">
              <Heart className="h-4 w-4 text-[#ff4d4d] fill-[#ff4d4d]" />
              <span>Made with paper, pencil &amp; coffee in Bangladesh 🇧🇩</span>
            </div>
          </div>

          {/* Column I: Transit Modes */}
          <div className="space-y-3">
            <h4 className="text-xl font-bold font-heading text-[#ff4d4d] border-b-2 border-dashed border-[#2d2d2d]/40 pb-1">
              ✏️ Transit Modes
            </h4>
            <ul className="space-y-2 text-lg text-[#2d2d2d]">
              <li>
                <Link href="/search?transport_type=BUS" className="hover:text-[#2d5da1] hover:underline flex items-center space-x-1">
                  <span>🚌 Luxury Bus Coaches</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=TRAIN" className="hover:text-[#2d5da1] hover:underline flex items-center space-x-1">
                  <span>🚂 Bangladesh Railway</span>
                </Link>
              </li>
              <li>
                <Link href="/search?transport_type=PLANE" className="hover:text-[#2d5da1] hover:underline flex items-center space-x-1">
                  <span>✈️ Domestic Airlines</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column II: Quick Portals */}
          <div className="space-y-3">
            <h4 className="text-xl font-bold font-heading text-[#2d5da1] border-b-2 border-dashed border-[#2d2d2d]/40 pb-1">
              📌 Quick Links
            </h4>
            <ul className="space-y-2 text-lg text-[#2d2d2d]">
              <li>
                <Link href="/search" className="hover:text-[#ff4d4d] hover:underline">
                  🔍 Search Matrix
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-[#ff4d4d] hover:underline">
                  🔑 Passenger Login
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-[#ff4d4d] hover:underline">
                  📝 Register Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Column III: Security */}
          <div className="space-y-3">
            <h4 className="text-xl font-bold font-heading text-[#2d2d2d] border-b-2 border-dashed border-[#2d2d2d]/40 pb-1">
              🛡️ Security
            </h4>
            <div className="space-y-2 text-base text-[#2d2d2d]/80">
              <div className="flex items-center space-x-2 text-[#2d5da1] font-bold">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#2d5da1]" />
                <span>Gmail OTP 2FA Verified</span>
              </div>
              <p className="text-sm leading-relaxed text-[#2d2d2d]/70">
                Multi-factor seat allocation verified across all Bangladesh transport routes.
              </p>
            </div>
          </div>

        </div>

        {/* Dashed Separator Line */}
        <div className="border-t-2 border-dashed border-[#2d2d2d]/30 w-full my-4" />

        {/* Bottom Copyright & Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-base text-[#2d2d2d]/80">
          <p>© {new Date().getFullYear()} BD GoTicket // Hand-Drawn Sketchbook Edition</p>
          <div className="flex items-center space-x-6 font-bold">
            <Link href="/privacy" className="hover:text-[#ff4d4d] hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#2d5da1] hover:underline">Terms of Service</Link>
            <span className="text-[#ff4d4d]">Bangladesh 🇧🇩</span>
          </div>
        </div>

      </div>
    </footer>
  );
};





