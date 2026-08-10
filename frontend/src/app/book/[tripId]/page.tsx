'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Bus, Train, Plane, RefreshCw, AlertCircle, 
  ArrowRight, UserCheck, Armchair, ShoppingBag, ShieldAlert 
} from 'lucide-react';
import { motion } from 'framer-motion';

function BookTripContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const tripId = params.tripId as string;
  const travelDate = searchParams.get('date') || '2026-06-29';

  // State
  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [classType, setClassType] = useState('ECONOMY'); // ECONOMY or BUSINESS
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]); // Array of { seat_number, name, age, gender, nid }
  const [submitting, setSubmitting] = useState(false);

  // Fetch trip details
  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getTripDetails(tripId);
        setTrip(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  // Handle seat clicks
  const handleSeatClick = (seat: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    if (selectedSeats.includes(seat)) {
      // Remove seat
      setSelectedSeats(prev => prev.filter(s => s !== seat));
      setPassengers(prev => prev.filter(p => p.seat_number !== seat));
    } else {
      // Limit based on transport mode: 5 for flights, 4 for bus/train
      const limit = trip?.transport_type === 'PLANE' ? 5 : 4;
      if (selectedSeats.length >= limit) {
        alert(`You can book a maximum of ${limit} seats at a time for ${trip?.transport_type?.toLowerCase()} transport.`);
        return;
      }
      // Add seat
      setSelectedSeats(prev => [...prev, seat]);
      setPassengers(prev => [
        ...prev, 
        { seat_number: seat, name: '', age: '', gender: 'MALE', nid: '' }
      ]);
    }
  };

  // Passenger input change handlers
  const handlePassengerChange = (seat: string, field: string, value: any) => {
    setPassengers(prev => prev.map(p => {
      if (p.seat_number === seat) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/auth/login?redirect=/book/${tripId}?date=${travelDate}`);
      return;
    }

    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }

    // Validation check on passenger names and ages
    for (const p of passengers) {
      if (!p.name.trim()) {
        setError(`Please enter the name for passenger on seat ${p.seat_number}.`);
        return;
      }
      if (!p.age || parseInt(p.age) <= 0) {
        setError(`Please enter a valid age for passenger on seat ${p.seat_number}.`);
        return;
      }
    }

    setError('');
    setSubmitting(true);

    const payload = {
      trip_id: parseInt(tripId),
      travel_date: travelDate,
      class_type: classType,
      passengers: passengers.map(p => ({
        seat_number: p.seat_number,
        name: p.name,
        age: parseInt(p.age),
        gender: p.gender,
        nid: p.nid || null
      }))
    };

    try {
      const res: any = await api.createBooking(payload);
      const bookingId = res?.id || res?.booking?.id || res?.booking_id || Date.now();
      router.push(`/payment/${bookingId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
      setSubmitting(false);
    }
  };

  // Helpers
  const getFare = () => {
    if (!trip) return 0;
    const base = classType === 'BUSINESS' && trip.fare_business ? trip.fare_business : trip.fare_economy;
    return parseFloat(base);
  };

  const getTotalFare = () => {
    return getFare() * selectedSeats.length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
        <span className="text-slate-400">Loading seat layout details...</span>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>Error Loading Seating Plan</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  const layout = trip?.seat_layout || {};
  const tType = trip?.transport_type || 'BUS';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <button 
        onClick={() => router.back()}
        className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
      >
        <span>← Back to Results</span>
      </button>

      {/* Trip Brief Details */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{tType}</span>
          <h2 className="text-xl font-extrabold text-white mt-2 flex items-center space-x-2" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            <span>{trip.source.name}</span>
            <ArrowRight className="h-4 w-4 text-slate-500" />
            <span>{trip.destination.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Operator: <span className="text-slate-200 font-semibold">{trip.operator_name} ({trip.transport_identifier})</span> • Date: <span className="text-slate-200 font-semibold">{travelDate}</span>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="block text-xs text-slate-500 uppercase tracking-widest font-bold">Base Fare</span>
            <span className="text-2xl font-extrabold text-emerald-400">৳{getFare().toLocaleString()}</span>
          </div>
          {trip.fare_business && (
            <div className="space-y-1">
              <label className="block text-xs text-slate-500 uppercase tracking-widest font-bold">Class</label>
              <select
                value={classType}
                onChange={(e) => { setClassType(e.target.value); setSelectedSeats([]); setPassengers([]); }}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ECONOMY">Economy Class</option>
                <option value="BUSINESS">Business Class</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Seat Selector */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center"
        >
          <div className="w-full space-y-2 border-b border-purple-500/20 pb-4 mb-4 text-center">
            <h3 className="font-black text-white text-base uppercase tracking-wider flex items-center justify-center space-x-2">
              {tType === 'BUS' && <Bus className="h-5 w-5 text-purple-400" />}
              {tType === 'TRAIN' && <Train className="h-5 w-5 text-purple-400" />}
              {tType === 'PLANE' && <Plane className="h-5 w-5 text-purple-400" />}
              <span>{tType === 'BUS' ? 'Bus Recliner Chassis Plan' : tType === 'TRAIN' ? 'Railway Bogie Compartment Plan' : 'Aircraft Fuselage Cabin Plan'}</span>
            </h3>
            <p className="text-[11px] text-purple-200/60 font-mono">
              {tType === 'BUS' ? 'Standard 2+2 AC Luxury Coach • Front Entrance' : tType === 'TRAIN' ? 'Bangladesh Railway Snigdha/Shovon Bogie Layout' : 'Boeing/ATR 3+3 Dual Aisle Fuselage'}
            </p>
          </div>

          {/* Seat Layout Vehicle Graphic Chassis */}
          <div className="w-full flex justify-center">
            
            {/* 🚌 REAL-LIFE BUS CHASSIS SITE PLAN */}
            {tType === 'BUS' && (
              <div className="relative w-full max-w-[340px] bg-[#0A0817] border-2 border-purple-500/30 rounded-t-[45px] rounded-b-2xl p-5 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col space-y-4">
                
                {/* Windshield & Driver Cockpit */}
                <div className="relative border-b border-purple-500/20 pb-4 mb-1">
                  <div className="h-4 w-3/4 mx-auto rounded-t-full border-t-2 border-x-2 border-cyan-400/40 bg-cyan-500/10 mb-3 text-[9px] text-cyan-300 font-mono flex items-center justify-center tracking-widest uppercase">
                    🚌 BUS WINDSHIELD / FRONT VIEW
                  </div>

                  <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400">
                    <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 uppercase font-mono">Passenger Door</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-purple-950/60 border border-purple-500/30 px-3 py-1 rounded-lg">
                      <span className="text-[10px] text-purple-300 font-mono font-bold uppercase">Driver Cockpit</span>
                      <div className="h-5 w-5 rounded-full border-2 border-dashed border-purple-400 animate-spin" style={{ animationDuration: '30s' }} />
                    </div>
                  </div>
                </div>

                {/* Outer Glass Windows Column Identifiers */}
                <div className="flex justify-between text-[10px] font-mono text-purple-300/60 px-1 border-b border-purple-500/10 pb-2">
                  <span>🪟 Win</span>
                  <span>🚶 Aisle</span>
                  <span className="text-cyan-400 font-bold">◄ BUS AISLE ►</span>
                  {classType === 'BUSINESS' ? <span>🪟 Win</span> : (
                    <>
                      <span>🚶 Aisle</span>
                      <span>🪟 Win</span>
                    </>
                  )}
                </div>

                {/* Bus Seats Grid */}
                <div className={`grid gap-3 ${classType === 'BUSINESS' ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(row => {
                    const cols = classType === 'BUSINESS' ? ['1', '2', '3'] : ['1', '2', '3', '4'];
                    return cols.map(col => {
                      const seat = `${row}${col}`;
                      const isAvail = layout[seat] !== false;
                      const isSel = selectedSeats.includes(seat);
                      const isAisleRight = classType === 'BUSINESS' ? col === '1' : col === '2';
                      const isWindow = classType === 'BUSINESS' ? (col === '1' || col === '3') : (col === '1' || col === '4');

                      return (
                        <React.Fragment key={seat}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat, isAvail)}
                            disabled={!isAvail}
                            className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative cursor-pointer ${
                              !isAvail 
                                ? 'bg-slate-900/90 border border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                                : isSel
                                ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 border border-purple-300 text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-seat-pulse scale-105'
                                : 'bg-[#16122C] border border-purple-500/25 text-purple-200 hover:border-cyan-400 hover:text-white hover:bg-purple-900/40'
                            }`}
                            title={`Bus Seat ${seat} ${isWindow ? '(Window)' : '(Aisle)'} ${isAvail ? '• Available' : '• Booked'}`}
                          >
                            <Armchair className="h-4 w-4 absolute opacity-20" />
                            <span className="z-10 text-[11px]">{seat}</span>
                            {isWindow && <span className="text-[7px] text-cyan-400/80 font-mono leading-none -mt-0.5">WIN</span>}
                          </button>
                          {isAisleRight && <div className="w-4 flex items-center justify-center text-[9px] text-purple-500/40 font-mono select-none">│</div>}
                        </React.Fragment>
                      );
                    });
                  })}
                </div>

                {/* Rear Engine Bay / Rear Window */}
                <div className="mt-4 pt-3 border-t border-purple-500/20 text-center text-[10px] font-mono text-purple-300/50 uppercase tracking-widest flex items-center justify-between px-2">
                  <span>Rear Engine Bay</span>
                  <span>Rear Emergency Exit</span>
                </div>
              </div>
            )}

            {/* 🚆 REAL-LIFE TRAIN BOGIE SITE PLAN */}
            {tType === 'TRAIN' && (
              <div className="relative w-full max-w-[360px] bg-[#0A0817] border-2 border-indigo-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex flex-col space-y-4">
                
                {/* Bogie Front Coupler & Gangway Door */}
                <div className="border-b border-indigo-500/20 pb-3 flex items-center justify-between text-[10px] font-mono text-indigo-300">
                  <div className="flex items-center space-x-1 bg-indigo-950/60 border border-indigo-500/30 px-2 py-1 rounded-lg">
                    <span>🚽 TOILET</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-cyan-400 uppercase">══ FRONT COUPLER ══</span>
                    <span className="text-[9px] text-slate-400 font-sans">BANGLADESH RAILWAY BOGIE</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-indigo-950/60 border border-indigo-500/30 px-2 py-1 rounded-lg">
                    <span>🔌 220V CHG</span>
                  </div>
                </div>

                {/* Track Corridor Guide */}
                <div className="flex justify-between text-[10px] font-mono text-indigo-300/70 border-b border-indigo-500/10 pb-2">
                  <span>🪟 Window</span>
                  <span>Corridor</span>
                  <span className="text-indigo-400 font-bold">🚶 CENTRAL CORRIDOR</span>
                  <span>Corridor</span>
                  <span>🪟 Window</span>
                </div>

                {/* Train Compartment Seating Grid */}
                <div className="grid grid-cols-4 gap-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar">
                  {Array.from({ length: 14 }).map((_, rIdx) => {
                    return ['1', '2', '3', '4'].map(col => {
                      const seatNum = `S${rIdx * 4 + parseInt(col)}`;
                      const isAvail = layout[seatNum] !== false;
                      const isSel = selectedSeats.includes(seatNum);
                      const isAisleRight = col === '2';
                      const isWindow = col === '1' || col === '4';

                      return (
                        <React.Fragment key={seatNum}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seatNum, isAvail)}
                            disabled={!isAvail}
                            className={`h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-all relative cursor-pointer ${
                              !isAvail
                                ? 'bg-slate-900/90 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                : isSel
                                ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 border border-purple-300 text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-seat-pulse scale-105'
                                : 'bg-[#16122C] border border-indigo-500/30 text-indigo-200 hover:border-cyan-400 hover:text-white hover:bg-indigo-900/40'
                            }`}
                            title={`Train Seat ${seatNum} ${isWindow ? '(Window Seat)' : '(Aisle Seat)'} ${isAvail ? '• Available' : '• Booked'}`}
                          >
                            <span className="z-10 text-[10px]">{seatNum}</span>
                            {isWindow && <span className="text-[7px] text-indigo-300/80 font-mono leading-none -mt-0.5">WIN</span>}
                          </button>
                          {isAisleRight && <div className="w-3 flex items-center justify-center text-[9px] text-indigo-500/30 font-mono">║</div>}
                        </React.Fragment>
                      );
                    });
                  })}
                </div>

                {/* Bogie Rear Coupling */}
                <div className="pt-3 border-t border-indigo-500/20 text-center text-[10px] font-mono text-indigo-300/50 uppercase tracking-widest flex items-center justify-between px-2">
                  <span>🚽 TOILET</span>
                  <span>══ REAR COUPLER ══</span>
                  <span>🧯 EMERGENCY</span>
                </div>
              </div>
            )}

            {/* ✈️ REAL-LIFE AIRCRAFT FUSELAGE SITE PLAN */}
            {tType === 'PLANE' && (
              <div className="relative w-full max-w-[390px] bg-[#0A0817] border-2 border-cyan-500/40 rounded-t-[90px] rounded-b-3xl p-5 shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col space-y-4">
                
                {/* Aircraft Nose Cone & Cockpit Flight Deck */}
                <div className="relative border-b border-cyan-500/20 pb-4 text-center">
                  <div className="h-7 w-3/5 mx-auto rounded-t-full bg-cyan-500/15 border-t-2 border-x-2 border-cyan-400/60 flex items-center justify-center text-[10px] font-extrabold text-cyan-300 font-mono uppercase tracking-widest mb-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    ✈️ FLIGHT DECK / COCKPIT
                  </div>
                  <div className="flex justify-between items-center px-4 text-[10px] font-mono text-cyan-300">
                    <span className="bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[9px]">🍽️ GALLEY</span>
                    <span className="text-cyan-400 font-bold uppercase">{classType === 'BUSINESS' ? 'BUSINESS 2+2' : 'ECONOMY 3+3'}</span>
                    <span className="bg-slate-900/90 border border-slate-800 px-2 py-0.5 rounded text-[9px]">🚽 LAVATORY</span>
                  </div>
                </div>

                {/* Seat Position Guide (Window / Middle / Aisle) */}
                {classType === 'BUSINESS' ? (
                  <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-mono text-cyan-300/80 border-b border-cyan-500/10 pb-2">
                    <span>A (Win)</span>
                    <span>B (Aisle)</span>
                    <span>C (Aisle)</span>
                    <span>D (Win)</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-1 text-center text-[9px] font-mono text-cyan-300/80 border-b border-cyan-500/10 pb-2">
                    <span>A (Win)</span>
                    <span>B (Mid)</span>
                    <span>C (Aisle)</span>
                    <span>D (Aisle)</span>
                    <span>E (Mid)</span>
                    <span>F (Win)</span>
                  </div>
                )}

                {/* Plane Seating Grid */}
                <div className={`grid gap-2 max-h-[460px] overflow-y-auto pr-1 scrollbar ${classType === 'BUSINESS' ? 'grid-cols-4' : 'grid-cols-6'}`}>
                  {Array.from({ length: classType === 'BUSINESS' ? 6 : 10 }).map((_, rowNum) => {
                    const r = rowNum + 1;
                    const isOverwing = r >= 4 && r <= 6;
                    const cols = classType === 'BUSINESS' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E', 'F'];

                    return cols.map(col => {
                      const seat = `${r}${col}`;
                      const isAvail = layout[seat] !== false;
                      const isSel = selectedSeats.includes(seat);
                      const isAisleRight = classType === 'BUSINESS' ? col === 'B' : col === 'C';
                      const isWindow = classType === 'BUSINESS' ? (col === 'A' || col === 'D') : (col === 'A' || col === 'F');

                      return (
                        <React.Fragment key={seat}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat, isAvail)}
                            disabled={!isAvail}
                            className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all relative cursor-pointer ${
                              !isAvail
                                ? 'bg-slate-900/90 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                : isSel
                                ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 border border-purple-300 text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-seat-pulse scale-105'
                                : 'bg-[#16122C] border border-cyan-500/25 text-cyan-200 hover:border-purple-400 hover:text-white hover:bg-cyan-950/40'
                            }`}
                            title={`Flight Seat ${seat} ${isWindow ? '(Window)' : 'Seat'} ${isOverwing ? '• Overwing Exit Row' : ''}`}
                          >
                            <span className="z-10 font-mono">{seat}</span>
                          </button>
                          {isAisleRight && <div className="w-2 flex items-center justify-center text-[8px] text-cyan-500/40 font-mono">│</div>}
                        </React.Fragment>
                      );
                    });
                  })}
                </div>

                {/* Overwing Exit Indicator Banner */}
                <div className="text-[9px] font-mono text-cyan-400/70 bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-1.5 text-center flex items-center justify-between px-3">
                  <span>◀ WING</span>
                  <span className="font-bold text-cyan-300 uppercase tracking-widest">✈️ OVERWING EMERGENCY EXIT</span>
                  <span>WING ▶</span>
                </div>

                {/* Tail / Rear Galley */}
                <div className="pt-2 border-t border-cyan-500/20 text-center text-[10px] font-mono text-cyan-300/60 uppercase tracking-widest flex items-center justify-between px-2">
                  <span>Rear Lavatory</span>
                  <span>AFT EXIT 🚪</span>
                  <span>Rear Galley</span>
                </div>
              </div>
            )}

          </div>

          {/* Real-Life Seating Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs font-semibold text-purple-200/80 bg-[#0E0C1E] p-3 rounded-2xl border border-purple-500/20 w-full">
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-[#16122C] border border-purple-500/30 rounded" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-gradient-to-r from-purple-500 to-cyan-400 rounded shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              <span className="text-purple-300 font-bold">Selected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-slate-900 border border-slate-800 rounded opacity-60" />
              <span className="text-slate-500">Booked</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-cyan-400 font-mono text-xs">🪟</span>
              <span className="text-cyan-300">Window Seat</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Passenger details & summary */}
        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-6"
        >
          
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {selectedSeats.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-4 border border-dashed border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
              <Armchair className="h-12 w-12 text-slate-500 animate-pulse" />
              <h4 className="text-white font-bold text-lg">No Seats Selected</h4>
              <p className="text-slate-500 text-sm max-w-sm">
                Click on the seat layout chart on the left to select seats. You can book up to 4 tickets at a time.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {/* Passenger Inputs Card */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <span>Traveler Node ID Name</span>
                </h3>

                <div className="space-y-6">
                  {passengers.map((p, idx) => (
                    <div key={p.seat_number} className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-widest">Passenger {idx + 1}</span>
                        <span className="text-xs bg-purple-950/80 border border-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-lg font-mono font-bold">
                          Seat: {p.seat_number} {
                            (p.seat_number.endsWith('1') || p.seat_number.endsWith('4') || p.seat_number.endsWith('A') || p.seat_number.endsWith('F'))
                              ? '• 🪟 Window Seat'
                              : (p.seat_number.endsWith('B') || p.seat_number.endsWith('E'))
                              ? '• 💺 Middle Seat'
                              : '• 🚶 Aisle Seat'
                          }
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            required
                            value={p.name}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'name', e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            placeholder="E.g., Karim Uddin"
                          />
                        </div>

                        {/* Age */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={p.age}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'age', e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            placeholder="E.g., 28"
                          />
                        </div>

                        {/* Gender */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'gender', e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* NID / Passport (Optional) */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                          <span>Passport / NID Database Key (Optional)</span>
                        </label>
                        <input
                          type="text"
                          required={false}
                          value={p.nid}
                          onChange={(e) => handlePassengerChange(p.seat_number, 'nid', e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="National ID / Passport"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span>Fare Summary</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Seats:</span>
                    <span className="text-slate-200 font-bold">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class Rate:</span>
                    <span className="text-slate-200 font-semibold">৳{getFare().toLocaleString()} x {selectedSeats.length}</span>
                  </div>
                  <div className="border-t border-slate-900 pt-3 mt-3 flex justify-between text-sm">
                    <span className="font-bold text-white">Total Ticket Fare:</span>
                    <span className="font-extrabold text-emerald-400 text-base">৳{getTotalFare().toLocaleString()}</span>
                  </div>
                </div>

                {!user && (
                  <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start space-x-2 text-xs text-indigo-400">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>You are not logged in. Confirming will redirect you to the login screen to verify identity.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-600 hover:from-cyan-300 hover:to-fuchsia-500 py-3.5 font-bold text-slate-950 flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-cyan-500/10 hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : null}
                  <span>CONFIRM TRAVEL PASSAGE</span>
                </button>
              </div>

            </form>
          )}

        </motion.div>

      </div>
    </div>
  );
}

export default function BookTrip() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-medium">Loading booking details...</span>
      </div>
    }>
      <BookTripContent />
    </Suspense>
  );
}
