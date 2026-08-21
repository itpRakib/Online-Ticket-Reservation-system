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
import { TiltCard } from '@/components/TiltCard';
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
    if (transportType === 'PLANE') return getFutureDateString(60); // 2 months
    return getFutureDateString(60); // Default to plane (60 days)
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
      setValidationError(`Adjusted journey date to ${maxAllowed} (max ${maxDays} days in advance for ${transportType === 'ALL' ? 'all modes' : transportType.toLowerCase()}).`);
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
      setValidationError(`For ${transportType === 'ALL' ? 'all' : transportType.toLowerCase()} journeys, tickets can only be booked up to ${maxDaysAllowed} days in advance.`);
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
    return s ? `${s.name.split(' ')[0]} (${s.code})` : (code || 'Select Location');
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
    { code: 'ECVERIFY', desc: 'Register with NID & get free service fee on your first booking.', expiry: 'SPECIAL OFFER', badge: 'NEW USER' }
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
    <div className="relative min-h-screen overflow-hidden bg-[#090014] text-[#E0E0E0] font-mono">
      
      {/* Huge Background Sunset Orb (Vaporwave Signature) */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-[#FF9900] via-[#FF00FF] to-transparent blur-[120px] opacity-25 pointer-events-none -z-10" />

      {/* Receding Perspective Grid Floor Background */}
      <RetroGrid opacity={0.65} />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {user ? (
              <>
                <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center space-x-2 border border-[#FF00FF] bg-[#1a103c] px-4 py-1.5 text-xs text-[#00FFFF] font-mono shadow-[0_0_15px_rgba(255,0,255,0.4)]">
                  <Terminal className="h-3.5 w-3.5 text-[#FF9900]" />
                  <span>{t("SYSTEM ONLINE: WELCOME, ", "সিস্টেম অনলাইন: স্বাগতম, ") + (user.first_name || user.username) + "!"}</span>
                </motion.div>
                
                <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-4xl font-black tracking-wider sm:text-6xl text-white leading-tight font-heading">
                  {t("INITIALIZE ", "আপনার পরবর্তী ")} <br className="hidden sm:inline" />
                  <span className="gradient-text-sunset drop-shadow-neon-magenta">
                    {t("TRANSIT ROUTE", "ট্রানজিট রুট")}
                  </span>
                </motion.h1>
                
                <motion.p variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="text-[#E0E0E0]/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-mono">
                  {t("Search, compare, and lock transport node passages across Bangladesh with Gmail OTP authentication.", "আপনার প্রোফাইল ব্যবহার করে তাৎক্ষণিকভাবে বাস, ট্রেন ও ফ্লাইটের টিকেট বুক করুন।")}
                </motion.p>
              </>
            ) : (
              <>
                <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center space-x-2 border border-[#00FFFF] bg-[#1a103c] px-4 py-1.5 text-xs text-[#00FFFF] font-mono shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
                  <span>{t("BANGLADESH SYNTHWAVE TRANSIT MATRIX", "বাংলাদেশের আউটরান যাতায়াত পোর্টাল")}</span>
                </motion.div>
                
                <motion.h1 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-4xl font-black tracking-wider sm:text-6xl text-white leading-tight font-heading">
                  {t("CYBERPUNK ", "সাইবারপাংক ")} <br className="hidden sm:inline" />
                  <span className="gradient-text-sunset drop-shadow-neon-magenta">
                    {t("TRANSIT MATRIX", "ট্রানজিট গেটওয়ে")}
                  </span>
                </motion.h1>
                
                <motion.p variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="text-[#E0E0E0]/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0 font-mono">
                  {t("Book Bus, Railway, and Airline transits across Bangladesh. Secured with NID verification and instant Gmail OTP checkout.", "বাস, রেল এবং অ্যারো ট্রানজিট বুক করুন তাৎক্ষণিকভাবে বাংলাদেশ জুড়ে।")}
                </motion.p>
              </>
            )}

            {/* Skewed Action Buttons */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap gap-4 items-center justify-center lg:justify-start pt-2">
              <a href="#search-form-container" className="vapor-btn-primary">
                <span className="unskew">&gt; EXPLORE MATRIX</span>
              </a>
              <Link href="/seat-selection" className="vapor-btn-secondary">
                <span className="unskew">&gt; SEATS &amp; OTP</span>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap gap-4 items-center justify-center lg:justify-start text-xs font-mono text-[#00FFFF]">
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-[#FF00FF]" /> <span>{t("NID Verified", "এনআইডি যাচাইকৃত")}</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-[#FF00FF]" /> <span>{t("Gmail OTP 2FA", "জিমেইল ওটিপি")}</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-[#FF00FF]" /> <span>{t("bKash/Nagad Checkout", "বিকাশ/নগদ পেমেন্ট")}</span></span>
            </motion.div>
          </motion.div>

          {/* Right Hero Column: Terminal User Console or Futuristic HUD */}
          {user ? (
            <div className="lg:col-span-5 relative">
              <div className="terminal-window p-6 space-y-6">
                <div className="terminal-titlebar flex items-center justify-between -mx-6 -mt-6 mb-4">
                  <span className="text-xs font-mono text-[#00FFFF]">&gt; PASSENGER_NODE_PROFILE</span>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#FF00FF]" />
                    <div className="h-3 w-3 rounded-full bg-[#00FFFF]" />
                    <div className="h-3 w-3 rounded-full bg-[#FF9900]" />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 border-2 border-[#FF00FF] bg-[#1a103c] text-[#00FFFF] font-mono text-xl flex items-center justify-center font-bold shadow-[0_0_15px_#FF00FF]">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white font-heading">{user.first_name || user.username}</h4>
                    <p className="text-xs text-[#00FFFF] font-mono mt-0.5">ID: #00{user.id}2088</p>
                  </div>
                </div>

                {/* Verified Badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className="border border-[#2D1B4E] bg-[#090014] p-2 space-y-1">
                    <span className="block text-[10px] text-[#E0E0E0]/60 uppercase">NID CARD</span>
                    <span className="block font-bold text-[#00FFFF]">ACTIVE ✅</span>
                  </div>
                  <div className="border border-[#2D1B4E] bg-[#090014] p-2 space-y-1">
                    <span className="block text-[10px] text-[#E0E0E0]/60 uppercase">SIM PHONE</span>
                    <span className="block font-bold text-[#00FFFF]">ACTIVE ✅</span>
                  </div>
                  <div className="border border-[#2D1B4E] bg-[#090014] p-2 space-y-1">
                    <span className="block text-[10px] text-[#E0E0E0]/60 uppercase">GMAIL OTP</span>
                    <span className="block font-bold text-[#00FFFF]">ACTIVE ✅</span>
                  </div>
                </div>

                {/* Info Details */}
                <div className="border border-[#FF00FF]/40 bg-[#090014] p-3 text-xs space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#E0E0E0]/60">NID NAME:</span>
                    <span className="text-white font-bold">{user.profile?.nid_name || user.first_name || 'Rakibul Islam'}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#2D1B4E] pt-2">
                    <span className="text-[#E0E0E0]/60">NID NUMBER:</span>
                    <span className="text-[#00FFFF] font-bold">
                      {user.profile?.nid ? `${user.profile.nid.substring(0, 4)}******` : '1234******'}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link href="/dashboard" className="vapor-btn-primary text-xs h-10 px-2 text-center">
                    <span className="unskew">&gt; DASHBOARD</span>
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="vapor-btn-outline text-xs h-10 px-2 text-center"
                  >
                    <span className="unskew">&gt; LOGOUT</span>
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

      {/* Platform Statistics Outrun Telemetry */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 terminal-window p-6">
            <div className="text-center space-y-1">
              <span className="block text-2xl font-bold text-[#00FFFF] font-mono drop-shadow-[0_0_8px_#00FFFF]">
                <NumberTicker value={2640} suffix="+" />
              </span>
              <span className="block text-xs text-[#E0E0E0]/60 uppercase font-mono tracking-wider">DAILY TRANSITS</span>
            </div>
            <div className="text-center space-y-1 border-l border-[#2D1B4E]">
              <span className="block text-2xl font-bold text-[#FF00FF] font-mono drop-shadow-[0_0_8px_#FF00FF]">
                <NumberTicker value={26} />
              </span>
              <span className="block text-xs text-[#E0E0E0]/60 uppercase font-mono tracking-wider">TRANSIT NODES</span>
            </div>
            <div className="text-center space-y-1 border-l border-[#2D1B4E]">
              <span className="block text-2xl font-bold text-[#FF9900] font-mono drop-shadow-[0_0_8px_#FF9900]">
                <NumberTicker value={15200} decimals={1} suffix="K" />
              </span>
              <span className="block text-xs text-[#E0E0E0]/60 uppercase font-mono tracking-wider">ENROLLED PILOTS</span>
            </div>
            <div className="text-center space-y-1 border-l border-[#2D1B4E]">
              <span className="block text-2xl font-bold text-[#00FFFF] font-mono drop-shadow-[0_0_8px_#00FFFF]">
                <NumberTicker value={99.9} decimals={1} suffix="%" />
              </span>
              <span className="block text-xs text-[#E0E0E0]/60 uppercase font-mono tracking-wider">TELEMETRY SYNC</span>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Terminal Search Matrix Window */}
      <section id="search-form-container" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8 relative scroll-mt-24 z-20">
        
        {validationError && (
          <div className="max-w-4xl mx-auto mb-4 border-2 border-red-500 bg-[#090014] p-3 text-xs text-red-400 flex items-center space-x-2 font-mono shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
            <span className="uppercase tracking-wider">{validationError}</span>
          </div>
        )}

        <div className="terminal-window p-6 sm:p-8 relative">
          
          {/* Vintage Terminal Titlebar */}
          <div className="terminal-titlebar flex items-center justify-between -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6">
            <div className="flex items-center space-x-2">
              <Terminal className="h-4 w-4 text-[#00FFFF]" />
              <span className="text-xs font-mono text-[#00FFFF] tracking-wider uppercase">&gt; SEARCH_TRANSIT_MATRIX_ROUTER_V2088</span>
            </div>
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[#FF00FF]" />
              <div className="h-3 w-3 rounded-full bg-[#00FFFF]" />
              <div className="h-3 w-3 rounded-full bg-[#FF9900]" />
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-6">
          
            {/* Control Bar: Mode & Type Select */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#00FFFF]/40 pb-4">
              
              {/* Transport Tabs */}
              <div className="flex bg-[#090014] p-1 border border-[#FF00FF] space-x-1">
                {[
                  { id: 'ALL', label: '> ALL MODES', icon: Sparkles },
                  { id: 'BUS', label: '> BUS', icon: Bus },
                  { id: 'TRAIN', label: '> TRAIN', icon: Train },
                  { id: 'PLANE', label: '> PLANE', icon: Plane }
                ].map((tab) => {
                  const active = transportType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => { setTransportType(tab.id); setValidationError(''); }}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        active 
                          ? 'bg-[#00FFFF] text-black font-bold shadow-[0_0_12px_#00FFFF]' 
                          : 'text-[#E0E0E0]/70 hover:text-[#00FFFF] hover:bg-[#1a103c]'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Trip Type Choice */}
              <div className="flex space-x-4 text-xs font-mono text-[#00FFFF]">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={tripType === 'oneway'} 
                    onChange={() => setTripType('oneway')}
                    className="accent-[#FF00FF] h-3.5 w-3.5 cursor-pointer" 
                  />
                  <span className={tripType === 'oneway' ? 'text-[#FF9900] font-bold' : ''}>ONE-WAY</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer opacity-70 hover:opacity-100">
                  <input 
                    type="radio" 
                    checked={tripType === 'round'} 
                    onChange={() => {
                      setTripType('round');
                      alert('Round-trip return dates are mocked. You will search and book your outward journey first.');
                    }}
                    className="accent-[#FF00FF] h-3.5 w-3.5 cursor-pointer" 
                  />
                  <span className={tripType === 'round' ? 'text-[#FF9900] font-bold' : ''}>ROUND-TRIP</span>
                </label>
              </div>

            </div>

            {/* Location Selection Fields */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              
              {/* FROM Dropdown */}
              <div ref={sourceRef} className="md:col-span-3 space-y-1.5 relative">
                <label className="text-xs font-mono text-[#FF9900] uppercase tracking-wider block">&gt; ORIGIN NODE</label>
                <button
                  type="button"
                  onClick={() => { setSourceOpen(!sourceOpen); setDestOpen(false); }}
                  className="w-full bg-[#090014] border-2 border-[#FF00FF] p-3 text-left focus:border-[#00FFFF] focus:shadow-[0_0_15px_#00FFFF] transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-5 w-5 ${source ? 'text-[#00FFFF]' : 'text-[#FF00FF]'}`} />
                    <div>
                      <span className={`block font-bold text-sm ${source ? 'text-[#00FFFF]' : 'text-[#E0E0E0]/60'}`}>
                        {source ? getStationLabel(source) : 'Select Departure Location'}
                      </span>
                      <span className="block text-xs text-[#E0E0E0]/60 mt-0.5">
                        {source ? getStationDetail(source) : 'Choose origin station'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#FF9900]" />
                </button>

                {sourceOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-40 border-2 border-[#00FFFF] bg-[#090014] p-3 shadow-[0_0_25px_rgba(0,255,255,0.4)] flex flex-col space-y-3 font-mono">
                    <div className="relative">
                       <input
                        type="text"
                        placeholder="Search station or code..."
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        className="vapor-input w-full text-xs"
                        autoFocus
                      />
                      {sourceSearch && (
                        <button type="button" onClick={() => setSourceSearch('')} className="absolute right-2.5 top-2.5 text-[#FF00FF]">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {sourceGroups.bus.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#FF9900] uppercase block px-1">🚌 BUS TERMINALS</span>
                          {sourceGroups.bus.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#E0E0E0] hover:bg-[#1a103c] hover:text-[#00FFFF] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs text-[#FF00FF] font-mono">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.railway.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#FF9900] uppercase block px-1">🚆 RAILWAY STATIONS</span>
                          {sourceGroups.railway.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#E0E0E0] hover:bg-[#1a103c] hover:text-[#00FFFF] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs text-[#FF00FF] font-mono">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.airport.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#FF9900] uppercase block px-1">✈️ AIRPORTS</span>
                          {sourceGroups.airport.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#E0E0E0] hover:bg-[#1a103c] hover:text-[#00FFFF] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs text-[#FF00FF] font-mono">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.bus.length === 0 && sourceGroups.railway.length === 0 && sourceGroups.airport.length === 0 && (
                        <span className="text-xs text-[#E0E0E0]/50 block text-center py-3">NO MATCHING NODES FOUND</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Swap Button */}
              <div className="flex justify-center md:col-span-1 pt-3">
                <button
                  type="button"
                  onClick={handleSwapStations}
                  className="p-3 border border-[#00FFFF] bg-[#1a103c] text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black shadow-[0_0_10px_#00FFFF] transition-all cursor-pointer"
                  title="Swap Departure and Destination"
                >
                  <ArrowLeftRight className="h-4 w-4 md:rotate-90" />
                </button>
              </div>

              {/* TO Dropdown */}
              <div ref={destRef} className="md:col-span-3 space-y-1.5 relative">
                <label className="text-xs font-mono text-[#FF9900] uppercase tracking-wider block">&gt; DESTINATION NODE</label>
                <button
                  type="button"
                  onClick={() => { setDestOpen(!destOpen); setSourceOpen(false); }}
                  className="w-full bg-[#090014] border-2 border-[#FF00FF] p-3 text-left focus:border-[#00FFFF] focus:shadow-[0_0_15px_#00FFFF] transition-all flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-5 w-5 ${destination ? 'text-[#00FFFF]' : 'text-[#FF00FF]'}`} />
                    <div>
                      <span className={`block font-bold text-sm ${destination ? 'text-[#00FFFF]' : 'text-[#E0E0E0]/60'}`}>
                        {destination ? getStationLabel(destination) : 'Select Destination Location'}
                      </span>
                      <span className="block text-xs text-[#E0E0E0]/60 mt-0.5">
                        {destination ? getStationDetail(destination) : 'Choose destination node'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#FF9900]" />
                </button>

                {destOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-40 border-2 border-[#00FFFF] bg-[#090014] p-3 shadow-[0_0_25px_rgba(0,255,255,0.4)] flex flex-col space-y-3 font-mono">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search station or code..."
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        className="vapor-input w-full text-xs"
                        autoFocus
                      />
                      {destSearch && (
                        <button type="button" onClick={() => setDestSearch('')} className="absolute right-2.5 top-2.5 text-[#FF00FF]">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {destGroups.bus.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#FF9900] uppercase block px-1">🚌 BUS TERMINALS</span>
                          {destGroups.bus.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#E0E0E0] hover:bg-[#1a103c] hover:text-[#00FFFF] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs text-[#FF00FF] font-mono">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.railway.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#FF9900] uppercase block px-1">🚆 RAILWAY STATIONS</span>
                          {destGroups.railway.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#E0E0E0] hover:bg-[#1a103c] hover:text-[#00FFFF] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs text-[#FF00FF] font-mono">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.airport.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#FF9900] uppercase block px-1">✈️ AIRPORTS</span>
                          {destGroups.airport.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-xs text-[#E0E0E0] hover:bg-[#1a103c] hover:text-[#00FFFF] flex items-center justify-between cursor-pointer"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs text-[#FF00FF] font-mono">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.bus.length === 0 && destGroups.railway.length === 0 && destGroups.airport.length === 0 && (
                        <span className="text-xs text-[#E0E0E0]/50 block text-center py-3">NO MATCHING NODES FOUND</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Travel Date & Smart Priority selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#00FFFF] uppercase tracking-wider flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-[#FF00FF]" />
                  <span>&gt; JOURNEY DATE (PRESENT / FUTURE)</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  max={getMaxDate()}
                  onChange={(e) => { setDate(e.target.value); setValidationError(''); }}
                  className="vapor-input w-full cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-[#00FFFF] uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
                    <span>&gt; RANKING PREFERENCE</span>
                  </span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="vapor-input w-full cursor-pointer"
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
              className="vapor-btn-primary w-full py-4 text-sm font-bold tracking-widest mt-4"
            >
              <span className="unskew flex items-center space-x-2">
                <Search className="h-5 w-5 text-[#00FFFF]" />
                <span>EXECUTE MATRIX SEARCH 🚀</span>
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* Promotional Offers Row */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center mb-8 flex items-center justify-center space-x-2 font-heading drop-shadow-neon-cyan">
            <Percent className="h-6 w-6 text-[#00FFFF]" />
            <span>SPECIAL PROMOTIONAL PROTOCOLS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promos.map((promo, idx) => (
              <div key={idx} className="vapor-card p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="absolute top-2 right-2 text-[10px] border border-[#00FFFF] bg-[#00FFFF]/20 text-[#00FFFF] px-2 py-0.5 font-mono uppercase font-bold">
                    {promo.badge}
                  </span>
                  <div className="text-xs font-mono text-[#FF00FF] uppercase tracking-wider">&gt; PROMO CODE</div>
                  <div className="text-xl font-bold font-mono text-[#00FFFF] mt-1 drop-shadow-[0_0_5px_#00FFFF]">
                    {promo.code}
                  </div>
                  <p className="text-xs text-[#E0E0E0]/80 mt-2 leading-relaxed font-mono">{promo.desc}</p>
                </div>
                <div className="text-[11px] text-[#FF9900] mt-4 font-mono font-bold">{promo.expiry}</div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Top Destinations Cards */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center space-x-2 font-heading drop-shadow-neon-magenta">
              <Flame className="h-6 w-6 text-[#FF00FF]" />
              <span>POPULAR DESTINATION NODES</span>
            </h2>
            <p className="text-xs text-[#00FFFF] font-mono">&gt; Click card to load route telemetry into search matrix</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topDestinations.map((dest, idx) => (
              <TiltCard key={idx}>
                <button
                  onClick={() => handleQuickBookSelect(dest.fromCode, dest.toCode, dest.type)}
                  className="w-full text-left vapor-card p-5 flex flex-col justify-between cursor-pointer relative group h-48"
                >
                  <div className="w-full flex justify-between items-start">
                    <span className="text-xs border border-[#FF00FF] bg-[#FF00FF]/20 text-[#FF00FF] px-2 py-0.5 font-mono font-bold uppercase">
                      {dest.type} MODE
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-[#E0E0E0]/60 uppercase tracking-wide block font-mono">FARE FROM</span>
                      <span className="text-sm font-bold text-[#00FFFF] font-mono drop-shadow-[0_0_5px_#00FFFF]">{dest.basePrice}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h4 className="text-lg font-bold font-heading text-white flex items-center space-x-1.5 group-hover:text-[#00FFFF] transition-colors">
                      <span>{dest.name}</span>
                      <ArrowRight className="h-4 w-4 text-[#FF00FF] transform translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-xs text-[#E0E0E0]/70 font-mono mt-1">{dest.tagline}</p>
                  </div>
                </button>
              </TiltCard>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Interactive Match Score Engine Simulator */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="terminal-window p-6 sm:p-8">
          <div className="terminal-titlebar flex items-center justify-between -mx-6 sm:-mx-8 -mt-6 sm:-mt-8 mb-6">
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-[#00FFFF]" />
              <span className="text-xs font-mono text-[#00FFFF] tracking-wider uppercase">&gt; ROUTE_MATRIX_OPTIMIZER_SIMULATOR</span>
            </div>
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[#FF00FF]" />
              <div className="h-3 w-3 rounded-full bg-[#00FFFF]" />
              <div className="h-3 w-3 rounded-full bg-[#FF9900]" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {(['balanced', 'budget', 'comfort', 'speed'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setSimMode(mode);
                  setPriority(mode);
                }}
                className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider border cursor-pointer transition-all ${
                  simMode === mode
                    ? 'border-[#00FFFF] bg-[#00FFFF] text-black font-bold shadow-[0_0_10px_#00FFFF]'
                    : 'border-[#2D1B4E] bg-[#090014] text-[#E0E0E0]/70 hover:border-[#FF00FF]'
                }`}
              >
                &gt; {mode}
              </button>
            ))}
          </div>

          {/* Scoring Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                type: 'Green Line Bus (AC)',
                mode: 'BUS',
                budget: 8.5,
                comfort: 4.5,
                speed: 4.0,
                description: 'Economical highway land transit.'
              },
              {
                type: 'Subarna Express Train',
                mode: 'TRAIN',
                budget: 7.2,
                comfort: 9.0,
                speed: 5.5,
                description: 'Cabin comfort, bypasses road traffic.'
              },
              {
                type: 'US-Bangla Flight',
                mode: 'PLANE',
                budget: 1.5,
                comfort: 9.8,
                speed: 9.8,
                description: 'Ultra-fast aero transit speed.'
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
                  className="border border-[#FF00FF]/40 bg-[#090014] hover:border-[#00FFFF] p-4 flex flex-col justify-between transition-all cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white group-hover:text-[#00FFFF] font-heading">{item.type}</span>
                      <span className="text-xs font-mono text-[#00FFFF] border border-[#00FFFF] px-2 py-0.5">
                        {match}% MATCH
                      </span>
                    </div>
                    <p className="text-xs text-[#E0E0E0]/60 font-mono">{item.description}</p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#2D1B4E] mt-3 font-mono text-xs">
                    <div>
                      <div className="flex justify-between text-[#E0E0E0]/70 text-[11px]">
                        <span>CREDIT EFFICIENCY</span>
                        <span className="text-[#00FFFF]">{item.budget}/10</span>
                      </div>
                      <div className="h-1.5 bg-[#1a103c] mt-0.5">
                        <div className="h-full bg-[#00FFFF]" style={{ width: `${item.budget * 10}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#E0E0E0]/70 text-[11px]">
                        <span>COMFORT FACTOR</span>
                        <span className="text-[#FF00FF]">{item.comfort}/10</span>
                      </div>
                      <div className="h-1.5 bg-[#1a103c] mt-0.5">
                        <div className="h-full bg-[#FF00FF]" style={{ width: `${item.comfort * 10}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#E0E0E0]/70 text-[11px]">
                        <span>VELOCITY INDEX</span>
                        <span className="text-[#FF9900]">{item.speed}/10</span>
                      </div>
                      <div className="h-1.5 bg-[#1a103c] mt-0.5">
                        <div className="h-full bg-[#FF9900]" style={{ width: `${item.speed * 10}%` }} />
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
      <section className="bg-[#090014] border-y border-[#FF00FF]/40 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 shrink-0 border border-[#FF00FF] bg-[#1a103c] flex items-center justify-center text-[#FF00FF]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm font-heading">&gt; ANTI-SCALPER PROTOCOL</h4>
                <p className="text-xs text-[#E0E0E0]/70 mt-1">Requires National ID (NID) &amp; Bangladeshi SIM verification to eliminate fake seat reservations.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 shrink-0 border border-[#00FFFF] bg-[#1a103c] flex items-center justify-center text-[#00FFFF]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm font-heading">&gt; REAL-TIME BD STATIONS</h4>
                <p className="text-xs text-[#E0E0E0]/70 mt-1">Accurate station registries covering Dhaka, Chittagong, Sylhet, Cox's Bazar, and Rajshahi.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 shrink-0 border border-[#FF9900] bg-[#1a103c] flex items-center justify-center text-[#FF9900]">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm font-heading">&gt; MOBILE BANKING OTP</h4>
                <p className="text-xs text-[#E0E0E0]/70 mt-1">Simulates complete bKash/Nagad overlays with instant Gmail OTP authorization.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-3xl px-4 py-20 space-y-8 font-mono">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center flex items-center justify-center space-x-2 font-heading drop-shadow-neon-cyan">
            <HelpCircle className="h-6 w-6 text-[#00FFFF]" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="vapor-card p-5 space-y-2">
                <h4 className="font-bold text-[#00FFFF] text-sm">{faq.q}</h4>
                <p className="text-xs text-[#E0E0E0]/80 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

    </div>
  );
}
