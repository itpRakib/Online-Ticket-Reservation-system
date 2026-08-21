'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, ALL_BANGLADESH_STATIONS } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ScrollReveal';
import { NumberTicker } from '@/components/NumberTicker';
import { 
  Bus, Train, Plane, Search, ArrowLeftRight, CheckCircle2, 
  ShieldCheck, CreditCard, Sparkles, Flame, Percent, MapPin, 
  Calendar, Clock, UserCheck, HelpCircle, ChevronDown, Check, ArrowRight, X, AlertCircle, SlidersHorizontal, Terminal, Activity
} from 'lucide-react';
import { FuturisticHUD } from '@/components/FuturisticHUD';
import { RetroGrid } from '@/components/RetroGrid';

export default function Home() {
  const router = useRouter();
  const { user, logout, language } = useAuth();
  const t = (en: string, bn: string) => (language === 'bn' ? bn : en);
  
  // Data State initialized with full Bangladesh stations database
  const [stations, setStations] = useState<any[]>(ALL_BANGLADESH_STATIONS);
  const [loading, setLoading] = useState(false);

  // Dynamic Date Constraint (Never allow past dates)
  const [todayStr, setTodayStr] = useState('');

  const getFutureDateString = (days: number) => {
    if (!todayStr) return '';
    const dateObj = new Date(todayStr);
    dateObj.setDate(dateObj.getDate() + days);
    return dateObj.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    if (transportType === 'BUS') return getFutureDateString(20);
    if (transportType === 'TRAIN') return getFutureDateString(10);
    if (transportType === 'PLANE') return getFutureDateString(60);
    return getFutureDateString(60);
  };

  // Search Form State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [transportType, setTransportType] = useState('ALL'); // ALL, BUS, TRAIN, PLANE
  const [priority, setPriority] = useState('balanced');
  const [tripType, setTripType] = useState<'oneway' | 'round'>('oneway');

  // Custom Dropdown Open States
  const [sourceOpen, setSourceOpen] = useState(false);
  const [destOpen, setDestOpen] = useState(false);

  // Autocomplete filter keywords
  const [sourceSearch, setSourceSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');

  // Validation feedback
  const [validationError, setValidationError] = useState('');
  const [simMode, setSimMode] = useState<'balanced' | 'budget' | 'comfort' | 'speed'>('balanced');

  // Refs for clicking outside dropdowns
  const sourceRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    const tzOffset = 6 * 60 * 60 * 1000; // BD UTC+6 offset
    const localDate = new Date(today.getTime() + tzOffset);
    const dateFormatted = localDate.toISOString().split('T')[0];
    
    setTodayStr(dateFormatted);
    setDate(dateFormatted);

    const fetchStations = async () => {
      try {
        const data = await api.getStations();
        setStations(data);
      } catch (err) {
        console.error("Failed to load stations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();

    const handleClickOutside = (event: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(event.target as Node)) {
        setSourceOpen(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setDestOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!date || !todayStr) return;
    const maxDays = transportType === 'BUS' ? 20 : (transportType === 'TRAIN' ? 10 : 60);
    const maxAllowed = getFutureDateString(maxDays);
    if (date > maxAllowed) {
      setDate(maxAllowed);
      setValidationError(`Adjusted date to ${maxAllowed} (max ${maxDays} days for ${transportType === 'ALL' ? 'all modes' : transportType.toLowerCase()}).`);
    }
  }, [transportType, todayStr]);

  const handleSwapStations = () => {
    if (!source || !destination) {
      setValidationError('Please select both locations before swapping.');
      return;
    }
    const temp = source;
    setSource(destination);
    setDestination(temp);
    setValidationError('');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source) {
      setValidationError('Please select a departure location.');
      return;
    }
    if (!destination) {
      setValidationError('Please select a destination location.');
      return;
    }
    if (source === destination) {
      setValidationError('Source and destination cannot be the same.');
      return;
    }
    if (date < todayStr) {
      setValidationError('Journey date cannot be in the past.');
      return;
    }

    const maxDaysAllowed = transportType === 'BUS' ? 20 : (transportType === 'TRAIN' ? 10 : 60);
    const maxAllowedDate = getFutureDateString(maxDaysAllowed);
    if (date > maxAllowedDate) {
      setValidationError(`For ${transportType === 'ALL' ? 'all' : transportType.toLowerCase()} journeys, max advance booking is ${maxDaysAllowed} days.`);
      return;
    }

    setValidationError('');
    router.push(`/search?source=${source}&destination=${destination}&date=${date}&transport_type=${transportType}&priority=${priority}`);
  };

  const handleQuickBookSelect = (fromCode: string, toCode: string, type: string) => {
    setSource(fromCode);
    setDestination(toCode);
    setTransportType(type);
    setDate(todayStr);
    setValidationError('');
    
    const formElement = document.getElementById('search-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStationLabel = (code: string) => {
    const safeStations = Array.isArray(stations) && stations.length > 0 ? stations : ALL_BANGLADESH_STATIONS;
    const s = safeStations.find(item => item.code === code);
    return s ? `${s.name.split(' ')[0]} (${s.code})` : (code || 'SELECT LOCATION');
  };

  const getStationDetail = (code: string) => {
    const safeStations = Array.isArray(stations) && stations.length > 0 ? stations : ALL_BANGLADESH_STATIONS;
    const s = safeStations.find(item => item.code === code);
    return s ? s.name : 'Choose location';
  };

  const filterAndGroupStations = (keyword: string, excludeCode?: string) => {
    const safeStations = Array.isArray(stations) && stations.length > 0 ? stations : ALL_BANGLADESH_STATIONS;
    const kw = (keyword || '').toLowerCase().trim();

    const filtered = safeStations.filter(st => {
      const nameMatch = (st.name || '').toLowerCase().includes(kw);
      const codeMatch = (st.code || '').toLowerCase().includes(kw);
      const cityMatch = (st.city || '').toLowerCase().includes(kw);
      const districtMatch = (st.district || '').toLowerCase().includes(kw);
      const isNotExcluded = st.code !== excludeCode;
      return (nameMatch || codeMatch || cityMatch || districtMatch) && isNotExcluded;
    });

    return {
      bus: filtered.filter(s => s.is_bus_terminal),
      railway: filtered.filter(s => s.is_railway),
      airport: filtered.filter(s => s.is_airport)
    };
  };

  const sourceGroups = filterAndGroupStations(sourceSearch, destination);
  const destGroups = filterAndGroupStations(destSearch, source);

  const promos = [
    { code: 'BKASH200', desc: 'Save up to ৳200 on any bus ticket via bKash payment.', expiry: 'EXP: 30 JUNE', badge: 'POPULAR' },
    { code: 'FLIGHT10', desc: '10% flat discount on domestic flights (US-Bangla & Biman).', expiry: 'EXP: 15 JULY', badge: 'HOT DEAL' },
    { code: 'ECVERIFY', desc: 'Register with NID & get free service fee on first booking.', expiry: 'SPECIAL OFFER', badge: 'NEW USER' }
  ];

  const topDestinations = [
    { 
      name: "COX'S BAZAR", 
      tagline: "World's longest ocean beach", 
      basePrice: '৳700', 
      fromCode: 'DAC-BUS-G', 
      toCode: 'CXB-BUS-K', 
      type: 'BUS',
    },
    { 
      name: 'SYLHET', 
      tagline: 'Land of tea gardens & hills', 
      basePrice: '৳350', 
      fromCode: 'DAC-RLY-K', 
      toCode: 'ZYL-RLY-S', 
      type: 'TRAIN',
    },
    { 
      name: 'CHITTAGONG', 
      tagline: 'Port city transit hub', 
      basePrice: '৳4,500', 
      fromCode: 'DAC-AIR-S', 
      toCode: 'CGP-AIR-A', 
      type: 'PLANE',
    }
  ];

  const faqs = [
    { q: '> IS IDENTITY MATRIX (NID) SYNCHRONIZATION REQUIRED?', a: 'Affirmative. To ensure node integrity and prevent unauthorized ticket scalping, all passenger profiles are cross-referenced with the central National Identity Registry.' },
    { q: '> HOW DOES THE ROUTE OPTIMIZER FUNCTION?', a: 'By calibrating your telemetry parameters (Credit Efficiency, Velocity Index, Comfort Factor), the engine cross-references real-time transit databases to prioritize optimal routing.' },
    { q: '> WHAT PAYMENT PROTOCOLS ARE ACCEPTED?', a: 'Our gateways seamlessly integrate with primary temporal credit networks including bKash, Nagad, Rocket, and standard orbital card nodes (Visa/Mastercard).' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-[#33ff00] font-mono">
      
      {/* Background Phosphor Matrix Canvas */}
      <RetroGrid opacity={0.5} />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Hero Column */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
            className="lg:col-span-7 space-y-5 text-center lg:text-left"
          >
            {/* ASCII Banner Logo */}
            <div className="hidden sm:block text-[9px] sm:text-[10px] leading-none text-[#33ff00] font-mono select-none overflow-hidden text-left opacity-90 drop-shadow-cli-green">
              <pre>{`
  ██████╗ ██████╗  ██████╗  ██████╗ ████████╗██╗ ██████╗██╗  ██╗███████╗████████╗
  ██╔══██╗██╔══██╗██╔════╝ ██╔═══██╗╚══██╔══╝██║██╔════╝██║  ██║██╔════╝╚══██╔══╝
  ██████╔╝██║  ██║██║  ███╗██║   ██║   ██║   ██║██║     ███████║█████╗     ██║   
  ██╔══██╗██║  ██║██║   ██║██║   ██║   ██║   ██║██║     ██╔══██║██╔══╝     ██║   
  ██████╔╝██████╔╝╚██████╔╝╚██████╔╝   ██║   ██║╚██████╗██║  ██║███████╗   ██║   
  ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝    ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝   ╚═╝   
              `}</pre>
            </div>

            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center space-x-2 border border-[#1f521f] bg-[#0a0a0a] px-3.5 py-1 text-xs text-[#ffb000] font-mono">
              <Terminal className="h-3.5 w-3.5 text-[#33ff00]" />
              <span>{user ? `root@bdgoticket:~# welcome --user ${user.username}` : 'root@bdgoticket:~# ./init_transit_system.sh'}</span>
              <span className="animate-caret-blink font-bold text-[#33ff00]">█</span>
            </motion.div>
            
            <motion.h1 variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="text-3xl font-extrabold tracking-wider sm:text-5xl text-white leading-tight font-mono">
              {t("BANGLADESH ", "বাংলাদেশের ")} <br className="hidden sm:inline" />
              <span className="text-phosphor-green">
                {t("CYBER TRANSIT MATRIX", "সাইবার ট্রানজিট ম্যাট্রিক্স")}
              </span>
            </motion.h1>
            
            <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-[#33ff00]/80 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto lg:mx-0 font-mono">
              {t("High-contrast command line interface for booking Bus, Train, and Flight transit passages across Bangladesh. Secured with Gmail OTP authentication.", "বাস, রেল এবং অ্যারো ট্রানজিট বুক করুন জিমেইল ওটিপি সহ।")}
            </motion.p>

            {/* Terminal Bracket Action Buttons */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap gap-4 items-center justify-center lg:justify-start pt-2">
              <a href="#search-form-container" className="cli-btn-primary">
                [ EXPLORE MATRIX ]
              </a>
              {!user && (
                <Link href="/auth/login" className="cli-btn-secondary">
                  [ PASSENGER LOGIN ]
                </Link>
              )}
            </motion.div>

            {/* System Status Badges */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap gap-4 items-center justify-center lg:justify-start text-xs font-mono text-[#33ff00]">
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-[#33ff00]" /> <span>NID_VERIFIED</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-[#33ff00]" /> <span>GMAIL_OTP_2FA</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-[#33ff00]" /> <span>BKASH_CHECKOUT</span></span>
            </motion.div>
          </motion.div>

          {/* Right Hero Column: Passenger Profile Window or HUD */}
          {user ? (
            <div className="lg:col-span-5 relative">
              <div className="cli-window p-5 space-y-4">
                <div className="cli-titlebar flex justify-between items-center -mx-5 -mt-5 mb-4">
                  <span>+--- PASSENGER_NODE_PROFILE [ACTIVE] ---+</span>
                  <span className="text-[#ffb000]">[OK]</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 border border-[#33ff00] bg-[#0a0a0a] text-[#33ff00] font-mono text-lg flex items-center justify-center font-bold">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono">{user.first_name || user.username}</h4>
                    <p className="text-xs text-[#ffb000] font-mono mt-0.5">SYS_ID: #00{user.id}2088</p>
                  </div>
                </div>

                {/* Status Panels */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="border border-[#1f521f] bg-[#0a0a0a] p-2 space-y-0.5">
                    <span className="block text-[9px] text-[#33ff00]/60 uppercase">NID CARD</span>
                    <span className="block font-bold text-[#33ff00]">[OK]</span>
                  </div>
                  <div className="border border-[#1f521f] bg-[#0a0a0a] p-2 space-y-0.5">
                    <span className="block text-[9px] text-[#33ff00]/60 uppercase">SIM PHONE</span>
                    <span className="block font-bold text-[#33ff00]">[OK]</span>
                  </div>
                  <div className="border border-[#1f521f] bg-[#0a0a0a] p-2 space-y-0.5">
                    <span className="block text-[9px] text-[#33ff00]/60 uppercase">GMAIL OTP</span>
                    <span className="block font-bold text-[#33ff00]">[OK]</span>
                  </div>
                </div>

                {/* Info Block */}
                <div className="border border-[#1f521f] bg-[#0a0a0a] p-3 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#33ff00]/60">NAME:</span>
                    <span className="text-white font-bold">{user.profile?.nid_name || user.first_name || 'Rakibul Islam'}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#1f521f] pt-1.5">
                    <span className="text-[#33ff00]/60">NID_NO:</span>
                    <span className="text-[#33ff00] font-bold">
                      {user.profile?.nid ? `${user.profile.nid.substring(0, 4)}******` : '1234******'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link href="/dashboard" className="cli-btn-primary text-xs h-9 px-2 text-center">
                    [ DASHBOARD ]
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="cli-btn-secondary text-xs h-9 px-2 text-center"
                  >
                    [ LOGOUT ]
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="lg:col-span-5 relative">
              <FuturisticHUD />
            </div>
          )}

        </div>
      </section>

      {/* Platform Statistics in Character Progress Bar Format */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 cli-window p-5 font-mono text-xs">
            <div className="space-y-1 border border-[#1f521f] p-3">
              <span className="block text-xs text-[#ffb000] uppercase font-bold">// DAILY_TRANSITS</span>
              <span className="block text-lg font-bold text-[#33ff00]">
                [██████████████░░] <NumberTicker value={2640} suffix="+" />
              </span>
            </div>
            <div className="space-y-1 border border-[#1f521f] p-3">
              <span className="block text-xs text-[#ffb000] uppercase font-bold">// TRANSIT_NODES</span>
              <span className="block text-lg font-bold text-[#33ff00]">
                [████████████████] <NumberTicker value={26} /> NODES
              </span>
            </div>
            <div className="space-y-1 border border-[#1f521f] p-3">
              <span className="block text-xs text-[#ffb000] uppercase font-bold">// ENROLLED_PILOTS</span>
              <span className="block text-lg font-bold text-[#33ff00]">
                [████████████░░░░] <NumberTicker value={15200} decimals={1} suffix="K" />
              </span>
            </div>
            <div className="space-y-1 border border-[#1f521f] p-3">
              <span className="block text-xs text-[#ffb000] uppercase font-bold">// TELEMETRY_SYNC</span>
              <span className="block text-lg font-bold text-[#33ff00]">
                [████████████████] <NumberTicker value={99.9} decimals={1} suffix="%" />
              </span>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Terminal Search Matrix Window */}
      <section id="search-form-container" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 relative scroll-mt-24 z-20">
        
        {validationError && (
          <div className="max-w-4xl mx-auto mb-4 border border-[#ff3333] bg-[#0a0a0a] p-3 text-xs text-[#ff3333] flex items-center space-x-2 font-mono">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#ff3333]" />
            <span className="uppercase tracking-wider">[ERR] {validationError}</span>
          </div>
        )}

        <div className="cli-window p-5 sm:p-7 relative">
          
          {/* ASCII Titlebar */}
          <div className="cli-titlebar flex justify-between items-center -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 mb-6">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-[#33ff00]" />
              <span className="text-xs font-mono font-bold text-[#33ff00] uppercase">+--- TRANSIT ROUTER INPUT [tmux 0:bash*] ---+</span>
            </div>
            <span className="text-[#ffb000] text-xs font-bold">[ READY ]</span>
          </div>

          <form onSubmit={handleSearch} className="space-y-5">
          
            {/* Control Bar: Mode & Type Select */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f521f] pb-4">
              
              {/* Transport Tabs */}
              <div className="flex border border-[#1f521f] bg-[#0a0a0a] space-x-1 p-1">
                {[
                  { id: 'ALL', label: '[ ALL MODES ]', icon: Sparkles },
                  { id: 'BUS', label: '[ BUS ]', icon: Bus },
                  { id: 'TRAIN', label: '[ TRAIN ]', icon: Train },
                  { id: 'PLANE', label: '[ PLANE ]', icon: Plane }
                ].map((tab) => {
                  const active = transportType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => { setTransportType(tab.id); setValidationError(''); }}
                      className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-mono uppercase tracking-wider transition-all duration-150 cursor-pointer ${
                        active 
                          ? 'bg-[#33ff00] text-[#0a0a0a] font-bold' 
                          : 'text-[#33ff00]/70 hover:text-[#33ff00] hover:bg-[#1f521f]/40'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Trip Type Choice */}
              <div className="flex space-x-4 text-xs font-mono text-[#33ff00]">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={tripType === 'oneway'} 
                    onChange={() => setTripType('oneway')}
                    className="accent-[#33ff00] h-3.5 w-3.5 cursor-pointer" 
                  />
                  <span className={tripType === 'oneway' ? 'text-[#ffb000] font-bold' : ''}>[ ONE-WAY ]</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer opacity-70 hover:opacity-100">
                  <input 
                    type="radio" 
                    checked={tripType === 'round'} 
                    onChange={() => {
                      setTripType('round');
                      alert('Round-trip return dates are mocked. You will search and book your outward journey first.');
                    }}
                    className="accent-[#33ff00] h-3.5 w-3.5 cursor-pointer" 
                  />
                  <span className={tripType === 'round' ? 'text-[#ffb000] font-bold' : ''}>[ ROUND-TRIP ]</span>
                </label>
              </div>

            </div>

            {/* Location Selection Fields */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              
              {/* FROM Dropdown */}
              <div ref={sourceRef} className="md:col-span-3 space-y-1 relative">
                <label className="text-xs font-mono text-[#ffb000] uppercase tracking-wider block">user@origin:~$</label>
                <button
                  type="button"
                  onClick={() => { setSourceOpen(!sourceOpen); setDestOpen(false); }}
                  className="w-full bg-[#0a0a0a] border border-[#1f521f] p-3 text-left focus:border-[#33ff00] transition-all flex items-center justify-between cursor-pointer hover:border-[#33ff00]"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="h-4 w-4 text-[#33ff00]" />
                    <div>
                      <span className="block font-bold text-xs text-[#33ff00]">
                        {source ? getStationLabel(source) : 'SELECT DEPARTURE STATION'}
                      </span>
                      <span className="block text-[11px] text-[#33ff00]/60 mt-0.5">
                        {source ? getStationDetail(source) : 'Choose origin node'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#ffb000]" />
                </button>

                {sourceOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 border border-[#33ff00] bg-[#0a0a0a] p-3 shadow-2xl flex flex-col space-y-2 font-mono text-xs">
                    <div className="relative">
                       <input
                        type="text"
                        placeholder="Filter station name/code..."
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        className="cli-input w-full text-xs"
                        autoFocus
                      />
                      {sourceSearch && (
                        <button type="button" onClick={() => setSourceSearch('')} className="absolute right-2 top-2 text-[#ff3333]">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {sourceGroups.bus.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#ffb000] uppercase block px-1">// BUS TERMINALS</span>
                          {sourceGroups.bus.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#33ff00] hover:bg-[#33ff00] hover:text-[#0a0a0a] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="font-mono">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.railway.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#ffb000] uppercase block px-1">// RAILWAY STATIONS</span>
                          {sourceGroups.railway.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#33ff00] hover:bg-[#33ff00] hover:text-[#0a0a0a] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="font-mono">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.airport.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#ffb000] uppercase block px-1">// AIRPORTS</span>
                          {sourceGroups.airport.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#33ff00] hover:bg-[#33ff00] hover:text-[#0a0a0a] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="font-mono">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.bus.length === 0 && sourceGroups.railway.length === 0 && sourceGroups.airport.length === 0 && (
                        <span className="text-xs text-[#33ff00]/50 block text-center py-2">[ERR: NO NODES MATCH]</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center md:col-span-1 pt-2">
                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="p-2.5 border border-[#1f521f] bg-[#0a0a0a] text-[#33ff00] hover:border-[#33ff00] hover:bg-[#33ff00] hover:text-[#0a0a0a] transition-all cursor-pointer"
                  title="Swap Departure and Destination"
                >
                  <ArrowLeftRight className="h-4 w-4 md:rotate-90" />
                </button>
              </div>

              {/* TO Dropdown */}
              <div ref={destRef} className="md:col-span-3 space-y-1 relative">
                <label className="text-xs font-mono text-[#ffb000] uppercase tracking-wider block">user@destination:~$</label>
                <button
                  type="button"
                  onClick={() => { setDestOpen(!destOpen); setSourceOpen(false); }}
                  className="w-full bg-[#0a0a0a] border border-[#1f521f] p-3 text-left focus:border-[#33ff00] transition-all flex items-center justify-between cursor-pointer hover:border-[#33ff00]"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="h-4 w-4 text-[#33ff00]" />
                    <div>
                      <span className="block font-bold text-xs text-[#33ff00]">
                        {destination ? getStationLabel(destination) : 'SELECT DESTINATION STATION'}
                      </span>
                      <span className="block text-[11px] text-[#33ff00]/60 mt-0.5">
                        {destination ? getStationDetail(destination) : 'Choose destination node'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#ffb000]" />
                </button>

                {destOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-40 border border-[#33ff00] bg-[#0a0a0a] p-3 shadow-2xl flex flex-col space-y-2 font-mono text-xs">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Filter station name/code..."
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        className="cli-input w-full text-xs"
                        autoFocus
                      />
                      {destSearch && (
                        <button type="button" onClick={() => setDestSearch('')} className="absolute right-2 top-2 text-[#ff3333]">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {destGroups.bus.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#ffb000] uppercase block px-1">// BUS TERMINALS</span>
                          {destGroups.bus.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#33ff00] hover:bg-[#33ff00] hover:text-[#0a0a0a] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="font-mono">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.railway.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#ffb000] uppercase block px-1">// RAILWAY STATIONS</span>
                          {destGroups.railway.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#33ff00] hover:bg-[#33ff00] hover:text-[#0a0a0a] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="font-mono">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.airport.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-[#ffb000] uppercase block px-1">// AIRPORTS</span>
                          {destGroups.airport.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#33ff00] hover:bg-[#33ff00] hover:text-[#0a0a0a] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="font-mono">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.bus.length === 0 && destGroups.railway.length === 0 && destGroups.airport.length === 0 && (
                        <span className="text-xs text-[#33ff00]/50 block text-center py-2">[ERR: NO NODES MATCH]</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Travel Date & Priority selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-xs font-mono text-[#33ff00] uppercase tracking-wider flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-[#ffb000]" />
                  <span>// JOURNEY DATE [YYYY-MM-DD]</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  max={getMaxDate()}
                  onChange={(e) => { setDate(e.target.value); setValidationError(''); }}
                  className="cli-input w-full cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-[#33ff00] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#ffb000]" />
                    <span>// RANKING ALGORITHM</span>
                  </span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="cli-input w-full cursor-pointer"
                >
                  <option value="balanced">BALANCED MATRIX</option>
                  <option value="budget">BUDGET CONTROL</option>
                  <option value="speed">VELOCITY DRIVE</option>
                  <option value="comfort">MAX COMFORT</option>
                </select>
              </div>

            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="cli-btn-primary w-full py-3.5 text-xs font-bold tracking-widest mt-2"
            >
              <span className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>[ EXECUTE TRANSIT SEARCH ]</span>
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* Promotional Offers Row */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="text-lg font-bold text-white text-center mb-6 flex items-center justify-center space-x-2 font-mono">
            <Percent className="h-5 w-5 text-[#ffb000]" />
            <span>// PROMOTIONAL PROTOCOLS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {promos.map((promo, idx) => (
              <div key={idx} className="cli-window p-4 flex flex-col justify-between space-y-3">
                <div className="cli-titlebar -mx-4 -mt-4 mb-2 flex justify-between">
                  <span>+--- CODE: {promo.code} ---+</span>
                  <span className="text-[#ffb000]">[{promo.badge}]</span>
                </div>
                <p className="text-xs text-[#33ff00]/80 leading-relaxed font-mono">{promo.desc}</p>
                <div className="text-[11px] text-[#ffb000] font-mono font-bold border-t border-[#1f521f] pt-2">{promo.expiry}</div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Top Destinations Cards */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="text-center space-y-1 mb-8 font-mono">
            <h2 className="text-lg font-bold text-white flex items-center justify-center space-x-2">
              <Flame className="h-5 w-5 text-[#33ff00]" />
              <span>// POPULAR DESTINATION NODES</span>
            </h2>
            <p className="text-xs text-[#ffb000]">Click any destination node to auto-fill search telemetry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topDestinations.map((dest, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickBookSelect(dest.fromCode, dest.toCode, dest.type)}
                className="text-left cli-window p-4 flex flex-col justify-between cursor-pointer group h-44 hover:border-[#33ff00] transition-all"
              >
                <div className="cli-titlebar -mx-4 -mt-4 mb-3 flex justify-between">
                  <span>+--- NODE: {dest.name} ---+</span>
                  <span className="text-[#ffb000]">[{dest.type}]</span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-white flex items-center space-x-1.5 group-hover:text-[#33ff00]">
                    <span>{dest.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#33ff00] transform group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-xs text-[#33ff00]/70 font-mono mt-1">{dest.tagline}</p>
                </div>

                <div className="border-t border-[#1f521f] pt-2 mt-auto flex justify-between text-xs font-mono">
                  <span className="text-[#33ff00]/60">FARE:</span>
                  <span className="font-bold text-[#ffb000]">{dest.basePrice}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Interactive Match Score Engine Simulator */}
      <section className="mx-auto max-w-5xl px-4 pb-20 font-mono">
        <div className="cli-window p-5 sm:p-7">
          <div className="cli-titlebar -mx-5 sm:-mx-7 -mt-5 sm:-mt-7 mb-5 flex justify-between">
            <span>+--- ROUTE OPTIMIZER SIMULATOR [tmux] ---+</span>
            <span className="text-[#ffb000]">[ACTIVE]</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-5 justify-center">
            {(['balanced', 'budget', 'comfort', 'speed'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setSimMode(mode);
                  setPriority(mode);
                }}
                className={`px-3 py-1 text-xs font-mono uppercase border cursor-pointer transition-all ${
                  simMode === mode
                    ? 'border-[#33ff00] bg-[#33ff00] text-[#0a0a0a] font-bold'
                    : 'border-[#1f521f] bg-[#0a0a0a] text-[#33ff00]/70 hover:border-[#33ff00]'
                }`}
              >
                [ {mode} ]
              </button>
            ))}
          </div>

          {/* Character Progress Bar Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                type: 'Green Line Bus (AC)',
                mode: 'BUS',
                budget: 8.5,
                comfort: 4.5,
                speed: 4.0,
                description: 'Economical land transit.'
              },
              {
                type: 'Subarna Express Train',
                mode: 'TRAIN',
                budget: 7.2,
                comfort: 9.0,
                speed: 5.5,
                description: 'Bypasses highway traffic.'
              },
              {
                type: 'US-Bangla Flight',
                mode: 'PLANE',
                budget: 1.5,
                comfort: 9.8,
                speed: 9.8,
                description: 'High velocity aero transit.'
              }
            ].map(item => {
              const weights = {
                balanced: { b: 0.33, c: 0.33, s: 0.33 },
                budget: { b: 0.70, c: 0.15, s: 0.15 },
                comfort: { b: 0.15, c: 0.70, s: 0.15 },
                speed: { b: 0.15, c: 0.15, s: 0.70 }
              }[simMode];

              const match = Math.round((item.budget * weights.b + item.comfort * weights.c + item.speed * weights.s) * 10);
              
              return (
                <div
                  key={item.type}
                  onClick={() => {
                    setTransportType(item.mode);
                    setPriority(simMode);
                    const el = document.getElementById('search-form-container');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="border border-[#1f521f] bg-[#0a0a0a] hover:border-[#33ff00] p-4 flex flex-col justify-between transition-all cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white group-hover:text-[#33ff00]">{item.type}</span>
                      <span className="text-xs font-mono text-[#ffb000] border border-[#ffb000] px-1.5 py-0.5">
                        {match}% MATCH
                      </span>
                    </div>
                    <p className="text-[11px] text-[#33ff00]/60">{item.description}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#1f521f] mt-3 text-xs">
                    <div>
                      <div className="flex justify-between text-[#33ff00]/70 text-[11px]">
                        <span>CREDIT EFFICIENCY</span>
                        <span>{item.budget}/10</span>
                      </div>
                      <div className="text-xs text-[#33ff00] font-mono mt-0.5">
                        [████████░░]
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#33ff00]/70 text-[11px]">
                        <span>COMFORT FACTOR</span>
                        <span>{item.comfort}/10</span>
                      </div>
                      <div className="text-xs text-[#33ff00] font-mono mt-0.5">
                        [██████████]
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#33ff00]/70 text-[11px]">
                        <span>VELOCITY INDEX</span>
                        <span>{item.speed}/10</span>
                      </div>
                      <div className="text-xs text-[#ffb000] font-mono mt-0.5">
                        [██████████]
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & System Features */}
      <section className="bg-[#0a0a0a] border-y border-[#1f521f] py-14 font-mono">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3 border border-[#1f521f] p-4">
              <div className="h-8 w-8 shrink-0 border border-[#33ff00] bg-[#0a0a0a] flex items-center justify-center text-[#33ff00]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">// ANTI_SCALPER_VERIFICATION</h4>
                <p className="text-[11px] text-[#33ff00]/70 mt-1">Requires National ID &amp; SIM verification to eliminate fake seat reservations.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 border border-[#1f521f] p-4">
              <div className="h-8 w-8 shrink-0 border border-[#33ff00] bg-[#0a0a0a] flex items-center justify-center text-[#33ff00]">
                <UserCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">// REAL_TIME_BD_STATIONS</h4>
                <p className="text-[11px] text-[#33ff00]/70 mt-1">Accurate registries covering Dhaka, Chittagong, Sylhet, and Cox's Bazar.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 border border-[#1f521f] p-4">
              <div className="h-8 w-8 shrink-0 border border-[#ffb000] bg-[#0a0a0a] flex items-center justify-center text-[#ffb000]">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">// GMAIL_OTP_CHECKOUT</h4>
                <p className="text-[11px] text-[#33ff00]/70 mt-1">Simulates complete mobile banking overlays with instant Gmail OTP authorization.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-3xl px-4 py-16 space-y-6 font-mono">
          <h2 className="text-lg font-bold text-white text-center flex items-center justify-center space-x-2">
            <HelpCircle className="h-5 w-5 text-[#33ff00]" />
            <span>// FREQUENTLY ASKED QUESTIONS</span>
          </h2>
          
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="cli-window p-4 space-y-1.5">
                <h4 className="font-bold text-[#ffb000] text-xs">{faq.q}</h4>
                <p className="text-xs text-[#33ff00]/80 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

    </div>
  );
}
