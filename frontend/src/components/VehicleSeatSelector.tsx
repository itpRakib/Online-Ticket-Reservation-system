'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bus, Train, Plane, Armchair, ShieldAlert, CheckCircle2, 
  Info, UserCheck, ShoppingBag, Sparkles, Zap, Lock, ArrowRight, CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type TransportType = 'BUS' | 'TRAIN' | 'PLANE';

export interface VehicleSeatSelectorProps {
  initialType?: TransportType;
  allowModeSwitching?: boolean;
  bookedSeats?: string[];
  baseFareEconomy?: number;
  baseFareBusiness?: number;
  onBookingConfirm?: (details: {
    transportType: TransportType;
    classType: string;
    selectedSeats: string[];
    passengers: Array<{ seat_number: string; name: string; age: string; gender: string; nid: string }>;
    totalFare: number;
  }) => void;
}

export const VehicleSeatSelector: React.FC<VehicleSeatSelectorProps> = ({
  initialType = 'BUS',
  allowModeSwitching = true,
  bookedSeats: propBookedSeats = [],
  baseFareEconomy = 850,
  baseFareBusiness = 1450,
  onBookingConfirm
}) => {
  // ─── Core State ───
  const [activeType, setActiveType] = useState<TransportType>(initialType);
  const [classType, setClassType] = useState<string>('ECONOMY');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<Array<{ seat_number: string; name: string; age: string; gender: string; nid: string }>>([]);
  const [activeHoverSeat, setActiveHoverSeat] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // ─── Preset Booked Seats per Vehicle Type (Simulated realistic occupancy) ───
  const defaultBookedSeats = useMemo(() => {
    const customProps = new Set(propBookedSeats);
    
    const busBooked = new Set(['A1', 'A2', 'C3', 'D4', 'F1', 'H2', 'I3', ...customProps]);
    const trainBooked = new Set(['S2', 'S3', 'S12', 'S13', 'S24', 'S25', 'C1-LB', 'C3-UB', ...customProps]);
    const planeBooked = new Set(['1A', '1B', '3C', '4F', '5A', '7D', '8E', ...customProps]);

    return {
      BUS: busBooked,
      TRAIN: trainBooked,
      PLANE: planeBooked
    };
  }, [propBookedSeats]);

  const bookedSet = defaultBookedSeats[activeType];

  // ─── Seat Limit based on BD Transport Regulations ───
  const seatLimit = activeType === 'PLANE' ? 5 : 4;

  // ─── Handle Transport Mode Switch ───
  const handleTypeSwitch = (type: TransportType) => {
    if (type === activeType) return;
    setActiveType(type);
    setClassType('ECONOMY');
    setSelectedSeats([]);
    setPassengers([]);
    setAlertMessage(null);
  };

  // ─── Handle Class Type Switch ───
  const handleClassSwitch = (newClass: string) => {
    setClassType(newClass);
    setSelectedSeats([]);
    setPassengers([]);
    setAlertMessage(null);
  };

  // ─── Fare Calculation ───
  const currentSeatFare = useMemo(() => {
    if (activeType === 'PLANE') {
      return classType === 'BUSINESS' ? baseFareBusiness * 3.5 : baseFareEconomy * 4.2;
    }
    if (activeType === 'TRAIN') {
      if (classType === 'AC_BERTH') return baseFareBusiness * 1.8;
      if (classType === 'SNIGDHA' || classType === 'BUSINESS') return baseFareBusiness;
      return baseFareEconomy;
    }
    // BUS
    return classType === 'BUSINESS' ? baseFareBusiness : baseFareEconomy;
  }, [activeType, classType, baseFareEconomy, baseFareBusiness]);

  const totalFare = currentSeatFare * selectedSeats.length;

  // ─── Seat Click Handler ───
  const handleSeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) {
      setAlertMessage(`Seat ${seatId} is already booked by another passenger.`);
      return;
    }

    setAlertMessage(null);

    if (selectedSeats.includes(seatId)) {
      // Unselect seat
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
      setPassengers(prev => prev.filter(p => p.seat_number !== seatId));
    } else {
      // Select seat if limit not reached
      if (selectedSeats.length >= seatLimit) {
        setAlertMessage(`Maximum limit reached! You can select up to ${seatLimit} seats per booking for ${activeType.toLowerCase()}.`);
        return;
      }
      setSelectedSeats(prev => [...prev, seatId]);
      setPassengers(prev => [
        ...prev,
        { seat_number: seatId, name: '', age: '', gender: 'MALE', nid: '' }
      ]);
    }
  };

  // ─── Passenger Info Input Handler ───
  const handlePassengerChange = (seatId: string, field: string, value: string) => {
    setPassengers(prev => prev.map(p => p.seat_number === seatId ? { ...p, [field]: value } : p));
  };

  // ─── Quick Fill Demo Passenger Data ───
  const handleQuickFill = () => {
    const demoNames = ['Rafiqul Islam', 'Nusrat Jahan', 'Tanvir Ahmed', 'Farhana Chowdhury', 'Kazi Mahbub'];
    const demoAges = ['28', '24', '35', '30', '42'];
    const demoGenders = ['MALE', 'FEMALE', 'MALE', 'FEMALE', 'MALE'];

    setPassengers(prev => prev.map((p, idx) => ({
      ...p,
      name: p.name || demoNames[idx % demoNames.length],
      age: p.age || demoAges[idx % demoAges.length],
      gender: p.gender || demoGenders[idx % demoGenders.length],
      nid: p.nid || `199${Math.floor(10000000 + Math.random() * 90000000)}`
    })));
  };

  return (
    <div className="w-full space-y-8">
      {/* ─── 1. MODE SWITCHER HEADER TABS ─── */}
      {allowModeSwitching && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl border border-purple-500/20 bg-[#090717]/90 shadow-xl">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-black uppercase tracking-wider text-purple-300 px-3 py-1 bg-purple-500/10 rounded-lg border border-purple-500/20 hidden md:inline-block">
              Transport Type
            </span>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              {/* BUS TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('BUS')}
                className={`relative px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeType === 'BUS'
                    ? 'text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-purple-300 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Bus className={`h-4 w-4 ${activeType === 'BUS' ? 'text-cyan-300 animate-bounce' : ''}`} />
                <span>Bus Coach</span>
                {activeType === 'BUS' && (
                  <motion.div layoutId="activeTab" className="absolute -bottom-1 left-2 right-2 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>

              {/* TRAIN TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('TRAIN')}
                className={`relative px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeType === 'TRAIN'
                    ? 'text-white bg-gradient-to-r from-indigo-600 to-cyan-600 shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-cyan-300 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Train className={`h-4 w-4 ${activeType === 'TRAIN' ? 'text-cyan-300 animate-bounce' : ''}`} />
                <span>Railway Bogie</span>
                {activeType === 'TRAIN' && (
                  <motion.div layoutId="activeTab" className="absolute -bottom-1 left-2 right-2 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>

              {/* PLANE TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('PLANE')}
                className={`relative px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeType === 'PLANE'
                    ? 'text-white bg-gradient-to-r from-cyan-600 via-fuchsia-600 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300 scale-[1.02]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Plane className={`h-4 w-4 ${activeType === 'PLANE' ? 'text-cyan-300 animate-bounce' : ''}`} />
                <span>Flight Cabin</span>
                {activeType === 'PLANE' && (
                  <motion.div layoutId="activeTab" className="absolute -bottom-1 left-2 right-2 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Class Selector per Transport */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] text-slate-400 font-mono">Class:</span>
            {activeType === 'BUS' && (
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleClassSwitch('ECONOMY')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${classType === 'ECONOMY' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  2+2 Luxury Coach
                </button>
                <button
                  type="button"
                  onClick={() => handleClassSwitch('BUSINESS')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${classType === 'BUSINESS' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  2+1 VIP Sleeper
                </button>
              </div>
            )}

            {activeType === 'TRAIN' && (
              <select
                value={classType}
                onChange={(e) => handleClassSwitch(e.target.value)}
                className="bg-slate-950 text-cyan-300 border border-indigo-500/30 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="ECONOMY">Shovon Chair (2+2)</option>
                <option value="SNIGDHA">Snigdha AC Chair (2+2)</option>
                <option value="BUSINESS">AC Seat (Deluxe)</option>
                <option value="AC_BERTH">AC Berth / Cabin Coupe</option>
              </select>
            )}

            {activeType === 'PLANE' && (
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleClassSwitch('ECONOMY')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${classType === 'ECONOMY' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Economy (3+3)
                </button>
                <button
                  type="button"
                  onClick={() => handleClassSwitch('BUSINESS')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${classType === 'BUSINESS' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Business (2+2)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alert Banner */}
      <AnimatePresence>
        {alertMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs font-semibold text-amber-300 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
              <span>{alertMessage}</span>
            </div>
            <button onClick={() => setAlertMessage(null)} className="text-amber-400 hover:text-white text-sm font-bold">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. MAIN TWO-COLUMN LAYOUT (SEAT MAP & SUMMARY) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── LEFT COLUMN: VEHICLE SEAT MAP CHASSIS (7 COLS) ─── */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center relative overflow-hidden bg-[#070514]/90 border border-purple-500/20 shadow-2xl">
          
          {/* Header Title Banner */}
          <div className="w-full pb-4 mb-4 border-b border-purple-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-cyan-400">
                {activeType === 'BUS' && <Bus className="h-6 w-6" />}
                {activeType === 'TRAIN' && <Train className="h-6 w-6 text-indigo-400" />}
                {activeType === 'PLANE' && <Plane className="h-6 w-6 text-cyan-400" />}
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base tracking-wide flex items-center space-x-2">
                  <span>
                    {activeType === 'BUS' ? 'Standard Recliner Coach Layout' : activeType === 'TRAIN' ? 'Bangladesh Railway Bogie Layout' : 'Aircraft Fuselage Cabin Layout'}
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full uppercase border border-cyan-500/30">
                    {classType}
                  </span>
                </h3>
                <p className="text-[11px] text-purple-200/60 font-mono">
                  {activeType === 'BUS' 
                    ? (classType === 'BUSINESS' ? 'VIP 2+1 Recliner Chassis • Driver Cockpit at Front' : 'Standard 2+2 AC Luxury Coach • Front Entrance')
                    : activeType === 'TRAIN'
                    ? (classType === 'AC_BERTH' ? '4-Berth & 2-Berth Coupe Cabin Compartments • Corridor' : 'Bangladesh Railway Standard Carriage Alignment')
                    : (classType === 'BUSINESS' ? 'Dual-Aisle 2+2 Business Cabin • Front Galley' : 'Commercial Flight 3+3 Cabin • Overwing Exit Rows')}
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono block">Fare / Seat</span>
              <span className="text-lg font-extrabold text-emerald-400">৳{currentSeatFare.toLocaleString()}</span>
            </div>
          </div>

          {/* ─── VEHICLE CHASSIS SEATING GRAPHICS ─── */}
          <div className="w-full flex justify-center py-2">

            {/* 🚌 1. BUS SEAT LAYOUT CHASSIS */}
            {activeType === 'BUS' && (
              <div className="relative w-full max-w-[360px] bg-[#0A0818] border-2 border-purple-500/30 rounded-t-[50px] rounded-b-2xl p-5 shadow-[0_0_35px_rgba(168,85,247,0.15)] flex flex-col space-y-4">
                
                {/* Windshield & Driver Cockpit */}
                <div className="relative border-b border-purple-500/20 pb-4">
                  <div className="h-5 w-4/5 mx-auto rounded-t-full border-t-2 border-x-2 border-cyan-400/50 bg-gradient-to-b from-cyan-500/20 to-transparent mb-3 text-[9px] text-cyan-300 font-mono flex items-center justify-center tracking-widest uppercase shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    🚌 BUS FRONT WINDSHIELD
                  </div>

                  <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400">
                    <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 uppercase font-mono">Passenger Door</span>
                    </div>

                    <div className="flex items-center space-x-2 bg-purple-950/70 border border-purple-500/30 px-3 py-1 rounded-lg">
                      <span className="text-[10px] text-purple-300 font-mono font-bold uppercase">Driver Cockpit (RHD)</span>
                      <div className="h-4 w-4 rounded-full border-2 border-dashed border-purple-400 animate-spin" style={{ animationDuration: '20s' }} />
                    </div>
                  </div>
                </div>

                {/* Column Window/Aisle Indicators */}
                <div className="flex justify-between text-[10px] font-mono text-purple-300/70 px-2 border-b border-purple-500/10 pb-2">
                  <span>🪟 WIN</span>
                  {classType === 'BUSINESS' ? (
                    <>
                      <span>🚶 AISLE</span>
                      <span>🪟 WIN</span>
                    </>
                  ) : (
                    <>
                      <span>🚶 AISLE</span>
                      <span className="text-cyan-400 font-bold">◄ CENTRAL AISLE ►</span>
                      <span>🚶 AISLE</span>
                      <span>🪟 WIN</span>
                    </>
                  )}
                </div>

                {/* Bus Seats Grid */}
                <div className={`grid gap-3 ${classType === 'BUSINESS' ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(row => {
                    const cols = classType === 'BUSINESS' ? ['1', '2', '3'] : ['1', '2', '3', '4'];
                    return cols.map(col => {
                      const seatId = `${row}${col}`;
                      const isAvail = !bookedSet.has(seatId);
                      const isSel = selectedSeats.includes(seatId);
                      const isAisleRight = classType === 'BUSINESS' ? col === '1' : col === '2';
                      const isWindow = classType === 'BUSINESS' ? (col === '1' || col === '3') : (col === '1' || col === '4');

                      return (
                        <React.Fragment key={seatId}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seatId, isAvail)}
                            onMouseEnter={() => setActiveHoverSeat(seatId)}
                            onMouseLeave={() => setActiveHoverSeat(null)}
                            disabled={!isAvail}
                            className={`h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative cursor-pointer ${
                              !isAvail 
                                ? 'bg-slate-900/90 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                : isSel
                                ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 border border-purple-200 text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] scale-105 z-10'
                                : 'bg-[#15112B] border border-purple-500/25 text-purple-200 hover:border-cyan-400 hover:text-white hover:bg-purple-900/40'
                            }`}
                          >
                            <Armchair className={`h-3.5 w-3.5 absolute opacity-15 ${isSel ? 'text-white' : 'text-purple-300'}`} />
                            <span className="z-10 text-[11px] font-mono">{seatId}</span>
                            {isWindow && <span className="text-[7px] text-cyan-400/80 font-mono leading-none -mt-0.5">WIN</span>}
                          </button>
                          {isAisleRight && <div className="w-4 flex items-center justify-center text-[9px] text-purple-500/40 font-mono select-none">│</div>}
                        </React.Fragment>
                      );
                    });
                  })}
                </div>

                {/* Rear Engine & Emergency Exit */}
                <div className="mt-4 pt-3 border-t border-purple-500/20 text-center text-[10px] font-mono text-purple-300/50 uppercase tracking-widest flex items-center justify-between px-2">
                  <span>⚙️ REAR ENGINE BAY</span>
                  <span className="text-red-400/80">🚨 EMERGENCY EXIT</span>
                </div>
              </div>
            )}

            {/* 🚆 2. TRAIN SEAT LAYOUT CHASSIS (BANGLADESH RAILWAY) */}
            {activeType === 'TRAIN' && (
              <div className="relative w-full max-w-[400px] bg-[#0A0818] border-2 border-indigo-500/40 rounded-2xl p-5 shadow-[0_0_35px_rgba(99,102,241,0.2)] flex flex-col space-y-4">
                
                {/* Bogie Front Coupler & Amenities */}
                <div className="border-b border-indigo-500/20 pb-3 flex items-center justify-between text-[10px] font-mono text-indigo-300">
                  <div className="flex items-center space-x-1 bg-indigo-950/70 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                    <span>🚽 TOILET</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-cyan-400 uppercase tracking-widest">══ FRONT BOGIE COUPLER ══</span>
                    <span className="text-[9px] text-slate-400 font-sans">BANGLADESH RAILWAY (BR)</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-indigo-950/70 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                    <span>⚡ 220V POWER</span>
                  </div>
                </div>

                {/* AC BERTH COUPE CABIN LAYOUT vs CHAIR CAR */}
                {classType === 'AC_BERTH' ? (
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    <div className="text-center text-[10px] font-mono text-cyan-400 bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-500/20">
                      🚪 COUPE COMPARTMENT CABIN LAYOUT (UPPER & LOWER BERTHS)
                    </div>

                    {[1, 2, 3, 4, 5, 6].map(cabinNum => {
                      const berths = [
                        { id: `C${cabinNum}-LB1`, label: `Cabin ${cabinNum} • Lower Berth 1`, type: 'LB' },
                        { id: `C${cabinNum}-UB1`, label: `Cabin ${cabinNum} • Upper Berth 1`, type: 'UB' },
                        { id: `C${cabinNum}-LB2`, label: `Cabin ${cabinNum} • Lower Berth 2`, type: 'LB' },
                        { id: `C${cabinNum}-UB2`, label: `Cabin ${cabinNum} • Upper Berth 2`, type: 'UB' },
                      ];

                      return (
                        <div key={cabinNum} className="border border-indigo-500/30 bg-indigo-950/30 rounded-xl p-3 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-indigo-300 border-b border-indigo-500/20 pb-1">
                            <span>🚪 COMPARTMENT COUPE C-{cabinNum}</span>
                            <span className="text-cyan-400">SLIDING DOOR 🔒</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {berths.map(b => {
                              const isAvail = !bookedSet.has(b.id);
                              const isSel = selectedSeats.includes(b.id);

                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => handleSeatClick(b.id, isAvail)}
                                  disabled={!isAvail}
                                  className={`h-11 rounded-lg flex items-center justify-between px-3 text-xs font-bold transition-all cursor-pointer ${
                                    !isAvail
                                      ? 'bg-slate-900/90 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                      : isSel
                                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.8)] border border-white'
                                      : 'bg-[#15112B] border border-indigo-500/30 text-indigo-200 hover:border-cyan-400 hover:text-white'
                                  }`}
                                >
                                  <span className="font-mono text-[11px]">{b.id}</span>
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${b.type === 'LB' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                    {b.type === 'LB' ? 'LOWER' : 'UPPER'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Standard Chair Coach Grid */
                  <>
                    <div className="flex justify-between text-[10px] font-mono text-indigo-300/70 border-b border-indigo-500/10 pb-2">
                      <span>🪟 WINDOW</span>
                      <span>CORRIDOR</span>
                      <span className="text-indigo-400 font-bold">🚶 CENTRAL CORRIDOR</span>
                      <span>CORRIDOR</span>
                      <span>🪟 WINDOW</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 max-h-[440px] overflow-y-auto pr-1">
                      {Array.from({ length: 14 }).map((_, rIdx) => {
                        return ['1', '2', '3', '4'].map(col => {
                          const seatNum = `S${rIdx * 4 + parseInt(col)}`;
                          const isAvail = !bookedSet.has(seatNum);
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
                                    ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 border border-purple-200 text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] scale-105 z-10'
                                    : 'bg-[#15112B] border border-indigo-500/30 text-indigo-200 hover:border-cyan-400 hover:text-white hover:bg-indigo-900/40'
                                }`}
                              >
                                <span className="z-10 text-[10px] font-mono">{seatNum}</span>
                                {isWindow && <span className="text-[7px] text-indigo-300/80 font-mono leading-none -mt-0.5">WIN</span>}
                              </button>
                              {isAisleRight && <div className="w-3 flex items-center justify-center text-[9px] text-indigo-500/40 font-mono select-none">║</div>}
                            </React.Fragment>
                          );
                        });
                      })}
                    </div>
                  </>
                )}

                {/* Bogie Rear Coupling */}
                <div className="pt-3 border-t border-indigo-500/20 text-center text-[10px] font-mono text-indigo-300/50 uppercase tracking-widest flex items-center justify-between px-2">
                  <span>🚽 TOILET</span>
                  <span>══ REAR COUPLER ══</span>
                  <span className="text-amber-400/80">🧯 BRAKE VALVE</span>
                </div>
              </div>
            )}

            {/* ✈️ 3. AIRCRAFT FUSELAGE SEAT LAYOUT CHASSIS */}
            {activeType === 'PLANE' && (
              <div className="relative w-full max-w-[420px] bg-[#0A0818] border-2 border-cyan-500/40 rounded-t-[100px] rounded-b-3xl p-5 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col space-y-4">
                
                {/* Aircraft Nose Cone & Cockpit Flight Deck */}
                <div className="relative border-b border-cyan-500/20 pb-4 text-center">
                  <div className="h-7 w-3/5 mx-auto rounded-t-full bg-cyan-500/20 border-t-2 border-x-2 border-cyan-400/70 flex items-center justify-center text-[10px] font-extrabold text-cyan-200 font-mono uppercase tracking-widest mb-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    ✈️ FLIGHT DECK / COCKPIT
                  </div>
                  <div className="flex justify-between items-center px-4 text-[10px] font-mono text-cyan-300">
                    <span className="bg-slate-900/90 border border-cyan-500/30 px-2 py-0.5 rounded text-[9px]">🍽️ FRONT GALLEY</span>
                    <span className="text-cyan-400 font-bold uppercase">{classType === 'BUSINESS' ? 'BUSINESS 2+2' : 'ECONOMY 3+3'}</span>
                    <span className="bg-slate-900/90 border border-cyan-500/30 px-2 py-0.5 rounded text-[9px]">🚽 LAVATORY</span>
                  </div>
                </div>

                {/* Seat Position Column Labels */}
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
                <div className={`grid gap-2 max-h-[440px] overflow-y-auto pr-1 ${classType === 'BUSINESS' ? 'grid-cols-4' : 'grid-cols-6'}`}>
                  {Array.from({ length: classType === 'BUSINESS' ? 6 : 10 }).map((_, rowNum) => {
                    const r = rowNum + 1;
                    const isOverwing = r >= 4 && r <= 6;
                    const cols = classType === 'BUSINESS' ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E', 'F'];

                    return cols.map(col => {
                      const seatId = `${r}${col}`;
                      const isAvail = !bookedSet.has(seatId);
                      const isSel = selectedSeats.includes(seatId);
                      const isAisleRight = classType === 'BUSINESS' ? col === 'B' : col === 'C';

                      return (
                        <React.Fragment key={seatId}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seatId, isAvail)}
                            disabled={!isAvail}
                            className={`h-9 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-all relative cursor-pointer ${
                              !isAvail
                                ? 'bg-slate-900/90 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                                : isSel
                                ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-cyan-400 border border-purple-200 text-white shadow-[0_0_20px_rgba(168,85,247,0.8)] scale-105 z-10'
                                : 'bg-[#15112B] border border-cyan-500/25 text-cyan-200 hover:border-purple-400 hover:text-white hover:bg-cyan-950/40'
                            }`}
                          >
                            <span className="z-10 font-mono">{seatId}</span>
                          </button>
                          {isAisleRight && <div className="w-2 flex items-center justify-center text-[8px] text-cyan-500/40 font-mono select-none">│</div>}
                        </React.Fragment>
                      );
                    });
                  })}
                </div>

                {/* Overwing Exit Banner */}
                <div className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/40 border border-cyan-500/20 rounded-lg p-1.5 text-center flex items-center justify-between px-3">
                  <span>◀ WING</span>
                  <span className="font-bold text-cyan-300 uppercase tracking-widest">✈️ OVERWING EMERGENCY EXIT</span>
                  <span>WING ▶</span>
                </div>

                {/* Tail / Rear Galley */}
                <div className="pt-2 border-t border-cyan-500/20 text-center text-[10px] font-mono text-cyan-300/60 uppercase tracking-widest flex items-center justify-between px-2">
                  <span>REAR LAVATORY 🚽</span>
                  <span className="text-cyan-400">AFT EXIT 🚪</span>
                  <span>REAR GALLEY 🍽️</span>
                </div>
              </div>
            )}

          </div>

          {/* ─── REAL-TIME SEATING LEGEND ─── */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs font-semibold text-purple-200/80 bg-[#0E0C1E] p-3.5 rounded-2xl border border-purple-500/20 w-full">
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-[#15112B] border border-purple-500/30 rounded" />
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
              <span className="text-cyan-300">Window / Outer</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: PASSENGER FORM & FARE SUMMARY (5 COLS) ─── */}
        <div className="lg:col-span-5 space-y-6">

          {/* No Seats Selected Placeholder */}
          {selectedSeats.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-4 border border-dashed border-slate-800 flex flex-col items-center justify-center min-h-[340px] bg-[#070514]/70">
              <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 animate-pulse">
                <Armchair className="h-10 w-10" />
              </div>
              <h4 className="text-white font-bold text-base tracking-wide">No Seats Selected</h4>
              <p className="text-slate-400 text-xs max-w-xs">
                Click on any available seat on the vehicle chart to choose your preferred location. You can select up to <span className="text-cyan-300 font-bold">{seatLimit} seats</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Passenger Inputs Card */}
              <div className="glass-panel rounded-3xl p-6 space-y-5 bg-[#070514]/90 border border-purple-500/20 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    <span>Passenger Information ({passengers.length})</span>
                  </h3>

                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Quick Auto-Fill</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {passengers.map((p, idx) => (
                    <div key={p.seat_number} className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                        <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">Passenger {idx + 1}</span>
                        <span className="text-[11px] bg-purple-950/80 border border-purple-500/30 text-cyan-300 px-2.5 py-0.5 rounded-lg font-mono font-bold">
                          Seat: {p.seat_number}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Name */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            required
                            value={p.name}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'name', e.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                            placeholder="E.g., Tanvir Hossain"
                          />
                        </div>

                        {/* Age */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={p.age}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'age', e.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                            placeholder="26"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Gender */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'gender', e.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        {/* NID / Passport */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NID / Passport</label>
                          <input
                            type="text"
                            value={p.nid}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'nid', e.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                            placeholder="Optional NID"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="glass-panel rounded-3xl p-6 space-y-4 bg-[#070514]/90 border border-purple-500/20 shadow-xl">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span>Ticket Price Breakdown</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Seats ({selectedSeats.length}):</span>
                    <span className="text-cyan-300 font-mono font-bold">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rate per Ticket ({classType}):</span>
                    <span className="text-slate-200 font-semibold">৳{currentSeatFare.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-white text-sm">Total Fare:</span>
                    <span className="font-black text-emerald-400 text-xl">৳{totalFare.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (onBookingConfirm) {
                      onBookingConfirm({
                        transportType: activeType,
                        classType,
                        selectedSeats,
                        passengers,
                        totalFare
                      });
                    } else {
                      alert(`🎉 Booking Confirmed! Mode: ${activeType}, Seats: ${selectedSeats.join(', ')}, Total: ৳${totalFare.toLocaleString()}`);
                    }
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-indigo-600 to-fuchsia-600 hover:from-cyan-300 hover:to-fuchsia-500 py-3.5 font-black text-slate-950 text-sm flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-cyan-500/20 hover:scale-[1.01] transition-all"
                >
                  <span>CONFIRM TICKET RESERVATION</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
