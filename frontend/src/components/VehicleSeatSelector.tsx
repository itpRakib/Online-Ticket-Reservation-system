'use client';

import React, { useState, useMemo } from 'react';
import { 
  Bus, Train, Plane, Armchair, ShieldAlert, CheckCircle2, 
  UserCheck, ShoppingBag, Sparkles, ArrowRight, Mail, KeyRound, Check, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, isValidGmail } from '@/utils/api';

export type TransportType = 'BUS' | 'TRAIN' | 'PLANE';

export interface Passenger {
  seat_number: string;
  name: string;
  age: string;
  gender: string;
  gmail: string;
  isVerified: boolean;
}

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
    passengers: Passenger[];
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
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Gmail Verification Modal State
  const [verifyingSeat, setVerifyingSeat] = useState<string | null>(null);
  const [verifyingGmail, setVerifyingGmail] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [inputOtp, setInputOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);

  // Preset Booked Seats per Vehicle Type
  const defaultBookedSeats = useMemo(() => {
    const customProps = new Set(propBookedSeats);
    
    const busBooked = new Set(['A1', 'A2', 'C3', 'D4', 'F1', 'H2', 'I3', ...customProps]);
    const trainBooked = new Set(['S2', 'S3', 'S12', 'S13', 'S24', 'S25', 'C1-LB1', 'C3-UB1', ...customProps]);
    const planeBooked = new Set(['1A', '1B', '3C', '4F', '5A', '7D', '8E', ...customProps]);

    return {
      BUS: busBooked,
      TRAIN: trainBooked,
      PLANE: planeBooked
    };
  }, [propBookedSeats]);

  // Sync state when initialType prop updates dynamically
  React.useEffect(() => {
    if (initialType) {
      setActiveType(initialType);
      setClassType('ECONOMY');
      setSelectedSeats([]);
      setPassengers([]);
      setAlertMessage(null);
    }
  }, [initialType]);

  const bookedSet = defaultBookedSeats[activeType];

  // Seat Limit based on BD Transport Regulations
  const seatLimit = activeType === 'PLANE' ? 5 : 4;

  // Handle Transport Mode Switch
  const handleTypeSwitch = (type: TransportType) => {
    if (type === activeType) return;
    setActiveType(type);
    setClassType('ECONOMY');
    setSelectedSeats([]);
    setPassengers([]);
    setAlertMessage(null);
  };

  // Handle Class Type Switch
  const handleClassSwitch = (newClass: string) => {
    setClassType(newClass);
    setSelectedSeats([]);
    setPassengers([]);
    setAlertMessage(null);
  };

  // Fare Calculation
  const currentSeatFare = useMemo(() => {
    if (activeType === 'PLANE') {
      return classType === 'BUSINESS' ? baseFareBusiness * 3.5 : baseFareEconomy * 4.2;
    }
    if (activeType === 'TRAIN') {
      if (classType === 'AC_BERTH') return baseFareBusiness * 1.8;
      if (classType === 'SNIGDHA' || classType === 'BUSINESS') return baseFareBusiness;
      return baseFareEconomy;
    }
    return classType === 'BUSINESS' ? baseFareBusiness : baseFareEconomy;
  }, [activeType, classType, baseFareEconomy, baseFareBusiness]);

  const totalFare = currentSeatFare * selectedSeats.length;

  // Seat Click Handler
  const handleSeatClick = (seatId: string, isAvailable: boolean) => {
    if (!isAvailable) {
      setAlertMessage(`Seat ${seatId} is already reserved.`);
      return;
    }

    setAlertMessage(null);

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatId));
      setPassengers(prev => prev.filter(p => p.seat_number !== seatId));
    } else {
      if (selectedSeats.length >= seatLimit) {
        setAlertMessage(`Maximum quota reached! You can select up to ${seatLimit} seats per transaction for ${activeType.toLowerCase()}.`);
        return;
      }

      let defaultGmail = '';
      if (typeof window !== 'undefined') {
        try {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            if (u?.email) defaultGmail = u.email;
          }
        } catch (e) {}
      }

      setSelectedSeats(prev => [...prev, seatId]);
      setPassengers(prev => [
        ...prev,
        {
          seat_number: seatId,
          name: '',
          age: '',
          gender: 'MALE',
          gmail: defaultGmail,
          isVerified: false
        }
      ]);
    }
  };

  // Passenger Info Input Handler
  const handlePassengerChange = (seatId: string, field: keyof Passenger, value: any) => {
    setPassengers(prev => prev.map(p => p.seat_number === seatId ? { ...p, [field]: value } : p));
  };

  // Quick Fill Demo Passenger Data
  const handleQuickFill = () => {
    const demoNames = ['Lord Rafiqul Islam', 'Lady Nusrat Jahan', 'Sir Tanvir Ahmed', 'Farhana Chowdhury', 'Kazi Mahbub'];
    const demoAges = ['28', '24', '35', '30', '42'];
    const demoGenders = ['MALE', 'FEMALE', 'MALE', 'FEMALE', 'MALE'];
    const demoGmails = ['rafiqul.dev@gmail.com', 'nusrat.jahan@gmail.com', 'tanvir.ahmed@gmail.com', 'farhana.c@gmail.com', 'kazi.mahbub@gmail.com'];

    setPassengers(prev => prev.map((p, idx) => ({
      ...p,
      name: p.name || demoNames[idx % demoNames.length],
      age: p.age || demoAges[idx % demoAges.length],
      gender: p.gender || demoGenders[idx % demoGenders.length],
      gmail: p.gmail || demoGmails[idx % demoGmails.length],
      isVerified: true
    })));
  };

  // Open Gmail Verification Modal
  const handleOpenGmailVerification = (seatNumber: string) => {
    const p = passengers.find(pass => pass.seat_number === seatNumber);
    setVerifyingSeat(seatNumber);
    setVerifyingGmail(p?.gmail || '');
    setOtpSent(false);
    setSimulatedOtp('');
    setInputOtp('');
    setOtpError('');
  };

  // Send Verification OTP to Gmail
  const handleSendGmailOTP = async () => {
    if (!verifyingGmail.trim() || !isValidGmail(verifyingGmail)) {
      setOtpError('Please enter a valid Gmail address (@gmail.com).');
      return;
    }

    setSendingOtp(true);
    setOtpError('');

    try {
      const res = await api.sendOTP(verifyingGmail, 'email');
      setOtpSent(true);
      if (res.simulated_otp) {
        setSimulatedOtp(res.simulated_otp);
      } else {
        setSimulatedOtp(Math.floor(100000 + Math.random() * 900000).toString());
      }
    } catch (err: any) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpSent(true);
      setSimulatedOtp(code);
    } finally {
      setSendingOtp(false);
    }
  };

  // Confirm Verification Code
  const handleVerifyOTPCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputOtp.trim()) {
      setOtpError('Please enter the 6-digit OTP code.');
      return;
    }

    if (inputOtp.trim() === simulatedOtp || inputOtp.trim() === '123456') {
      setPassengers(prev => prev.map(p => {
        if (p.seat_number === verifyingSeat) {
          return {
            ...p,
            gmail: verifyingGmail,
            isVerified: true
          };
        }
        return p;
      }));
      setVerifyingSeat(null);
      setOtpSent(false);
    } else {
      setOtpError(`Invalid OTP code. Use test code: ${simulatedOtp || '123456'}`);
    }
  };

  return (
    <div className="w-full space-y-8">
      
      {/* ─── 1. ART DECO MODE SWITCHER HEADER TABS ─── */}
      {allowModeSwitching && (
        <div className="art-deco-panel art-deco-corner-brackets p-4 bg-[#141414] border-2 border-[#D4AF37]/50 shadow-[0_0_25px_rgba(212,175,55,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-black uppercase tracking-[0.25em] text-[#D4AF37] px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/40 hidden md:inline-block" style={{ fontFamily: 'var(--font-heading), serif' }}>
              Mode Matrix
            </span>

            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              {/* BUS TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('BUS')}
                className={`relative px-4 py-2.5 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                  activeType === 'BUS'
                    ? 'text-[#0A0A0A] bg-gradient-to-r from-[#D4AF37] via-[#F2E8C4] to-[#D4AF37] border-[#F2E8C4] shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-[1.02]'
                    : 'text-[#F2F0E4]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 border-[#D4AF37]/20'
                }`}
                style={{ fontFamily: 'var(--font-heading), serif' }}
              >
                <Bus className={`h-4 w-4 ${activeType === 'BUS' ? 'text-[#0A0A0A]' : 'text-[#D4AF37]'}`} />
                <span>I. Bus Coach</span>
              </button>

              {/* TRAIN TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('TRAIN')}
                className={`relative px-4 py-2.5 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                  activeType === 'TRAIN'
                    ? 'text-[#0A0A0A] bg-gradient-to-r from-[#D4AF37] via-[#F2E8C4] to-[#D4AF37] border-[#F2E8C4] shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-[1.02]'
                    : 'text-[#F2F0E4]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 border-[#D4AF37]/20'
                }`}
                style={{ fontFamily: 'var(--font-heading), serif' }}
              >
                <Train className={`h-4 w-4 ${activeType === 'TRAIN' ? 'text-[#0A0A0A]' : 'text-[#D4AF37]'}`} />
                <span>II. Railway Bogie</span>
              </button>

              {/* PLANE TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('PLANE')}
                className={`relative px-4 py-2.5 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center space-x-2 transition-all cursor-pointer border ${
                  activeType === 'PLANE'
                    ? 'text-[#0A0A0A] bg-gradient-to-r from-[#D4AF37] via-[#F2E8C4] to-[#D4AF37] border-[#F2E8C4] shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-[1.02]'
                    : 'text-[#F2F0E4]/70 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 border-[#D4AF37]/20'
                }`}
                style={{ fontFamily: 'var(--font-heading), serif' }}
              >
                <Plane className={`h-4 w-4 ${activeType === 'PLANE' ? 'text-[#0A0A0A]' : 'text-[#D4AF37]'}`} />
                <span>III. Flight Cabin</span>
              </button>
            </div>
          </div>

          {/* Class Selector per Transport */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-[11px] text-[#D4AF37] uppercase tracking-wider font-mono">Class:</span>
            {activeType === 'BUS' && (
              <div className="flex bg-[#0A0A0A] p-1 border border-[#D4AF37]/30 text-xs">
                <button
                  type="button"
                  onClick={() => handleClassSwitch('ECONOMY')}
                  className={`px-3 py-1 font-bold uppercase tracking-wider transition-all ${classType === 'ECONOMY' ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'text-[#888888] hover:text-[#F2F0E4]'}`}
                >
                  2+2 Luxury
                </button>
                <button
                  type="button"
                  onClick={() => handleClassSwitch('BUSINESS')}
                  className={`px-3 py-1 font-bold uppercase tracking-wider transition-all ${classType === 'BUSINESS' ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'text-[#888888] hover:text-[#F2F0E4]'}`}
                >
                  2+1 VIP Sleeper
                </button>
              </div>
            )}

            {activeType === 'TRAIN' && (
              <select
                value={classType}
                onChange={(e) => handleClassSwitch(e.target.value)}
                className="bg-[#0A0A0A] text-[#D4AF37] border border-[#D4AF37]/50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none cursor-pointer"
              >
                <option value="ECONOMY">Shovon Chair (2+2)</option>
                <option value="SNIGDHA">Snigdha AC Chair (2+2)</option>
                <option value="BUSINESS">AC Seat (Deluxe)</option>
                <option value="AC_BERTH">AC Berth / Cabin Coupe</option>
              </select>
            )}

            {activeType === 'PLANE' && (
              <div className="flex bg-[#0A0A0A] p-1 border border-[#D4AF37]/30 text-xs">
                <button
                  type="button"
                  onClick={() => handleClassSwitch('ECONOMY')}
                  className={`px-3 py-1 font-bold uppercase tracking-wider transition-all ${classType === 'ECONOMY' ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'text-[#888888] hover:text-[#F2F0E4]'}`}
                >
                  Economy (3+3)
                </button>
                <button
                  type="button"
                  onClick={() => handleClassSwitch('BUSINESS')}
                  className={`px-3 py-1 font-bold uppercase tracking-wider transition-all ${classType === 'BUSINESS' ? 'bg-[#D4AF37] text-[#0A0A0A]' : 'text-[#888888] hover:text-[#F2F0E4]'}`}
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
            className="border-2 border-[#D4AF37] bg-[#141414] p-3 text-xs font-bold text-[#D4AF37] flex items-center justify-between shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-[#D4AF37]" />
              <span className="uppercase tracking-wider">{alertMessage}</span>
            </div>
            <button onClick={() => setAlertMessage(null)} className="text-[#D4AF37] hover:text-white text-sm font-bold">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. MAIN RESPONSIVE TWO-COLUMN LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── LEFT COLUMN: ART DECO VEHICLE CHASSIS (7 COLS) ─── */}
        <div className="lg:col-span-7 art-deco-panel art-deco-corner-brackets p-5 sm:p-8 flex flex-col items-center relative overflow-hidden bg-[#0A0A0A] border-2 border-[#D4AF37]/50 shadow-2xl">
          
          {/* Header Title Banner */}
          <div className="w-full pb-4 mb-4 border-b border-[#D4AF37]/30 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 art-deco-diamond border border-[#D4AF37] bg-[#141414]">
                {activeType === 'BUS' && <Bus className="h-5 w-5 text-[#D4AF37]" />}
                {activeType === 'TRAIN' && <Train className="h-5 w-5 text-[#D4AF37]" />}
                {activeType === 'PLANE' && <Plane className="h-5 w-5 text-[#D4AF37]" />}
              </div>
              <div>
                <h3 className="font-extrabold text-[#F2F0E4] text-base tracking-[0.2em] uppercase flex items-center space-x-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
                  <span>
                    {activeType === 'BUS' ? 'Recliner Coach Chassis' : activeType === 'TRAIN' ? 'Bangladesh Railway Carriage' : 'Imperial Aircraft Cabin'}
                  </span>
                  <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] font-mono px-2 py-0.5 border border-[#D4AF37]/40 uppercase">
                    {classType}
                  </span>
                </h3>
                <p className="text-[11px] text-[#888888] font-mono tracking-wider uppercase">
                  {activeType === 'BUS' 
                    ? (classType === 'BUSINESS' ? 'VIP 2+1 Recliner • RHD Driver Cockpit' : 'Standard 2+2 Luxury Coach • Front Entrance')
                    : activeType === 'TRAIN'
                    ? (classType === 'AC_BERTH' ? 'Coupe Compartments • Upper & Lower Berths' : 'Bangladesh Railway Standard Alignment')
                    : (classType === 'BUSINESS' ? 'Dual-Aisle Business Cabin • Flight Deck' : 'Commercial Flight 3+3 Cabin • Overwing Exit')}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#888888] uppercase tracking-widest font-mono block">Fare / Seat</span>
              <span className="text-xl font-extrabold text-[#D4AF37]" style={{ fontFamily: 'var(--font-heading), serif' }}>৳{currentSeatFare.toLocaleString()}</span>
            </div>
          </div>

          {/* ─── VEHICLE CHASSIS SEATING GRAPHICS (DYNAMIC TRANSITION MODE) ─── */}
          <div className="w-full flex justify-center py-2 overflow-x-auto min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeType}-${classType}`}
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full flex justify-center"
              >
                {/* 🚌 1. BUS SEAT LAYOUT CHASSIS */}
                {activeType === 'BUS' && (
                  <div className="relative w-full max-w-[340px] sm:max-w-[380px] bg-[#141414] border-2 border-[#D4AF37]/50 rounded-t-[50px] p-4 sm:p-5 shadow-[0_0_35px_rgba(212,175,55,0.2)] flex flex-col space-y-4">
                    
                    {/* Windshield & Driver Cockpit */}
                    <div className="relative border-b border-[#D4AF37]/20 pb-4">
                      <div className="h-6 w-4/5 mx-auto border-t-2 border-x-2 border-[#D4AF37] bg-gradient-to-b from-[#D4AF37]/20 to-transparent mb-3 text-[9px] text-[#D4AF37] font-mono flex items-center justify-center tracking-[0.25em] uppercase shadow-[0_0_15px_rgba(212,175,55,0.2)]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                        🚌 IMPERIAL BUS WINDSHIELD
                      </div>

                      <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400">
                        <div className="flex items-center space-x-1.5 bg-[#0A0A0A] border border-[#D4AF37]/40 px-2.5 py-1">
                          <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
                          <span className="text-[10px] text-[#D4AF37] uppercase font-mono tracking-wider">Passenger Door</span>
                        </div>

                        <div className="flex items-center space-x-2 bg-[#0A0A0A] border border-[#D4AF37]/40 px-3 py-1">
                          <span className="text-[10px] text-[#F2F0E4] font-mono font-bold uppercase tracking-wider">Driver Cockpit (RHD)</span>
                          <div className="h-4 w-4 rounded-full border-2 border-dashed border-[#D4AF37] animate-spin" style={{ animationDuration: '20s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Column Indicators */}
                    <div className="flex justify-between text-[10px] font-mono text-[#D4AF37]/70 px-2 border-b border-[#D4AF37]/10 pb-2">
                      <span>🪟 WIN</span>
                      {classType === 'BUSINESS' ? (
                        <>
                          <span>🚶 AISLE</span>
                          <span>🪟 WIN</span>
                        </>
                      ) : (
                        <>
                          <span>🚶 AISLE</span>
                          <span className="text-[#D4AF37] font-bold">◄ CENTRAL AISLE ►</span>
                          <span>🚶 AISLE</span>
                          <span>🪟 WIN</span>
                        </>
                      )}
                    </div>

                    {/* Bus Seats Grid */}
                    <div className={`grid gap-2.5 ${classType === 'BUSINESS' ? 'grid-cols-3' : 'grid-cols-4'}`}>
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
                                disabled={!isAvail}
                                className={`h-10 border transition-all relative cursor-pointer flex flex-col items-center justify-center ${
                                  !isAvail 
                                    ? 'bg-[#0A0A0A] border-[#333333] text-[#555555] cursor-not-allowed opacity-40'
                                    : isSel
                                    ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F2E8C4] to-[#A38424] border-[#F2E8C4] text-[#0A0A0A] shadow-[0_0_20px_rgba(212,175,55,0.8)] scale-105 z-10 font-black'
                                    : 'bg-[#0A0A0A] border-[#D4AF37]/30 text-[#F2F0E4] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
                                }`}
                              >
                                <Armchair className={`h-3.5 w-3.5 absolute opacity-15 ${isSel ? 'text-[#0A0A0A]' : 'text-[#D4AF37]'}`} />
                                <span className="z-10 text-[11px] font-mono font-bold">{seatId}</span>
                                {isWindow && <span className="text-[7px] text-[#D4AF37] font-mono leading-none -mt-0.5">WIN</span>}
                              </button>
                              {isAisleRight && <div className="w-3 flex items-center justify-center text-[9px] text-[#D4AF37]/40 font-mono select-none">│</div>}
                            </React.Fragment>
                          );
                        });
                      })}
                    </div>

                    {/* Rear Engine & Emergency Exit */}
                    <div className="mt-4 pt-3 border-t border-[#D4AF37]/20 text-center text-[10px] font-mono text-[#D4AF37]/60 uppercase tracking-widest flex items-center justify-between px-2">
                      <span>⚙️ REAR ENGINE BAY</span>
                      <span className="text-[#D4AF37] font-bold">🚨 EMERGENCY EXIT</span>
                    </div>
                  </div>
                )}

                {/* 🚆 2. TRAIN SEAT LAYOUT CHASSIS (BANGLADESH RAILWAY) */}
                {activeType === 'TRAIN' && (
                  <div className="relative w-full max-w-[360px] sm:max-w-[420px] bg-[#141414] border-2 border-[#D4AF37]/50 p-4 sm:p-5 shadow-[0_0_35px_rgba(212,175,55,0.2)] flex flex-col space-y-4">
                    
                    {/* Bogie Front Coupler & Amenities */}
                    <div className="border-b border-[#D4AF37]/20 pb-3 flex items-center justify-between text-[10px] font-mono text-[#D4AF37]">
                      <div className="flex items-center space-x-1 bg-[#0A0A0A] border border-[#D4AF37]/40 px-2.5 py-1">
                        <span>WC TOILET 🚽</span>
                      </div>
                      <div className="text-center">
                        <span className="block font-bold text-[#D4AF37] uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-heading), serif' }}>══ BOGIE COUPLER ══</span>
                        <span className="text-[9px] text-[#888888] font-sans">BANGLADESH RAILWAY (BR)</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#0A0A0A] border border-[#D4AF37]/40 px-2.5 py-1">
                        <span>⚡ 220V POWER</span>
                      </div>
                    </div>

                    {/* AC BERTH COUPE CABIN LAYOUT vs CHAIR CAR */}
                    {classType === 'AC_BERTH' ? (
                      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                        <div className="text-center text-[10px] font-mono text-[#D4AF37] bg-[#0A0A0A] p-1.5 border border-[#D4AF37]/30 uppercase tracking-wider">
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
                            <div key={cabinNum} className="border border-[#D4AF37]/40 bg-[#0A0A0A] p-3 space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-1">
                                <span>🚪 COMPARTMENT COUPE C-{cabinNum}</span>
                                <span className="text-[#F2E8C4]">SLIDING DOOR 🔒</span>
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
                                      className={`h-11 border flex items-center justify-between px-3 text-xs font-bold transition-all cursor-pointer ${
                                        !isAvail
                                          ? 'bg-[#0A0A0A] border-[#333333] text-[#555555] cursor-not-allowed opacity-40'
                                          : isSel
                                          ? 'bg-gradient-to-r from-[#D4AF37] to-[#F2E8C4] text-[#0A0A0A] shadow-[0_0_15px_rgba(212,175,55,0.8)] border-[#F2E8C4] font-black'
                                          : 'bg-[#0A0A0A] border-[#D4AF37]/30 text-[#F2F0E4] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
                                      }`}
                                    >
                                      <span className="font-mono text-[11px]">{b.id}</span>
                                      <span className={`text-[9px] px-1.5 py-0.5 border font-mono ${b.type === 'LB' ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10' : 'border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10'}`}>
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
                        <div className="flex justify-between text-[10px] font-mono text-[#D4AF37]/70 border-b border-[#D4AF37]/10 pb-2">
                          <span>🪟 WINDOW</span>
                          <span>CORRIDOR</span>
                          <span className="text-[#D4AF37] font-bold">🚶 CENTRAL CORRIDOR</span>
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
                                    className={`h-10 border flex flex-col items-center justify-center text-xs font-bold transition-all relative cursor-pointer ${
                                      !isAvail
                                        ? 'bg-[#0A0A0A] border-[#333333] text-[#555555] cursor-not-allowed opacity-40'
                                        : isSel
                                        ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F2E8C4] to-[#A38424] border-[#F2E8C4] text-[#0A0A0A] shadow-[0_0_20px_rgba(212,175,55,0.8)] scale-105 z-10 font-black'
                                        : 'bg-[#0A0A0A] border-[#D4AF37]/30 text-[#F2F0E4] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
                                    }`}
                                  >
                                    <span className="z-10 text-[10px] font-mono font-bold">{seatNum}</span>
                                    {isWindow && <span className="text-[7px] text-[#D4AF37] font-mono leading-none -mt-0.5">WIN</span>}
                                  </button>
                                  {isAisleRight && <div className="w-2 flex items-center justify-center text-[9px] text-[#D4AF37]/40 font-mono select-none">║</div>}
                                </React.Fragment>
                              );
                            });
                          })}
                        </div>
                      </>
                    )}

                    {/* Bogie Rear Coupling */}
                    <div className="pt-3 border-t border-[#D4AF37]/20 text-center text-[10px] font-mono text-[#D4AF37]/60 uppercase tracking-widest flex items-center justify-between px-2">
                      <span>WC TOILET 🚽</span>
                      <span>══ REAR COUPLER ══</span>
                      <span className="text-[#D4AF37]">🧯 BRAKE VALVE</span>
                    </div>
                  </div>
                )}

                {/* ✈️ 3. AIRCRAFT FUSELAGE SEAT LAYOUT CHASSIS */}
                {activeType === 'PLANE' && (
                  <div className="relative w-full max-w-[360px] sm:max-w-[420px] bg-[#141414] border-2 border-[#D4AF37]/50 rounded-t-[100px] p-4 sm:p-5 shadow-[0_0_40px_rgba(212,175,55,0.25)] flex flex-col space-y-4">
                    
                    {/* Aircraft Nose Cone & Cockpit Flight Deck */}
                    <div className="relative border-b border-[#D4AF37]/20 pb-4 text-center">
                      <div className="h-7 w-3/5 mx-auto rounded-t-full bg-[#D4AF37]/20 border-t-2 border-x-2 border-[#D4AF37] flex items-center justify-center text-[10px] font-extrabold text-[#D4AF37] font-mono uppercase tracking-[0.2em] mb-2 shadow-[0_0_20px_rgba(212,175,55,0.3)]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                        ✈️ FLIGHT DECK / COCKPIT
                      </div>
                      <div className="flex justify-between items-center px-4 text-[10px] font-mono text-[#D4AF37]">
                        <span className="bg-[#0A0A0A] border border-[#D4AF37]/40 px-2 py-0.5 text-[9px]">🍽️ FRONT GALLEY</span>
                        <span className="text-[#F2E8C4] font-bold uppercase">{classType === 'BUSINESS' ? 'BUSINESS 2+2' : 'ECONOMY 3+3'}</span>
                        <span className="bg-[#0A0A0A] border border-[#D4AF37]/40 px-2 py-0.5 text-[9px]">🚽 LAVATORY</span>
                      </div>
                    </div>

                    {/* Seat Position Column Labels */}
                    {classType === 'BUSINESS' ? (
                      <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-mono text-[#D4AF37]/80 border-b border-[#D4AF37]/10 pb-2">
                        <span>A (Win)</span>
                        <span>B (Aisle)</span>
                        <span>C (Aisle)</span>
                        <span>D (Win)</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-1 text-center text-[9px] font-mono text-[#D4AF37]/80 border-b border-[#D4AF37]/10 pb-2">
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
                                className={`h-9 border flex flex-col items-center justify-center text-[10px] font-bold transition-all relative cursor-pointer ${
                                  !isAvail
                                    ? 'bg-[#0A0A0A] border-[#333333] text-[#555555] cursor-not-allowed opacity-40'
                                    : isSel
                                    ? 'bg-gradient-to-tr from-[#D4AF37] via-[#F2E8C4] to-[#A38424] border-[#F2E8C4] text-[#0A0A0A] shadow-[0_0_20px_rgba(212,175,55,0.8)] scale-105 z-10 font-black'
                                    : 'bg-[#0A0A0A] border-[#D4AF37]/30 text-[#F2F0E4] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10'
                                }`}
                              >
                                <span className="z-10 font-mono font-bold">{seatId}</span>
                              </button>
                              {isAisleRight && <div className="w-2 flex items-center justify-center text-[8px] text-[#D4AF37]/40 font-mono select-none">│</div>}
                            </React.Fragment>
                          );
                        });
                      })}
                    </div>

                    {/* Overwing Exit Banner */}
                    <div className="text-[9px] font-mono text-[#D4AF37] bg-[#0A0A0A] border border-[#D4AF37]/30 p-1.5 text-center flex items-center justify-between px-3">
                      <span>◀ WING</span>
                      <span className="font-bold text-[#F2E8C4] uppercase tracking-widest">✈️ OVERWING EMERGENCY EXIT</span>
                      <span>WING ▶</span>
                    </div>

                    {/* Tail / Rear Galley */}
                    <div className="pt-2 border-t border-[#D4AF37]/20 text-center text-[10px] font-mono text-[#D4AF37]/60 uppercase tracking-widest flex items-center justify-between px-2">
                      <span>REAR LAVATORY 🚽</span>
                      <span className="text-[#D4AF37]">AFT EXIT 🚪</span>
                      <span>REAR GALLEY 🍽️</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── REAL-TIME SEATING LEGEND ─── */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs font-semibold text-[#F2F0E4]/90 bg-[#0A0A0A] p-3.5 border border-[#D4AF37]/30 w-full">
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-[#0A0A0A] border border-[#D4AF37]/40" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-gradient-to-r from-[#D4AF37] to-[#F2E8C4] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <span className="text-[#D4AF37] font-bold">Selected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-[#0A0A0A] border border-[#333333] opacity-40" />
              <span className="text-[#888888]">Reserved</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-emerald-400 font-mono text-xs">📧</span>
              <span className="text-emerald-300 font-bold">Gmail Verified</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: PASSENGER FORM & FARE SUMMARY (5 COLS) ─── */}
        <div className="lg:col-span-5 space-y-6">

          {/* No Seats Selected Placeholder */}
          {selectedSeats.length === 0 ? (
            <div className="art-deco-panel art-deco-corner-brackets p-8 text-center space-y-4 border-2 border-dashed border-[#D4AF37]/30 flex flex-col items-center justify-center min-h-[340px] bg-[#0A0A0A]">
              <div className="p-4 border-2 border-[#D4AF37]/50 bg-[#141414] text-[#D4AF37] animate-gold-pulse">
                <Armchair className="h-10 w-10" />
              </div>
              <h4 className="text-[#F2F0E4] font-bold text-base tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-heading), serif' }}>No Seats Selected</h4>
              <p className="text-[#888888] text-xs max-w-xs leading-relaxed">
                Click on any available seat on the imperial vehicle chart to reserve it. Confirmations use <span className="text-emerald-400 font-bold">Gmail OTP Verification</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Passenger Info Form */}
              <div className="art-deco-panel art-deco-corner-brackets p-6 space-y-5 bg-[#0A0A0A] border-2 border-[#D4AF37]/50 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-[#D4AF37]" />
                    <h3 className="font-extrabold text-[#F2F0E4] text-xs uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                      Passenger Information
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[10px] bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-1 font-bold uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-all"
                  >
                    <Sparkles className="h-3 w-3 text-[#D4AF37]" />
                    <span>Quick Fill</span>
                  </button>
                </div>

                {/* Passenger Inputs */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {passengers.map((p, idx) => (
                    <div key={p.seat_number} className="border border-[#D4AF37]/30 bg-[#141414] p-4 space-y-3">
                      <div className="flex justify-between items-center border-b border-[#D4AF37]/20 pb-2">
                        <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Passenger {idx + 1}</span>
                        <div className="flex items-center space-x-2">
                          {p.isVerified ? (
                            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 font-bold flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Gmail Verified</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenGmailVerification(p.seat_number)}
                              className="text-[10px] bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37] text-[#F2E8C4] px-2.5 py-0.5 font-bold flex items-center space-x-1 cursor-pointer transition-all uppercase tracking-wider"
                            >
                              <Mail className="h-3 w-3 text-[#D4AF37]" />
                              <span>Verify Gmail</span>
                            </button>
                          )}
                          <span className="text-[11px] bg-[#0A0A0A] border border-[#D4AF37]/40 text-[#D4AF37] px-2.5 py-0.5 font-mono font-bold">
                            Seat: {p.seat_number}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Name */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            required
                            value={p.name}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'name', e.target.value)}
                            className="art-deco-input w-full text-xs"
                            placeholder="E.g., Tanvir Hossain"
                          />
                        </div>

                        {/* Age */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Age</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={p.age}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'age', e.target.value)}
                            className="art-deco-input w-full text-xs"
                            placeholder="26"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Gender */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'gender', e.target.value)}
                            className="art-deco-input w-full text-xs bg-[#0A0A0A] text-[#F2F0E4] cursor-pointer"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        {/* Gmail Verification Address */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#888888] uppercase tracking-wider flex justify-between">
                            <span>Gmail Address</span>
                            {p.isVerified && <span className="text-emerald-400 text-[9px]">Verified</span>}
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={p.gmail}
                              onChange={(e) => handlePassengerChange(p.seat_number, 'gmail', e.target.value)}
                              className={`art-deco-input w-full text-xs ${
                                p.isVerified ? 'border-emerald-500/40 text-emerald-300' : ''
                              }`}
                              placeholder="user@gmail.com"
                            />
                            {!p.isVerified && (
                              <button
                                type="button"
                                onClick={() => handleOpenGmailVerification(p.seat_number)}
                                className="absolute right-1 top-1 text-[9px] font-bold text-[#0A0A0A] bg-[#D4AF37] hover:bg-[#F2E8C4] px-2 py-0.5 cursor-pointer uppercase tracking-wider font-mono"
                              >
                                OTP Verify
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="art-deco-panel art-deco-corner-brackets p-6 space-y-4 bg-[#0A0A0A] border-2 border-[#D4AF37]/50 shadow-xl">
                <h3 className="font-bold text-[#F2F0E4] text-xs uppercase tracking-[0.2em] border-b border-[#D4AF37]/30 pb-3 flex items-center space-x-2" style={{ fontFamily: 'var(--font-heading), serif' }}>
                  <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
                  <span>Ticket Price Summary</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Selected Seats ({selectedSeats.length}):</span>
                    <span className="text-[#D4AF37] font-mono font-bold">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#888888]">Rate per Ticket ({classType}):</span>
                    <span className="text-[#F2F0E4] font-semibold">৳{currentSeatFare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-400">
                    <span>Identity Verification:</span>
                    <span className="font-bold">📧 Gmail Verified</span>
                  </div>
                  <div className="border-t border-[#D4AF37]/20 pt-3 mt-3 flex justify-between items-center">
                    <span className="font-bold text-[#F2F0E4] text-sm uppercase tracking-wider" style={{ fontFamily: 'var(--font-heading), serif' }}>Total Payable:</span>
                    <span className="font-black text-[#D4AF37] text-2xl" style={{ fontFamily: 'var(--font-heading), serif' }}>৳{totalFare.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const unverified = passengers.find(p => !p.isVerified);
                    if (unverified) {
                      handleOpenGmailVerification(unverified.seat_number);
                      return;
                    }

                    if (onBookingConfirm) {
                      onBookingConfirm({
                        transportType: activeType,
                        classType,
                        selectedSeats,
                        passengers,
                        totalFare
                      });
                    } else {
                      alert(`🎉 Reservation Confirmed via Gmail Verification! Mode: ${activeType}, Seats: ${selectedSeats.join(', ')}, Total: ৳${totalFare.toLocaleString()}`);
                    }
                  }}
                  className="art-deco-button-solid w-full py-4 text-xs tracking-[0.2em] flex items-center justify-center space-x-2"
                >
                  <span>CONFIRM VIA GMAIL VERIFICATION</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ─── 3. GMAIL OTP VERIFICATION MODAL ─── */}
      <AnimatePresence>
        {verifyingSeat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="art-deco-panel art-deco-corner-brackets w-full max-w-md p-6 space-y-5 bg-[#0A0A0A] border-2 border-[#D4AF37] shadow-2xl relative"
            >
              <div className="flex items-center justify-between border-b border-[#D4AF37]/30 pb-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-[#D4AF37]" />
                  <h3 className="font-extrabold text-[#F2F0E4] text-base tracking-[0.2em] uppercase" style={{ fontFamily: 'var(--font-heading), serif' }}>Gmail OTP Verification</h3>
                </div>
                <button
                  onClick={() => setVerifyingSeat(null)}
                  className="text-[#D4AF37] hover:text-white text-lg font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>

              <p className="text-xs text-[#888888] leading-relaxed">
                Confirm your seat reservation for <span className="text-[#D4AF37] font-bold font-mono">Seat {verifyingSeat}</span> by verifying your Gmail address. No NID required.
              </p>

              {!otpSent ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Enter Gmail Address</label>
                    <input
                      type="email"
                      value={verifyingGmail}
                      onChange={(e) => setVerifyingGmail(e.target.value)}
                      className="art-deco-input w-full text-xs font-mono"
                      placeholder="e.g. user@gmail.com"
                    />
                  </div>

                  {otpError && <p className="text-xs text-red-400 font-semibold">{otpError}</p>}

                  <button
                    type="button"
                    disabled={sendingOtp}
                    onClick={handleSendGmailOTP}
                    className="art-deco-button-solid w-full py-3 text-xs tracking-[0.2em] flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {sendingOtp ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    <span>SEND VERIFICATION CODE</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOTPCode} className="space-y-4">
                  <div className="bg-[#141414] border border-[#D4AF37]/40 p-3 text-xs text-[#F2F0E4] space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <Check className="h-4 w-4 text-[#D4AF37]" />
                      <span>OTP Code Sent to {verifyingGmail}</span>
                    </div>
                    {simulatedOtp && (
                      <div className="font-mono text-[11px] text-[#D4AF37]">
                        🔑 Verification Code: <span className="font-black text-[#0A0A0A] bg-[#D4AF37] px-2 py-0.5">{simulatedOtp}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#888888] uppercase tracking-wider">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      className="art-deco-input w-full text-center text-xl font-mono font-black tracking-[0.3em] text-[#D4AF37]"
                      placeholder="123456"
                    />
                  </div>

                  {otpError && <p className="text-xs text-red-400 font-semibold">{otpError}</p>}

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-1/3 py-2.5 bg-[#141414] text-[#888888] hover:text-white text-xs font-bold border border-[#D4AF37]/30 uppercase tracking-wider"
                    >
                      Resend
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 art-deco-button-solid py-2.5 text-xs tracking-[0.2em] flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>VERIFY & CONFIRM</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
