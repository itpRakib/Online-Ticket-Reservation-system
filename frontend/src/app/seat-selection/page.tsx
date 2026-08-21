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
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="mx-auto max-w-7xl space-y-10 relative z-10">
        
        {/* Back Button */}
        <div>
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#121212] bg-white border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-4 py-2 hover:bg-[#F0C020] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Main Terminal</span>
          </Link>
        </div>

        {/* Bauhaus Hero Header Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-[#D02020] text-white border-3 border-[#121212] text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#121212]">
            <Sparkles className="h-4 w-4 text-[#F0C020]" />
            <span>CONSTRUCTIVIST TRANSIT MATRIX • BANGLADESH</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#121212]">
            Interactive Seat Selector
          </h1>

          <p className="text-sm sm:text-base text-[#121212] font-bold max-w-2xl mx-auto leading-relaxed">
            Form Follows Function: Switch seamlessly between <span className="bg-[#D02020] text-white px-1.5 py-0.5 border border-[#121212]">Bus Coaches</span>, <span className="bg-[#1040C0] text-white px-1.5 py-0.5 border border-[#121212]">Railway Bogies</span>, and <span className="bg-[#F0C020] text-[#121212] px-1.5 py-0.5 border border-[#121212]">Commercial Flights</span>. Confirm seats instantly via <span className="text-[#D02020] font-black">Gmail OTP Verification</span>.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black uppercase tracking-wider pt-2">
            <div className="flex items-center space-x-2 bg-white border-3 border-[#121212] px-3 py-1.5 shadow-[3px_3px_0px_0px_#121212]">
              <Bus className="h-4 w-4 text-[#D02020]" />
              <span>I. Bus: 2+2 Luxury & VIP Sleeper</span>
            </div>
            <div className="flex items-center space-x-2 bg-white border-3 border-[#121212] px-3 py-1.5 shadow-[3px_3px_0px_0px_#121212]">
              <Train className="h-4 w-4 text-[#1040C0]" />
              <span>II. Train: Shovon & AC Berth Coupe</span>
            </div>
            <div className="flex items-center space-x-2 bg-white border-3 border-[#121212] px-3 py-1.5 shadow-[3px_3px_0px_0px_#121212]">
              <Plane className="h-4 w-4 text-[#121212]" />
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border-4 border-[#121212] shadow-[12px_12px_0px_0px_#121212] w-full max-w-lg p-8 space-y-6 relative"
              >
                <div className="flex items-center justify-between border-b-4 border-[#121212] pb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-6 w-6 text-[#D02020]" />
                    <h3 className="font-black text-[#121212] text-lg uppercase tracking-wider">Gmail Verified & Confirmed!</h3>
                  </div>
                  <button
                    onClick={() => setConfirmedBooking(null)}
                    className="text-[#121212] hover:text-[#D02020] text-xl font-black cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4 text-xs font-bold">
                  <div className="bg-[#F0F0F0] p-4 border-3 border-[#121212] space-y-2 shadow-[3px_3px_0px_0px_#121212]">
                    <div className="flex justify-between">
                      <span className="text-[#666666] uppercase">Transport Mode:</span>
                      <span className="text-[#D02020] font-black uppercase">{confirmedBooking.transportType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666] uppercase">Class Tier:</span>
                      <span className="text-[#121212] font-black">{confirmedBooking.classType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666] uppercase">Reserved Seats:</span>
                      <span className="text-[#1040C0] font-mono font-black">{confirmedBooking.selectedSeats.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666] uppercase">Total Fare Paid:</span>
                      <span className="text-[#D02020] font-black text-base">৳{confirmedBooking.totalFare.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-black text-[#121212] uppercase tracking-wider block border-b-2 border-[#121212] pb-1">Verified Passengers</span>
                    {confirmedBooking.passengers.map(p => (
                      <div key={p.seat_number} className="flex justify-between items-center text-[11px] bg-white p-2 border-2 border-[#121212]">
                        <span>{p.name} (Seat {p.seat_number})</span>
                        <span className="text-[#D02020] font-mono flex items-center space-x-1 font-black">
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
                  className="bauhaus-button-yellow w-full py-3.5 text-xs tracking-wider"
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
