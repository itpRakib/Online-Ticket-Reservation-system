'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/ScrollReveal';
import { NumberTicker } from '@/components/NumberTicker';
import { 
  Bus, Train, Plane, Search, ArrowLeftRight, CheckCircle2, 
  ShieldCheck, CreditCard, Sparkles, Flame, Percent, MapPin, 
  Calendar, Clock, UserCheck, HelpCircle, ChevronDown, Check, ArrowRight, X, AlertCircle, SlidersHorizontal
} from 'lucide-react';
import { FuturisticHUD } from '@/components/FuturisticHUD';
import { TiltCard } from '@/components/TiltCard';
import { GlowCard } from '@/components/GlowCard';
import { RetroGrid } from '@/components/RetroGrid';

export default function Home() {
  const router = useRouter();
  const { user, logout, language } = useAuth();
  const t = (en: string, bn: string) => (language === 'bn' ? bn : en);
  
  // Data State
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [date, setDate] = useState(''); // Managed dynamically in useEffect
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

  // Refs for clicking outside dropdowns to close them
  const sourceRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate current date string in BD timezone dynamically
    const today = new Date();
    const tzOffset = 6 * 60 * 60 * 1000; // BD UTC+6 offset
    const localDate = new Date(today.getTime() + tzOffset);
    const dateFormatted = localDate.toISOString().split('T')[0];
    
    setTodayStr(dateFormatted);
    setDate(dateFormatted); // Default search date to today dynamically

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

    // Click outside dropdowns listener
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

  // Whenever transportType changes, validate and clip the date if it exceeds new limit
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

    // Validate Max Date Constraints
    const maxDaysAllowed = transportType === 'BUS' ? 20 : (transportType === 'TRAIN' ? 10 : 60);
    const maxAllowedDate = getFutureDateString(maxDaysAllowed);
    if (date > maxAllowedDate) {
      setValidationError(`For ${transportType === 'ALL' ? 'all' : transportType.toLowerCase()} journeys, tickets can only be booked up to ${maxDaysAllowed} days in advance (Max date allowed: ${maxAllowedDate}).`);
      return;
    }

    setValidationError('');
    router.push(`/search?source=${source}&destination=${destination}&date=${date}&transport_type=${transportType}&priority=${priority}`);
  };

  const handleQuickBookSelect = (fromCode: string, toCode: string, type: string) => {
    setSource(fromCode);
    setDestination(toCode);
    setTransportType(type);
    setDate(todayStr); // Ensure date is locked to current date (no past dates)
    setValidationError('');
    
    // Auto-scroll to search form container smoothly
    const formElement = document.getElementById('search-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getStationLabel = (code: string) => {
    const s = stations.find(item => item.code === code);
    return s ? `${s.name.split(' ')[0]} (${s.code})` : 'Select Location';
  };

  const getStationDetail = (code: string) => {
    const s = stations.find(item => item.code === code);
    return s ? s.name : 'Choose where you travel from';
  };

  // Group stations by type for dropdown rendering
  const filterAndGroupStations = (keyword: string, excludeCode?: string) => {
    const filtered = stations.filter(st => {
      const matchesSearch = st.name.toLowerCase().includes(keyword.toLowerCase()) || 
                            st.code.toLowerCase().includes(keyword.toLowerCase()) ||
                            st.district.toLowerCase().includes(keyword.toLowerCase());
      const isNotExcluded = st.code !== excludeCode;
      return matchesSearch && isNotExcluded;
    });

    return {
      bus: filtered.filter(s => s.is_bus_terminal),
      railway: filtered.filter(s => s.is_railway),
      airport: filtered.filter(s => s.is_airport)
    };
  };

  const sourceGroups = filterAndGroupStations(sourceSearch, destination);
  const destGroups = filterAndGroupStations(destSearch, source);

  // Static Promotional Offers
  const promos = [
    { code: 'BKASH200', desc: 'Save up to ৳200 on any bus ticket via bKash payment.', expiry: 'Exp: 30 June', badge: 'Popular' },
    { code: 'FLIGHT10', desc: '10% flat discount on domestic flights (US-Bangla & Biman).', expiry: 'Exp: 15 July', badge: 'Hot Deal' },
    { code: 'ECVERIFY', desc: 'Register with NID & get free service fee on your first booking.', expiry: 'University Demo Special', badge: 'New User' }
  ];

  // Visual Top Destinations in Bangladesh
  const topDestinations = [
    { 
      name: 'Cox\'s Bazar', 
      tagline: 'World\'s longest sandy beach', 
      basePrice: '৳700', 
      fromCode: 'DAC-BUS-G', 
      toCode: 'CXB-BUS-K', 
      type: 'BUS',
      bgGradient: 'from-amber-600/40 to-yellow-600/40' 
    },
    { 
      name: 'Sylhet', 
      tagline: 'Land of two leaves and a bud', 
      basePrice: '৳350', 
      fromCode: 'DAC-RLY-K', 
      toCode: 'ZYL-RLY-S', 
      type: 'TRAIN',
      bgGradient: 'from-emerald-700/40 to-teal-800/40' 
    },
    { 
      name: 'Chittagong', 
      tagline: 'Commercial port city of hills', 
      basePrice: '৳4,500', 
      fromCode: 'DAC-AIR-S', 
      toCode: 'CGP-AIR-A', 
      type: 'PLANE',
      bgGradient: 'from-blue-600/40 to-indigo-700/40' 
    }
  ];

  // FAQ list
  const faqs = [
    { q: 'Is Identity Matrix (NID) synchronization required?', a: 'Affirmative. To ensure node integrity and prevent unauthorized entity access, all pilot profiles are cross-referenced with the central Identity Matrix upon initialization.' },
    { q: 'How does the Quantum Route Optimizer function?', a: 'By calibrating your telemetry parameters (Credit Efficiency, Velocity Index, Comfort Factor), the optimizer cross-references real-time transit databases to prioritize the most efficient routing nodes.' },
    { q: 'What credit transfer protocols are accepted?', a: 'Our gateways seamlessly integrate with primary temporal credit networks including bKash, Nagad, Rocket, and standard orbital charge nodes (Visa/Mastercard).' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      {/* Split Hero Section with Visual Attraction */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Column */}
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
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs text-emerald-400 shadow-inner">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{t("Assalam-o-Alaikum, ", "আসসালামু আলাইকুম, ") + (user.first_name || user.username) + "!"}</span>
                </motion.div>
                
                <motion.h1 variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(6px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } }} className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white leading-tight" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                  {t("PLAN YOUR NEXT ", "আপনার পরবর্তী ")} <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                    {t("TRANSIT ROUTE", "ট্রানজিট রুট পরিকল্পনা")}
                  </span>
                </motion.h1>
                
                <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t("Search, compare, and secure transport node passages instantly using your verified credentials.", "আপনার যাচাইকৃত প্রোফাইল ব্যবহার করে তাৎক্ষণিকভাবে ট্রান্সপোর্ট নোড প্যাসেজ অনুসন্ধান, তুলনা এবং সুরক্ষিত করুন।")}
                </motion.p>
              </>
            ) : (
              <>
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center space-x-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs text-emerald-400 shadow-inner">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{t("Unified Transport Hub of Bangladesh", "বাংলাদেশের সমন্বিত যাতায়াত পোর্টাল")}</span>
                </motion.div>
                
                <motion.h1 variants={{ hidden: { opacity: 0, y: 20, filter: 'blur(6px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } }} className="text-4xl font-extrabold tracking-tight sm:text-5xl text-white leading-tight" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                  {t("HYPER-VELOCITY ", "হাইপার-ভেলোসিটি ")} <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
                    {t("TRANSIT GATEWAY", "ট্রানজিট গেটওয়ে")}
                  </span>
                </motion.h1>
                
                <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {t("Book bus, rail, and aero transits instantly across Bangladesh. Secured by NID identity verification and real-time checkout telemetry.", "বাস, রেল এবং অ্যারো ট্রানজিট বুক করুন তাৎক্ষণিকভাবে বাংলাদেশ জুড়ে। এনআইডি যাচাইকরণ এবং রিয়েল-টাইম চেকআউট টেলিমেট্রি দ্বারা সুরক্ষিত।")}
                </motion.p>
              </>
            )}

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap gap-4 items-center justify-center lg:justify-start text-xs font-semibold text-slate-400">
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>{t("NID Verified", "এনআইডি যাচাইকৃত")}</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>{t("SIM SMS OTP", "সিম ওটিপি")}</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> <span>{t("bKash/Nagad checkout", "বিকাশ/নগদ পেমেন্ট")}</span></span>
            </motion.div>
          </motion.div>

          {/* Right Hero Column: Premium Interactive generated banner */}
          {user ? (
            <div className="lg:col-span-5 relative group">
              <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-md p-6 shadow-2xl flex flex-col space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 font-bold text-xl flex items-center justify-center uppercase shadow-md">
                    {user.username.substring(0, 2)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wide">{user.first_name || user.username}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{t("Account ID:", "অ্যাকাউন্ট আইডি:")} #00{user.id}00</p>
                  </div>
                </div>

                {/* Verified Badges */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-xl space-y-1">
                    <span className="block text-xs uppercase tracking-wide text-slate-500 font-bold">{t("NID Card", "এনআইডি")}</span>
                    <span className="block text-xs font-bold text-emerald-400">{t("Verified ✅", "যাচাইকৃত ✅")}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-xl space-y-1">
                    <span className="block text-xs uppercase tracking-wide text-slate-500 font-bold">{t("Mobile", "মোবাইল")}</span>
                    <span className="block text-xs font-bold text-emerald-400">{t("Verified ✅", "যাচাইকৃত ✅")}</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-xl space-y-1">
                    <span className="block text-xs uppercase tracking-wide text-slate-500 font-bold">{t("Gmail", "জিমেইল")}</span>
                    <span className="block text-xs font-bold text-emerald-400">{t("Verified ✅", "যাচাইকৃত ✅")}</span>
                  </div>
                </div>

                {/* Info Details */}
                <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">{t("NID Name:", "এনআইডি নাম:")}</span>
                    <span className="text-slate-400 font-bold">{user.profile?.nid_name || user.first_name || 'Rakibul Islam'}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-slate-500 font-medium">{t("NID Number:", "এনআইডি নম্বর:")}</span>
                    <span className="text-slate-400 font-mono font-bold">
                      {user.profile?.nid ? `${user.profile.nid.substring(0, 4)}******` : '1234******'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-slate-500 font-medium">{t("Mobile SIM:", "মোবাইল সিম:")}</span>
                    <span className="text-slate-400 font-mono font-bold">{user.profile?.phone || '01712******'}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href="/dashboard" passHref legacyBehavior>
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 p-3 text-center text-xs font-bold text-slate-200 transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer hover:-translate-y-0.5"
                    >
                      <span>{t("My Dashboard", "আমার ড্যাশবোর্ড")}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                    </motion.a>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={logout}
                    className="rounded-xl border border-red-500/10 bg-red-500/5 hover:bg-red-500/10 p-3 text-center text-xs font-bold text-red-400 transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                  >
                    {t("Sign Out", "লগ আউট")}
                  </motion.button>
                </div>

              </div>
            </div>
          ) : (
            <div className="lg:col-span-5 relative group">
              <FuturisticHUD />
            </div>
          )}

        </div>
      </section>

      {/* Platform Statistics Live Metrics */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-8 -mt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--bg-raised)]/50 border border-white/[0.03] rounded-2xl p-6 backdrop-blur-sm">
            <div className="text-center space-y-1">
              <span className="block text-2xl font-bold text-emerald-400 font-mono">
                <NumberTicker value={2640} suffix="+" />
              </span>
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wide">DAILY TRANSITS</span>
            </div>
            <div className="text-center space-y-1 sm:border-l sm:border-slate-800">
              <span className="block text-2xl font-bold text-teal-400 font-mono">
                <NumberTicker value={26} />
              </span>
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wide font-sans">ORBITAL NODES</span>
            </div>
            <div className="text-center space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0">
              <span className="block text-2xl font-bold text-indigo-400 font-mono">
                <NumberTicker value={15200} decimals={1} suffix="K" />
              </span>
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wide">ENROLLED PILOTS</span>
            </div>
            <div className="text-center space-y-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0">
              <span className="block text-2xl font-bold text-emerald-400 font-mono">
                <NumberTicker value={99.9} decimals={1} suffix="%" />
              </span>
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wide">TELEMETRY SYNC</span>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Professional Search Widget Section */}
      <section id="search-form-container" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 relative scroll-mt-24">
        
        {validationError && (
          <div className="max-w-4xl mx-auto mb-4 rounded-xl bg-red-500/15 border border-red-500/30 p-3.5 text-xs text-red-400 flex items-center space-x-2 shadow-lg animate-pulse">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span className="font-bold">{validationError}</span>
          </div>
        )}

        <GlowCard glowColor="emerald" intensity="low">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-slate-800 bg-slate-900/40 backdrop-blur-md">
            
            <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Control Bar: Mode and type select */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              
              {/* Transport Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 max-w-fit">
                {[
                  { id: 'ALL', label: 'All Nodes', icon: Sparkles },
                  { id: 'BUS', label: 'Ground', icon: Bus },
                  { id: 'TRAIN', label: 'Rail', icon: Train },
                  { id: 'PLANE', label: 'Aero', icon: Plane }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => { setTransportType(tab.id); setValidationError(''); }}
                    className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                      transportType === tab.id
                        ? 'bg-slate-800 text-emerald-400 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Trip type choice */}
              <div className="flex space-x-4 text-xs font-semibold text-slate-400">
                <label className="flex items-center space-x-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                  <input 
                    type="radio" 
                    checked={tripType === 'oneway'} 
                    onChange={() => setTripType('oneway')}
                    className="accent-emerald-500 h-3.5 w-3.5 cursor-pointer" 
                  />
                  <span className={tripType === 'oneway' ? 'text-emerald-400 font-bold' : ''}>One Way</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
                  <input 
                    type="radio" 
                    checked={tripType === 'round'} 
                    onChange={() => {
                      setTripType('round');
                      alert('Round-trip return dates are mocked. You will search and book your outward journey first.');
                    }}
                    className="accent-emerald-500 h-3.5 w-3.5 cursor-pointer" 
                  />
                  <span className={tripType === 'round' ? 'text-emerald-400 font-bold' : ''}>Round Trip</span>
                </label>
              </div>

            </div>

            {/* Custom Location Selection Fields */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              
              {/* FROM Dropdown */}
              <div ref={sourceRef} className="md:col-span-3 space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Origin Node</label>
                <button
                  type="button"
                  onClick={() => { setSourceOpen(!sourceOpen); setDestOpen(false); }}
                  className={`w-full rounded-xl border p-4 text-left focus:border-emerald-500 transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    source 
                      ? 'border-slate-800 bg-slate-900/60 text-slate-200' 
                      : 'border-slate-800 bg-slate-950/20 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-5 w-5 ${source ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <div>
                      <span className={`block font-bold text-sm ${source ? 'text-white' : 'text-slate-500'}`}>
                        {source ? getStationLabel(source) : 'Select Departure Location'}
                      </span>
                      <span className="block text-xs text-slate-500 leading-none mt-0.5">
                        {source ? getStationDetail(source) : 'Choose where you travel from'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {sourceOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl border border-slate-800 bg-slate-950 p-3.5 shadow-2xl flex flex-col space-y-3">
                    {/* Search inside Dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search stations, ports..."
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                      {sourceSearch && (
                        <button type="button" onClick={() => setSourceSearch('')} className="absolute right-2.5 top-2 text-slate-500 hover:text-white cursor-pointer">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-3 scrollbar pr-1">
                      {/* Bus Terminals Group */}
                      {sourceGroups.bus.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block px-1.5">🚌 Bus Terminals</span>
                          {sourceGroups.bus.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left rounded-lg p-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs font-mono text-slate-500 uppercase">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Railway Stations Group */}
                      {sourceGroups.railway.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block px-1.5">🚆 Railway Stations</span>
                          {sourceGroups.railway.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left rounded-lg p-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs font-mono text-slate-500 uppercase">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Airports Group */}
                      {sourceGroups.airport.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block px-1.5">✈️ Airports</span>
                          {sourceGroups.airport.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left rounded-lg p-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs font-mono text-slate-500 uppercase">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.bus.length === 0 && sourceGroups.railway.length === 0 && sourceGroups.airport.length === 0 && (
                        <span className="text-xs text-slate-500 block text-center py-4">No matching locations found.</span>
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
                  className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 hover:bg-slate-800 text-emerald-400 hover:text-white transition-all duration-200 shadow-lg hover:-translate-y-0.5 cursor-pointer"
                  title="Swap Locations"
                >
                  <ArrowLeftRight className="h-4 w-4 md:rotate-90" />
                </button>
              </div>

              {/* TO Dropdown */}
              <div ref={destRef} className="md:col-span-3 space-y-1.5 relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Destination Node</label>
                <button
                  type="button"
                  onClick={() => { setDestOpen(!destOpen); setSourceOpen(false); }}
                  className={`w-full rounded-xl border p-4 text-left focus:border-emerald-500 transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    destination 
                      ? 'border-slate-800 bg-slate-900/60 text-slate-200' 
                      : 'border-slate-800 bg-slate-950/20 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className={`h-5 w-5 ${destination ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <div>
                      <span className={`block font-bold text-sm ${destination ? 'text-white' : 'text-slate-500'}`}>
                        {destination ? getStationLabel(destination) : 'Select Destination Location'}
                      </span>
                      <span className="block text-xs text-slate-500 leading-none mt-0.5">
                        {destination ? getStationDetail(destination) : 'Choose where you want to go'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {destOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-40 rounded-2xl border border-slate-800 bg-slate-950 p-3.5 shadow-2xl flex flex-col space-y-3">
                    {/* Search inside Dropdown */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search stations, ports..."
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        autoFocus
                      />
                      {destSearch && (
                        <button type="button" onClick={() => setDestSearch('')} className="absolute right-2.5 top-2 text-slate-500 hover:text-white cursor-pointer">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-3 scrollbar pr-1">
                      {/* Bus Terminals Group */}
                      {destGroups.bus.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block px-1.5">🚌 Bus Terminals</span>
                          {destGroups.bus.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left rounded-lg p-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs font-mono text-slate-500 uppercase">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Railway Stations Group */}
                      {destGroups.railway.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block px-1.5">🚆 Railway Stations</span>
                          {destGroups.railway.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left rounded-lg p-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs font-mono text-slate-500 uppercase">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Airports Group */}
                      {destGroups.airport.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block px-1.5">✈️ Airports</span>
                          {destGroups.airport.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left rounded-lg p-2 text-xs text-slate-400 hover:bg-slate-900 hover:text-white flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <span>{st.name}</span>
                              <span className="text-xs font-mono text-slate-500 uppercase">{st.code}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.bus.length === 0 && destGroups.railway.length === 0 && destGroups.airport.length === 0 && (
                        <span className="text-xs text-slate-500 block text-center py-4">No matching locations found.</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Travel Date & Priority selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Journey Date (Locked to Present/Future)</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  max={getMaxDate()}
                  onChange={(e) => { setDate(e.target.value); setValidationError(''); }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Smart Ranking Preference</span>
                  </span>
                  <span className="text-xs bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-bold uppercase leading-none">Dynamic Compare</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="balanced">BALANCED</option>
                  <option value="budget">BUDGET CONTROL</option>
                  <option value="speed">VELOCITY DRIVE</option>
                  <option value="comfort">MAX COMFORT</option>
                </select>
              </div>

            </div>

            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-600 hover:from-cyan-300 hover:to-fuchsia-500 p-4 font-bold text-slate-950 flex items-center justify-center space-x-2 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-200"
            >
              <Search className="h-5 w-5" />
              <span>EXECUTE ROUTE SCAN</span>
            </motion.button>
          </form>
        </div>
        </GlowCard>
      </section>

      {/* Promotional Offers Row */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-6 flex items-center justify-center space-x-2" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            <Percent className="h-6 w-6 text-cyan-400" />
            <span>QUANTUM TRAVEL PROTOCOLS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promos.map((promo, idx) => (
              <TiltCard key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 relative overflow-hidden">
                <span className="absolute top-2 right-2 text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  {promo.badge}
                </span>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Promo Code</div>
                <div className="text-lg font-bold text-cyan-400 mt-1 flex items-center space-x-1.5">
                  <span className="font-mono">{promo.code}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{promo.desc}</p>
                <div className="text-xs text-slate-500 mt-4 font-semibold">{promo.expiry}</div>
              </TiltCard>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Premium Top Destinations Cards (Direct Links) */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-bold text-white flex items-center justify-center space-x-2" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
              <Flame className="h-6 w-6 text-cyan-500" />
              <span>POPULAR DESTINATION NODES</span>
            </h2>
            <p className="text-xs text-slate-400">Click any destination card below to immediately select that route in the booking form</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topDestinations.map((dest, idx) => (
              <TiltCard key={idx}>
                <button
                  onClick={() => handleQuickBookSelect(dest.fromCode, dest.toCode, dest.type)}
                  className="w-full text-left rounded-3xl overflow-hidden glass-panel border border-slate-800 hover:border-emerald-500/50 transition-all hover:-translate-y-0.5 duration-200 flex flex-col cursor-pointer relative group h-48"
                >
                  {/* Background gradient design mimicking a scenic image container */}
                  <div className={`absolute inset-0 bg-gradient-to-tr ${dest.bgGradient} -z-10 group-hover:scale-105 transition-transform duration-500`} />
                  
                  {/* Top status bar */}
                  <div className="p-5 w-full flex justify-between items-start">
                    <span className="text-xs bg-slate-950/80 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {dest.type} Mode
                    </span>
                    <div className="text-right">
                      <span className="text-xs text-slate-300 uppercase tracking-wide block font-bold">Fare From</span>
                      <span className="text-sm font-bold text-emerald-400">{dest.basePrice}</span>
                    </div>
                  </div>

                  {/* Bottom Details */}
                  <div className="mt-auto p-5 w-full bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent">
                    <h4 className="text-lg font-bold text-white flex items-center space-x-1.5">
                      <span>{dest.name}</span>
                      <ArrowRight className="h-4 w-4 text-emerald-400 transform translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{dest.tagline}</p>
                  </div>
                </button>
              </TiltCard>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Interactive Match Score Engine Simulator */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="glass-panel border border-slate-800 rounded-3xl p-8 relative overflow-hidden bg-slate-900/40">
          <div className="text-center md:text-left md:flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center md:justify-start space-x-2" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                <SlidersHorizontal className="h-6 w-6 text-cyan-400" />
                <span>ROUTE MATRIX OPTIMIZER</span>
              </h2>
            </div>
            
            {/* Simulator priority triggers */}
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0 justify-center">
              {(['balanced', 'budget', 'comfort', 'speed'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSimMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all duration-200 border cursor-pointer hover:-translate-y-0.5 ${
                    simMode === mode
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/10'
                      : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive display of scoring progress bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                type: 'Green Line Bus (Economy)',
                mode: 'BUS',
                budget: 8.5,
                comfort: 4.5,
                speed: 4.0,
                description: 'Balanced cost, standard land highway travel times.'
              },
              {
                type: 'Subarna Express Train (AC cabin)',
                mode: 'TRAIN',
                budget: 7.2,
                comfort: 9.0,
                speed: 5.5,
                description: 'Premium cabin comfort, bypasses highway traffic completely.'
              },
              {
                type: 'US-Bangla Flight (VIP class)',
                mode: 'PLANE',
                budget: 1.5,
                comfort: 9.8,
                speed: 9.8,
                description: 'Ultra-fast travel speeds, premium air amenities, high ticket fare.'
              }
            ].map(item => {
              // Calculate dynamic match rate based on simulated weights
              const weights = {
                balanced: { b: 0.33, c: 0.33, s: 0.33 },
                budget: { b: 0.70, c: 0.15, s: 0.15 },
                comfort: { b: 0.15, c: 0.70, s: 0.15 },
                speed: { b: 0.15, c: 0.15, s: 0.70 }
              }[simMode];

              const match = Math.round((item.budget * weights.b + item.comfort * weights.c + item.speed * weights.s) * 10);
              
              return (
                <div key={item.type} className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-200 leading-tight pr-2">{item.type}</span>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono shrink-0">
                        {match}% Match
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Credit Efficiency</span>
                        <span className="font-mono">{item.budget}/10</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${item.budget * 10}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Comfort Factor</span>
                        <span className="font-mono">{item.comfort}/10</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${item.comfort * 10}%` }} />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>Velocity Index</span>
                        <span className="font-mono">{item.speed}/10</span>
                      </div>
                      <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${item.speed * 10}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security trust badges and details */}
      <section className="bg-slate-950/40 border-y border-slate-800 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Anti-Scalper Verification</h4>
                <p className="text-xs text-slate-400 mt-1">Requires official National ID (NID) and Bangladeshi SIM verification during signup to prevent fake ticket bookings.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Real-life BD Station Registry</h4>
                <p className="text-xs text-slate-400 mt-1">Includes accurate station registries for railways, buses, and airports covering Dhaka, Chittagong, Sylhet, Cox's Bazar, and Rajshahi.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Interactive Banking checkout</h4>
                <p className="text-xs text-slate-400 mt-1">Simulates complete bKash/Nagad overlays, requiring verification OTP codes and mobile banking PINs to authorize bookings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-3xl px-4 py-20 space-y-10">
          <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center space-x-2" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            <HelpCircle className="h-6 w-6 text-slate-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2 hover:border-slate-700 transition-colors">
                <h4 className="font-bold text-white text-sm">{faq.q}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <RetroGrid />
    </div>
  );
}
