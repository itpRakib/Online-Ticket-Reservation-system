'use client';

import React, { useState } from 'react';
import { VehicleSeatSelector } from '@/components/VehicleSeatSelector';
import { Bus, Train, Plane, Sparkles, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SeatSelectionPage() {
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  const handleBookingConfirm = (details: any) => {
    setConfirmedBooking(details);
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      
      {/* ─── PAGE HEADER & BANNER ─── */}
      <div className="relative glass-panel rounded-3xl p-8 sm:p-10 border border-purple-500/20 overflow-hidden bg-gradient-to-br from-[#0B081E] via-[#0D0A26] to-[#070514] shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Dynamic Transport Seat Selection Matrix</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            Vehicle-Specific <span className="bg-gradient-to-r from-purple-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Seat Selection & Gmail Verification</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Experience real-time dynamic seat layout switching across Bus, Train, and Commercial Flight cabins. Confirm seat reservations instantly using <span className="text-emerald-400 font-bold">Gmail OTP Verification</span> — eliminating the need for NID confirmation!
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-mono text-purple-200/80">
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-300 font-bold">
              <Mail className="h-4 w-4 text-emerald-400" />
              <span>Gmail OTP Verification Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <Bus className="h-4 w-4 text-purple-400" />
              <span>Bus: 2+2 & 2+1 Sleeper</span>
            </div>
            <div className="flex items-center space-x-2">
              <Train className="h-4 w-4 text-indigo-400" />
              <span>Train: Shovon, Snigdha & AC Berth</span>
            </div>
            <div className="flex items-center space-x-2">
              <Plane className="h-4 w-4 text-cyan-400" />
              <span>Plane: Economy 3+3 & Business 2+2</span>
            </div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel w-full max-w-lg rounded-3xl p-8 space-y-6 bg-[#0B081E] border border-cyan-500/40 shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-lg">Gmail Verified & Confirmed!</h3>
                </div>
                <button
                  onClick={() => setConfirmedBooking(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transport Type:</span>
                    <span className="text-cyan-300 font-bold uppercase">{confirmedBooking.transportType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class Configuration:</span>
                    <span className="text-slate-200 font-semibold">{confirmedBooking.classType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reserved Seats:</span>
                    <span className="text-emerald-400 font-mono font-bold">{confirmedBooking.selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-400 pt-1">
                    <span>Identity Status:</span>
                    <span className="font-bold">📧 Gmail OTP Verified (NID Skipped)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-300 font-bold">Total Payable Fare:</span>
                    <span className="text-emerald-400 font-extrabold text-base">৳{confirmedBooking.totalFare.toLocaleString()}</span>
                  </div>
                </div>

                {/* Passenger list summary */}
                <div className="space-y-2">
                  <span className="font-bold text-slate-300 block">Registered Passengers:</span>
                  {confirmedBooking.passengers.map((p: any) => (
                    <div key={p.seat_number} className="bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-white font-bold block">{p.name || 'Anonymous Traveler'}</span>
                        <span className="text-emerald-300 text-[10px] flex items-center space-x-1">
                          <Mail className="h-3 w-3 inline" />
                          <span>{p.gmail} (Verified)</span>
                        </span>
                      </div>
                      <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">Seat {p.seat_number}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  onClick={() => setConfirmedBooking(null)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
