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
    const demoNames = ['Rafiqul Islam', 'Nusrat Jahan', 'Tanvir Ahmed', 'Farhana Chowdhury', 'Kazi Mahbub'];
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
      
      {/* ─── 1. NEUMORPHIC MODE SWITCHER TABS ─── */}
      {allowModeSwitching && (
        <div className="bg-[#E0E5EC] rounded-[32px] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6C63FF] px-3.5 py-1.5 rounded-2xl bg-[#E0E5EC] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] hidden md:inline-block">
              MODE SELECTOR
            </span>

            <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
              {/* BUS TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('BUS')}
                className={`relative px-4 py-2.5 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeType === 'BUS'
                    ? 'bg-[#6C63FF] text-white shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)]'
                    : 'bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)]'
                }`}
              >
                <Bus className="h-4 w-4" />
                <span>Bus Coach</span>
              </button>

              {/* TRAIN TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('TRAIN')}
                className={`relative px-4 py-2.5 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeType === 'TRAIN'
                    ? 'bg-[#6C63FF] text-white shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)]'
                    : 'bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)]'
                }`}
              >
                <Train className="h-4 w-4" />
                <span>Railway</span>
              </button>

              {/* PLANE TAB */}
              <button
                type="button"
                onClick={() => handleTypeSwitch('PLANE')}
                className={`relative px-4 py-2.5 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                  activeType === 'PLANE'
                    ? 'bg-[#6C63FF] text-white shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)]'
                    : 'bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)]'
                }`}
              >
                <Plane className="h-4 w-4" />
                <span>Flight</span>
              </button>
            </div>
          </div>

          {/* Class Selector per Transport */}
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#3D4852] font-bold">Class:</span>
            {activeType === 'BUS' && (
              <div className="flex bg-[#E0E5EC] p-1.5 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] text-xs">
                <button
                  type="button"
                  onClick={() => handleClassSwitch('ECONOMY')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${classType === 'ECONOMY' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#3D4852]'}`}
                >
                  2+2 Luxury
                </button>
                <button
                  type="button"
                  onClick={() => handleClassSwitch('BUSINESS')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${classType === 'BUSINESS' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#3D4852]'}`}
                >
                  2+1 VIP Sleeper
                </button>
              </div>
            )}

            {activeType === 'TRAIN' && (
              <select
                value={classType}
                onChange={(e) => handleClassSwitch(e.target.value)}
                className="bg-[#E0E5EC] text-[#3D4852] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] px-4 py-2 text-xs font-bold rounded-2xl focus:outline-none cursor-pointer border-none"
              >
                <option value="ECONOMY">Shovon Chair (2+2)</option>
                <option value="SNIGDHA">Snigdha AC Chair (2+2)</option>
                <option value="BUSINESS">AC Seat (Deluxe)</option>
                <option value="AC_BERTH">AC Berth / Cabin Coupe</option>
              </select>
            )}

            {activeType === 'PLANE' && (
              <div className="flex bg-[#E0E5EC] p-1.5 rounded-2xl shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] text-xs">
                <button
                  type="button"
                  onClick={() => handleClassSwitch('ECONOMY')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${classType === 'ECONOMY' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#3D4852]'}`}
                >
                  Economy (3+3)
                </button>
                <button
                  type="button"
                  onClick={() => handleClassSwitch('BUSINESS')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${classType === 'BUSINESS' ? 'bg-[#6C63FF] text-white shadow-sm' : 'text-[#3D4852]'}`}
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
            className="border-4 border-[#121212] bg-[#F0C020] p-3.5 text-xs font-black text-[#121212] flex items-center justify-between shadow-[4px_4px_0px_0px_#121212]"
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-4 w-4 shrink-0 text-[#121212]" />
              <span className="uppercase tracking-wider">{alertMessage}</span>
            </div>
            <button onClick={() => setAlertMessage(null)} className="text-[#121212] hover:text-white text-base font-black cursor-pointer">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. MAIN RESPONSIVE TWO-COLUMN LAYOUT ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ─── LEFT COLUMN: NEUMORPHIC VEHICLE CHASSIS (7 COLS) ─── */}
        <div className="lg:col-span-7 bg-[#E0E5EC] rounded-[32px] shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] p-5 sm:p-8 flex flex-col items-center relative overflow-hidden border-none">
          
          {/* Header Title Banner */}
          <div className="w-full pb-4 mb-4 border-b border-[#C4CBD6]/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-[#E0E5EC] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] text-[#6C63FF] flex items-center justify-center">
                {activeType === 'BUS' && <Bus className="h-5 w-5" />}
                {activeType === 'TRAIN' && <Train className="h-5 w-5" />}
                {activeType === 'PLANE' && <Plane className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="font-extrabold text-[#3D4852] text-base tracking-tight uppercase flex items-center space-x-2 font-display">
                  <span>
                    {activeType === 'BUS' ? 'Recliner Coach Chassis' : activeType === 'TRAIN' ? 'Bangladesh Railway Bogie' : 'Aircraft Fuselage Cabin'}
                  </span>
                  <span className="text-[10px] bg-[#6C63FF] text-white font-mono px-2 py-0.5 rounded-lg uppercase font-bold">
                    {classType}
                  </span>
                </h3>
                <p className="text-[11px] text-[#6B7280] font-medium tracking-wider">
                  {activeType === 'BUS' 
                    ? (classType === 'BUSINESS' ? 'VIP 2+1 Recliner • RHD Driver Cockpit' : 'Standard 2+2 Luxury Coach • Front Entrance')
                    : activeType === 'TRAIN'
                    ? (classType === 'AC_BERTH' ? 'Coupe Compartments • Upper & Lower Berths' : 'Bangladesh Railway Standard Alignment')
                    : (classType === 'BUSINESS' ? 'Dual-Aisle Business Cabin • Flight Deck' : 'Commercial Flight 3+3 Cabin • Overwing Exit')}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#6B7280] uppercase tracking-widest font-bold block">Fare / Seat</span>
              <span className="text-2xl font-extrabold text-[#6C63FF]">৳{currentSeatFare.toLocaleString()}</span>
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
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="w-full flex justify-center"
              >
                {/* 🚌 1. BUS SEAT LAYOUT CHASSIS */}
                {activeType === 'BUS' && (
                  <div className="relative w-full max-w-[340px] sm:max-w-[380px] bg-[#E0E5EC] rounded-[28px] shadow-[inset_8px_8px_16px_rgba(163,177,198,0.7),inset_-8px_-8px_16px_rgba(255,255,255,0.6)] p-5 flex flex-col space-y-4">
                    
                    {/* Windshield & Driver Cockpit */}
                    <div className="relative border-b border-[#C4CBD6]/50 pb-4">
                      <div className="h-8 w-4/5 mx-auto rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] text-[#6C63FF] text-[10px] font-bold flex items-center justify-center tracking-widest uppercase">
                        🚌 BUS WINDSHIELD & COCKPIT
                      </div>

                      <div className="flex items-center justify-between px-2 text-xs font-bold text-[#3D4852] mt-3">
                        <div className="flex items-center space-x-1.5 bg-[#E0E5EC] px-3 py-1 rounded-xl shadow-[inset_2px_2px_4px_rgba(163,177,198,0.6),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]">
                          <span className="h-2 w-2 rounded-full bg-[#38B2AC] animate-pulse" />
                          <span className="text-[10px] text-[#3D4852] font-bold uppercase">Door</span>
                        </div>

                        <div className="flex items-center space-x-2 bg-[#E0E5EC] px-3 py-1 rounded-xl shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]">
                          <span className="text-[10px] text-[#3D4852] font-bold uppercase">Driver Cockpit</span>
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-[#6C63FF] animate-spin" style={{ animationDuration: '20s' }} />
                        </div>
                      </div>
                    </div>

                    {/* Column Indicators */}
                    <div className="flex justify-between text-[10px] font-bold text-[#6B7280] px-2 border-b border-[#C4CBD6]/50 pb-2">
                      <span>🪟 WIN</span>
                      {classType === 'BUSINESS' ? (
                        <>
                          <span>🚶 AISLE</span>
                          <span>🪟 WIN</span>
                        </>
                      ) : (
                        <>
                          <span>🚶 AISLE</span>
                          <span className="text-[#6C63FF] font-bold">◄ CENTRAL AISLE ►</span>
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
                                disabled={!isAvail}
                                className={`h-11 rounded-2xl transition-all relative cursor-pointer flex flex-col items-center justify-center font-bold ${
                                  !isAvail 
                                    ? 'bg-[#E0E5EC] text-[#6B7280] shadow-[inset_4px_4px_8px_rgba(163,177,198,0.7),inset_-4px_-4px_8px_rgba(255,255,255,0.6)] cursor-not-allowed opacity-60'
                                    : isSel
                                    ? 'bg-[#6C63FF] text-white shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)] scale-105 z-10 font-extrabold'
                                    : 'bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5'
                                }`}
                              >
                                <Armchair className={`h-3.5 w-3.5 absolute opacity-20 ${isSel ? 'text-white' : 'text-[#6C63FF]'}`} />
                                <span className="z-10 text-[11px] font-mono font-bold">{seatId}</span>
                                {isWindow && <span className={`text-[7px] font-mono leading-none -mt-0.5 ${isSel ? 'text-white/80' : 'text-[#38B2AC]'}`}>WIN</span>}
                              </button>
                              {isAisleRight && <div className="w-3 flex items-center justify-center text-[9px] text-[#6B7280] font-bold select-none">│</div>}
                            </React.Fragment>
                          );
                        });
                      })}
                    </div>

                    {/* Rear Engine & Emergency Exit */}
                    <div className="mt-4 pt-3 border-t-2 border-[#121212] text-center text-[10px] font-black text-[#121212] uppercase tracking-widest flex items-center justify-between px-2">
                      <span>⚙️ REAR ENGINE BAY</span>
                      <span className="text-[#D02020] font-black">🚨 EMERGENCY EXIT</span>
                    </div>
                  </div>
                )}

                {/* 🚆 2. TRAIN SEAT LAYOUT CHASSIS (BANGLADESH RAILWAY) */}
                {activeType === 'TRAIN' && (
                  <div className="relative w-full max-w-[360px] sm:max-w-[420px] bg-[#F0F0F0] border-4 border-[#121212] p-4 sm:p-5 shadow-[6px_6px_0px_0px_#121212] flex flex-col space-y-4">
                    
                    {/* Bogie Front Coupler & Amenities */}
                    <div className="border-b-4 border-[#121212] pb-3 flex items-center justify-between text-[10px] font-black text-[#121212]">
                      <div className="flex items-center space-x-1 bg-white border-2 border-[#121212] px-2.5 py-1 shadow-[2px_2px_0px_0px_#121212]">
                        <span>WC TOILET 🚽</span>
                      </div>
                      <div className="text-center">
                        <span className="block font-black text-[#1040C0] uppercase tracking-widest">══ BOGIE COUPLER ══</span>
                        <span className="text-[9px] text-[#666666] font-sans font-bold">BANGLADESH RAILWAY (BR)</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#F0C020] border-2 border-[#121212] px-2.5 py-1 shadow-[2px_2px_0px_0px_#121212]">
                        <span>⚡ 220V POWER</span>
                      </div>
                    </div>

                    {/* AC BERTH COUPE CABIN LAYOUT vs CHAIR CAR */}
                    {classType === 'AC_BERTH' ? (
                      <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                        <div className="text-center text-[10px] font-black text-white bg-[#1040C0] p-1.5 border-2 border-[#121212] uppercase tracking-wider">
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
                            <div key={cabinNum} className="border-3 border-[#121212] bg-white p-3 space-y-2 shadow-[3px_3px_0px_0px_#121212]">
                              <div className="flex justify-between items-center text-[10px] font-black text-[#121212] border-b-2 border-[#121212] pb-1">
                                <span>🚪 COMPARTMENT COUPE C-{cabinNum}</span>
                                <span className="text-[#1040C0]">SLIDING DOOR 🔒</span>
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
                                      className={`h-11 border-2 border-[#121212] flex items-center justify-between px-3 text-xs font-black transition-all cursor-pointer ${
                                        !isAvail
                                          ? 'bg-slate-300 border-[#121212] text-slate-500 cursor-not-allowed opacity-50'
                                          : isSel
                                          ? 'bg-[#F0C020] text-[#121212] shadow-[3px_3px_0px_0px_#121212]'
                                          : 'bg-white text-[#121212] hover:bg-[#F0C020] shadow-[2px_2px_0px_0px_#121212]'
                                      }`}
                                    >
                                      <span className="font-mono text-[11px]">{b.id}</span>
                                      <span className={`text-[9px] px-1.5 py-0.5 border-2 border-[#121212] font-mono ${b.type === 'LB' ? 'bg-[#D02020] text-white' : 'bg-[#1040C0] text-white'}`}>
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
                        <div className="flex justify-between text-[10px] font-black text-[#121212] border-b-2 border-[#121212] pb-2">
                          <span>🪟 WINDOW</span>
                          <span>CORRIDOR</span>
                          <span className="text-[#1040C0] font-black">🚶 CENTRAL CORRIDOR</span>
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
                                    className={`h-10 border-2 border-[#121212] flex flex-col items-center justify-center text-xs font-black transition-all relative cursor-pointer ${
                                      !isAvail
                                        ? 'bg-slate-300 border-[#121212] text-slate-500 cursor-not-allowed opacity-50'
                                        : isSel
                                        ? 'bg-[#F0C020] text-[#121212] shadow-[3px_3px_0px_0px_#121212] scale-105 z-10'
                                        : 'bg-white text-[#121212] hover:bg-[#F0C020] shadow-[2px_2px_0px_0px_#121212]'
                                    }`}
                                  >
                                    <span className="z-10 text-[10px] font-mono font-bold">{seatNum}</span>
                                    {isWindow && <span className="text-[7px] text-[#1040C0] font-mono leading-none -mt-0.5">WIN</span>}
                                  </button>
                                  {isAisleRight && <div className="w-2 flex items-center justify-center text-[9px] text-[#121212] font-black select-none">║</div>}
                                </React.Fragment>
                              );
                            });
                          })}
                        </div>
                      </>
                    )}

                    {/* Bogie Rear Coupling */}
                    <div className="pt-3 border-t-2 border-[#121212] text-center text-[10px] font-black text-[#121212] uppercase tracking-widest flex items-center justify-between px-2">
                      <span>WC TOILET 🚽</span>
                      <span>══ REAR COUPLER ══</span>
                      <span className="text-[#D02020]">🧯 BRAKE VALVE</span>
                    </div>
                  </div>
                )}

                {/* ✈️ 3. AIRCRAFT FUSELAGE SEAT LAYOUT CHASSIS */}
                {activeType === 'PLANE' && (
                  <div className="relative w-full max-w-[360px] sm:max-w-[420px] bg-[#F0F0F0] border-4 border-[#121212] p-4 sm:p-5 shadow-[6px_6px_0px_0px_#121212] flex flex-col space-y-4">
                    
                    {/* Aircraft Nose Cone & Cockpit Flight Deck */}
                    <div className="relative border-b-4 border-[#121212] pb-4 text-center">
                      <div className="h-7 w-3/5 mx-auto border-3 border-[#121212] bg-[#1040C0] text-white flex items-center justify-center text-[10px] font-black font-mono uppercase tracking-widest mb-2 shadow-[2px_2px_0px_0px_#121212]">
                        ✈️ FLIGHT DECK / COCKPIT
                      </div>
                      <div className="flex justify-between items-center px-4 text-[10px] font-black text-[#121212]">
                        <span className="bg-white border-2 border-[#121212] px-2 py-0.5 text-[9px]">🍽️ FRONT GALLEY</span>
                        <span className="text-[#1040C0] font-black uppercase">{classType === 'BUSINESS' ? 'BUSINESS 2+2' : 'ECONOMY 3+3'}</span>
                        <span className="bg-white border-2 border-[#121212] px-2 py-0.5 text-[9px]">🚽 LAVATORY</span>
                      </div>
                    </div>

                    {/* Seat Position Column Labels */}
                    {classType === 'BUSINESS' ? (
                      <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-black text-[#121212] border-b-2 border-[#121212] pb-2">
                        <span>A (Win)</span>
                        <span>B (Aisle)</span>
                        <span>C (Aisle)</span>
                        <span>D (Win)</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-6 gap-1 text-center text-[9px] font-black text-[#121212] border-b-2 border-[#121212] pb-2">
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
                                className={`h-9 border-2 border-[#121212] flex flex-col items-center justify-center text-[10px] font-black transition-all relative cursor-pointer ${
                                  !isAvail
                                    ? 'bg-slate-300 border-[#121212] text-slate-500 cursor-not-allowed opacity-50'
                                    : isSel
                                    ? 'bg-[#F0C020] text-[#121212] shadow-[3px_3px_0px_0px_#121212] scale-105 z-10'
                                    : 'bg-white text-[#121212] hover:bg-[#F0C020] shadow-[2px_2px_0px_0px_#121212]'
                                }`}
                              >
                                <span className="z-10 font-mono font-bold">{seatId}</span>
                              </button>
                              {isAisleRight && <div className="w-2 flex items-center justify-center text-[8px] text-[#121212] font-black select-none">│</div>}
                            </React.Fragment>
                          );
                        });
                      })}
                    </div>

                    {/* Overwing Exit Banner */}
                    <div className="text-[9px] font-mono text-[#121212] bg-[#F0C020] border-2 border-[#121212] p-1.5 text-center flex items-center justify-between px-3 font-black">
                      <span>◀ WING</span>
                      <span className="uppercase tracking-widest">✈️ OVERWING EMERGENCY EXIT</span>
                      <span>WING ▶</span>
                    </div>

                    {/* Tail / Rear Galley */}
                    <div className="pt-2 border-t-2 border-[#121212] text-center text-[10px] font-black text-[#121212] uppercase tracking-widest flex items-center justify-between px-2">
                      <span>REAR LAVATORY 🚽</span>
                      <span className="text-[#D02020]">AFT EXIT 🚪</span>
                      <span>REAR GALLEY 🍽️</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ─── REAL-TIME SEATING LEGEND ─── */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs font-black text-[#121212] bg-[#F0F0F0] p-3.5 border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] w-full">
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-white border-2 border-[#121212]" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-[#F0C020] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]" />
              <span className="text-[#121212] font-black">Selected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3.5 w-3.5 bg-slate-300 border-2 border-[#121212] opacity-50" />
              <span className="text-slate-600">Reserved</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[#D02020] font-mono text-xs">📧</span>
              <span className="text-[#D02020] font-black">Gmail Verified</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: PASSENGER FORM & FARE SUMMARY (5 COLS) ─── */}
        <div className="lg:col-span-5 space-y-6">

          {/* No Seats Selected Placeholder */}
          {selectedSeats.length === 0 ? (
            <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-8 text-center space-y-4 border-dashed flex flex-col items-center justify-center min-h-[340px]">
              <div className="p-4 border-3 border-[#121212] bg-[#F0C020] text-[#121212] shadow-[4px_4px_0px_0px_#121212]">
                <Armchair className="h-10 w-10" />
              </div>
              <h4 className="text-[#121212] font-black text-base tracking-wider uppercase">No Seats Selected</h4>
              <p className="text-[#666666] text-xs font-bold max-w-xs leading-relaxed">
                Click on any available seat on the geometric vehicle chart to reserve it. Confirmations use <span className="text-[#D02020] font-black">Gmail OTP Verification</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* Passenger Info Form */}
              <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 space-y-5">
                <div className="flex items-center justify-between border-b-4 border-[#121212] pb-3">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-[#1040C0]" />
                    <h3 className="font-black text-[#121212] text-xs uppercase tracking-wider">
                      Passenger Information
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-[10px] bg-[#F0C020] hover:bg-[#D8A818] border-2 border-[#121212] text-[#121212] px-2.5 py-1 font-black uppercase tracking-wider flex items-center space-x-1 cursor-pointer transition-all shadow-[2px_2px_0px_0px_#121212]"
                  >
                    <Sparkles className="h-3 w-3 text-[#121212]" />
                    <span>Quick Fill</span>
                  </button>
                </div>

                {/* Passenger Inputs */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {passengers.map((p, idx) => (
                    <div key={p.seat_number} className="border-3 border-[#121212] bg-[#F0F0F0] p-4 space-y-3 shadow-[3px_3px_0px_0px_#121212]">
                      <div className="flex justify-between items-center border-b-2 border-[#121212] pb-2">
                        <span className="text-xs font-black text-[#121212] uppercase tracking-wider">Passenger {idx + 1}</span>
                        <div className="flex items-center space-x-2">
                          {p.isVerified ? (
                            <span className="text-[10px] bg-[#D02020] text-white border-2 border-[#121212] px-2.5 py-0.5 font-black flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Gmail Verified</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenGmailVerification(p.seat_number)}
                              className="text-[10px] bg-[#1040C0] text-white border-2 border-[#121212] px-2.5 py-0.5 font-black flex items-center space-x-1 cursor-pointer transition-all uppercase tracking-wider shadow-[2px_2px_0px_0px_#121212]"
                            >
                              <Mail className="h-3 w-3" />
                              <span>Verify Gmail</span>
                            </button>
                          )}
                          <span className="text-[11px] bg-[#F0C020] border-2 border-[#121212] text-[#121212] px-2.5 py-0.5 font-mono font-black">
                            Seat: {p.seat_number}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Name */}
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-[#121212] uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            required
                            value={p.name}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'name', e.target.value)}
                            className="bauhaus-input w-full text-xs"
                            placeholder="E.g., Tanvir Hossain"
                          />
                        </div>

                        {/* Age */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#121212] uppercase tracking-wider">Age</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={p.age}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'age', e.target.value)}
                            className="bauhaus-input w-full text-xs"
                            placeholder="26"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Gender */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#121212] uppercase tracking-wider">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'gender', e.target.value)}
                            className="bauhaus-input w-full text-xs bg-white text-[#121212] cursor-pointer"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        {/* Gmail Verification Address */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-[#121212] uppercase tracking-wider flex justify-between">
                            <span>Gmail Address</span>
                            {p.isVerified && <span className="text-[#D02020] text-[9px] font-black">Verified</span>}
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={p.gmail}
                              onChange={(e) => handlePassengerChange(p.seat_number, 'gmail', e.target.value)}
                              className="bauhaus-input w-full text-xs"
                              placeholder="user@gmail.com"
                            />
                            {!p.isVerified && (
                              <button
                                type="button"
                                onClick={() => handleOpenGmailVerification(p.seat_number)}
                                className="absolute right-1.5 top-1.5 text-[9px] font-black text-white bg-[#1040C0] hover:bg-[#0D3399] border-2 border-[#121212] px-2 py-0.5 cursor-pointer uppercase tracking-wider shadow-[2px_2px_0px_0px_#121212]"
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
              <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 space-y-4">
                <h3 className="font-black text-[#121212] text-xs uppercase tracking-wider border-b-4 border-[#121212] pb-3 flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4 text-[#D02020]" />
                  <span>Ticket Price Summary</span>
                </h3>

                <div className="space-y-2 text-xs font-bold">
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Selected Seats ({selectedSeats.length}):</span>
                    <span className="text-[#1040C0] font-mono font-black">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#666666]">Rate per Ticket ({classType}):</span>
                    <span className="text-[#121212] font-black">৳{currentSeatFare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#D02020]">
                    <span>Identity Verification:</span>
                    <span className="font-black">📧 Gmail Verified</span>
                  </div>
                  <div className="border-t-4 border-[#121212] pt-3 mt-3 flex justify-between items-center">
                    <span className="font-black text-[#121212] text-sm uppercase tracking-wider">Total Payable:</span>
                    <span className="font-black text-[#D02020] text-2xl">৳{totalFare.toLocaleString()}</span>
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
                  className="bauhaus-button-red w-full py-4 text-xs tracking-wider flex items-center justify-center space-x-2 shadow-[4px_4px_0px_0px_#121212]"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#121212] shadow-[12px_12px_0px_0px_#121212] w-full max-w-md p-6 space-y-5 relative"
            >
              <div className="flex items-center justify-between border-b-4 border-[#121212] pb-3">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-[#D02020]" />
                  <h3 className="font-black text-[#121212] text-base uppercase tracking-wider">Gmail OTP Verification</h3>
                </div>
                <button
                  onClick={() => setVerifyingSeat(null)}
                  className="text-[#121212] hover:text-[#D02020] text-lg font-black cursor-pointer"
                >
                  ×
                </button>
              </div>

              <p className="text-xs text-[#666666] font-bold leading-relaxed">
                Confirm your seat reservation for <span className="text-[#1040C0] font-black font-mono">Seat {verifyingSeat}</span> by verifying your Gmail address. No NID required.
              </p>

              {!otpSent ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#121212] uppercase tracking-wider">Enter Gmail Address</label>
                    <input
                      type="email"
                      value={verifyingGmail}
                      onChange={(e) => setVerifyingGmail(e.target.value)}
                      className="bauhaus-input w-full text-xs font-mono"
                      placeholder="e.g. user@gmail.com"
                    />
                  </div>

                  {otpError && <p className="text-xs text-[#D02020] font-black">{otpError}</p>}

                  <button
                    type="button"
                    disabled={sendingOtp}
                    onClick={handleSendGmailOTP}
                    className="bauhaus-button-blue w-full py-3 text-xs tracking-wider flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {sendingOtp ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    <span>SEND VERIFICATION CODE</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifyOTPCode} className="space-y-4">
                  <div className="bg-[#FFFDF0] border-3 border-[#121212] p-3 text-xs text-[#121212] space-y-1 shadow-[3px_3px_0px_0px_#121212]">
                    <div className="flex items-center space-x-1.5 font-black">
                      <Check className="h-4 w-4 text-[#D02020]" />
                      <span>OTP Code Sent to {verifyingGmail}</span>
                    </div>
                    {simulatedOtp && (
                      <div className="font-mono text-[11px] text-[#1040C0] font-black">
                        🔑 Verification Code: <span className="font-black text-white bg-[#121212] px-2 py-0.5">{simulatedOtp}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-[#121212] uppercase tracking-wider">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={inputOtp}
                      onChange={(e) => setInputOtp(e.target.value)}
                      className="bauhaus-input w-full text-center text-xl font-mono font-black tracking-widest text-[#D02020]"
                      placeholder="123456"
                    />
                  </div>

                  {otpError && <p className="text-xs text-[#D02020] font-black">{otpError}</p>}

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-1/3 py-2.5 bg-white text-[#121212] text-xs font-black border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] uppercase tracking-wider"
                    >
                      Resend
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 bauhaus-button-yellow py-2.5 text-xs tracking-wider flex items-center justify-center space-x-1 cursor-pointer"
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
