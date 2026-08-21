'use client';

import React, { useState } from 'react';
import { VehicleSeatSelector, TransportType, Passenger } from '@/components/VehicleSeatSelector';
import { Bus, Train, Plane, CheckCircle2, Shield, Sparkles, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function SeatSelectionShowcasePage() {
  const [confirmedBooking, setConfirmedBooking] = useState<{
    transportType: TransportType;
    classType: string;
    selectedSeats: string[];
    passengers: Passenger[];
    totalFare: number;
  } | null>(null);

  const handleBookingConfirm = (details: {
    transportType: TransportType;
    classType: string;
    selectedSeats: string[];
    passengers: Passenger[];
    totalFare: number;
  }) => {
    setConfirmedBooking(details);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F0E4] art-deco-crosshatch py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Sunburst Radial Glow */}
      <div className="absolute inset-0 art-deco-sunburst pointer-events-none opacity-40" />

      <div className="mx-auto max-w-7xl space-y-10 relative z-10">
        
        {/* Back Link */}
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] hover:text-[#F2E8C4] transition-colors border border-[#D4AF37]/30 bg-[#141414] px-4 py-2"
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Main Terminal</span>
          </Link>
        </div>

        {/* Art Deco Hero Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#141414] border border-[#D4AF37] text-[#D4AF37] text-xs font-bold uppercase tracking-[0.25em] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            <span>IMPERIAL TRANSIT MATRIX • BANGLADESH</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[0.2em] text-[#F2F0E4] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" style={{ fontFamily: 'var(--font-heading), serif' }}>
            Interactive Seat Selector
          </h1>

          <p className="text-sm sm:text-base text-[#888888] max-w-2xl mx-auto leading-relaxed tracking-wide">
            Switch seamlessly between <span className="text-[#D4AF37] font-bold">Bus Coaches</span>, <span className="text-[#D4AF37] font-bold">Railway Bogies</span>, and <span className="text-[#D4AF37] font-bold">Commercial Flights</span>. Select seats and confirm instantly via <span className="text-emerald-400 font-bold">Gmail OTP Verification</span>.
          </p>

          <div className="art-deco-divider">
            <div className="art-deco-divider-diamond" />
          </div>

          {/* Roman Numeral Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#F2F0E4]/80 pt-2 font-bold uppercase tracking-wider">
            <div className="flex items-center space-x-2 bg-[#141414] border border-[#D4AF37]/30 px-3 py-1.5">
              <Bus className="h-4 w-4 text-[#D4AF37]" />
              <span>I. Bus: 2+2 Luxury & 2+1 VIP Sleeper</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#141414] border border-[#D4AF37]/30 px-3 py-1.5">
              <Train className="h-4 w-4 text-[#D4AF37]" />
              <span>II. Train: Shovon & AC Berth Coupe</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#141414] border border-[#D4AF37]/30 px-3 py-1.5">
              <Plane className="h-4 w-4 text-[#D4AF37]" />
              <span>III. Flight: Economy 3+3 & Business 2+2</span>
            </div>
          </div>
        </div>

        {/* ─── INTERACTIVE VEHICLE SEAT SELECTOR COMPONENT ─── */}
        <VehicleSeatSelector
          initialType="BUS"
          allowModeSwitching={true}
          baseFareEconomy={900}
          baseFareBusiness={1600}
          onBookingConfirm={handleBookingConfirm}
        />

        {/* ─── CONFIRMATION MODAL ─── */}
        <AnimatePresence>
          {confirmedBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="art-deco-panel art-deco-corner-brackets w-full max-w-lg p-8 space-y-6 bg-[#0A0A0A] border-2 border-[#D4AF37] shadow-2xl relative"
              >
                <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                    <h3 className="font-extrabold text-[#F2F0E4] text-lg uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-heading), serif' }}>Gmail Verified & Confirmed!</h3>
                  </div>
                  <button
                    onClick={() => setConfirmedBooking(null)}
                    className="text-[#D4AF37] hover:text-white text-lg font-bold cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 text-xs tracking-wider">
                  <div className="bg-[#141414] p-4 border border-[#D4AF37]/30 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#888888] uppercase">Transport Mode:</span>
                      <span className="text-[#D4AF37] font-bold uppercase" style={{ fontFamily: 'var(--font-heading), serif' }}>{confirmedBooking.transportType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888] uppercase">Class Tier:</span>
                      <span className="text-[#F2F0E4] font-semibold">{confirmedBooking.classType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888] uppercase">Reserved Seats:</span>
                      <span className="text-[#D4AF37] font-mono font-bold">{confirmedBooking.selectedSeats.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#888888] uppercase">Total Fare Paid:</span>
                      <span className="text-emerald-400 font-extrabold text-base">৳{confirmedBooking.totalFare.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-bold text-[#D4AF37] uppercase tracking-wider block border-b border-[#D4AF37]/20 pb-1">Verified Passengers</span>
                    {confirmedBooking.passengers.map(p => (
                      <div key={p.seat_number} className="flex justify-between items-center text-[11px] bg-[#141414] p-2 border border-[#D4AF37]/20">
                        <span>{p.name} (Seat {p.seat_number})</span>
                        <span className="text-emerald-400 font-mono flex items-center space-x-1 font-bold">
                          <Mail className="h-3 w-3" />
                          <span>{p.gmail}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmedBooking(null)}
                  className="art-deco-button-solid w-full py-3.5 text-xs tracking-[0.2em]"
                >
                  CLOSE & RETURN TO MATRIX
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
