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
  Calendar, Clock, UserCheck, HelpCircle, ChevronDown, Check, ArrowRight, X, AlertCircle, Edit3, Heart, Tag
} from 'lucide-react';
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
    { code: 'BKASH200', desc: 'Save up to ৳200 on any bus ticket via bKash payment.', expiry: 'Exp: 30 June', badge: 'Popular!' },
    { code: 'FLIGHT10', desc: '10% flat discount on domestic flights (US-Bangla & Biman).', expiry: 'Exp: 15 July', badge: 'Hot Deal 🔥' },
    { code: 'ECVERIFY', desc: 'Register with NID & get free service fee on first booking.', expiry: 'Special Note', badge: 'New User ✨' }
  ];

  const topDestinations = [
    { 
      name: "Cox's Bazar", 
      tagline: "World's longest ocean beach", 
      basePrice: '৳700', 
      fromCode: 'DAC-BUS-G', 
      toCode: 'CXB-BUS-K', 
      type: 'BUS',
    },
    { 
      name: 'Sylhet', 
      tagline: 'Land of tea gardens & hills', 
      basePrice: '৳350', 
      fromCode: 'DAC-RLY-K', 
      toCode: 'ZYL-RLY-S', 
      type: 'TRAIN',
    },
    { 
      name: 'Chittagong', 
      tagline: 'Port city transit hub', 
      basePrice: '৳4,500', 
      fromCode: 'DAC-AIR-S', 
      toCode: 'CGP-AIR-A', 
      type: 'PLANE',
    }
  ];

  const faqs = [
    { q: '✏️ Is NID verification required to book tickets?', a: 'Yes! To prevent ticket scalping and ensure security, all passenger profiles are cross-verified with Bangladesh NID records.' },
    { q: '📌 How does the Route Optimizer match journeys?', a: 'By calibrating your preference weights (Price, Speed, Comfort), our algorithm selects the top multi-modal travel options for your route.' },
    { q: '💳 What payment options are supported?', a: 'We support all major Bangladesh payment gateways including bKash, Nagad, Rocket, and Visa/Mastercard credit cards.' }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdfbf7] text-[#2d2d2d] font-body text-lg">
      
      {/* Background Doodled Grid Canvas */}
      <RetroGrid opacity={0.6} />

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
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="inline-flex items-center space-x-2 border-[2.5px] border-[#2d2d2d] bg-[#fff9c4] px-4 py-1.5 text-base font-bold text-[#2d2d2d] wobbly-badge shadow-[3px_3px_0px_#2d2d2d] -rotate-1">
              <Edit3 className="h-4 w-4 text-[#ff4d4d]" />
              <span>{user ? `✏️ Welcome back, ${user.username}!` : '✏️ Hand-Drawn Transit Sketchbook'}</span>
            </motion.div>
            
            <motion.h1 variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }} className="text-4xl font-extrabold tracking-tight sm:text-6xl text-[#2d2d2d] leading-tight font-heading">
              {t("Book Bus, Train & Flight ", "বাস, ট্রেন ও ফ্লাইটের টিকেট ")} <br className="hidden sm:inline" />
              <span className="text-[#ff4d4d] underline decoration-wavy decoration-[#2d5da1]">
                {t("Tickets Easily!", "বুক করুন সহজে!")}
              </span>
            </motion.h1>
            
            <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="text-[#2d2d2d]/80 text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 font-body">
              {t("A human-centered sketchbook interface to search, compare, and reserve multi-modal transit passages across Bangladesh with Gmail OTP verification.", "বাংলাদেশ জুড়ে বাস, ট্রেন ও ফ্লাইটের টিকেট বুকিং করুন একদম সহজে।")}
            </motion.p>

            {/* Hand-Drawn Action Buttons */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap gap-4 items-center justify-center lg:justify-start pt-2">
              <a href="#search-form-container" className="hand-btn-primary">
                ✏️ Explore Journeys
              </a>
              {!user && (
                <Link href="/auth/login" className="hand-btn-secondary">
                  🔑 Passenger Login
                </Link>
              )}
            </motion.div>

            {/* Feature Badges */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap gap-4 items-center justify-center lg:justify-start text-base font-bold text-[#2d2d2d]">
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-5 w-5 text-[#ff4d4d]" /> <span>NID Verified</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-5 w-5 text-[#2d5da1]" /> <span>Gmail OTP 2FA</span></span>
              <span className="flex items-center space-x-1.5"><CheckCircle2 className="h-5 w-5 text-[#ff4d4d]" /> <span>Instant Checkout</span></span>
            </motion.div>
          </motion.div>

          {/* Right Hero Column: Passenger Profile Index Card */}
          {user ? (
            <div className="lg:col-span-5 relative">
              <div className="hand-card p-6 space-y-4 relative -rotate-1">
                <div className="tape-strip" />
                
                <div className="flex items-center space-x-3 pt-2">
                  <div className="h-12 w-12 border-[3px] border-[#2d2d2d] bg-[#fff9c4] text-[#2d2d2d] font-heading text-2xl flex items-center justify-center font-bold wobbly-box shadow-[2px_2px_0px_#2d2d2d]">
                    {user.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold font-heading text-[#2d2d2d]">{user.first_name || user.username}</h4>
                    <p className="text-sm text-[#2d5da1] font-bold">Passenger ID: #00{user.id}2088</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-3 gap-2 text-center text-sm font-bold">
                  <div className="border-[2px] border-[#2d2d2d] bg-[#fdfbf7] p-2 wobbly-badge">
                    <span className="block text-xs text-[#2d2d2d]/60">NID CARD</span>
                    <span className="block text-[#ff4d4d]">✓ Verified</span>
                  </div>
                  <div className="border-[2px] border-[#2d2d2d] bg-[#fdfbf7] p-2 wobbly-badge">
                    <span className="block text-xs text-[#2d2d2d]/60">PHONE</span>
                    <span className="block text-[#2d5da1]">✓ Active</span>
                  </div>
                  <div className="border-[2px] border-[#2d2d2d] bg-[#fdfbf7] p-2 wobbly-badge">
                    <span className="block text-xs text-[#2d2d2d]/60">GMAIL OTP</span>
                    <span className="block text-[#ff4d4d]">✓ Ready</span>
                  </div>
                </div>

                {/* Info Block */}
                <div className="border-[2px] border-[#2d2d2d] bg-[#fff9c4] p-3 text-base space-y-1.5 wobbly-box">
                  <div className="flex justify-between">
                    <span className="text-[#2d2d2d]/70">Name:</span>
                    <span className="font-bold text-[#2d2d2d]">{user.profile?.nid_name || user.first_name || 'Rakibul Islam'}</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-[#2d2d2d]/40 pt-1.5">
                    <span className="text-[#2d2d2d]/70">NID No:</span>
                    <span className="font-bold text-[#2d5da1]">
                      {user.profile?.nid ? `${user.profile.nid.substring(0, 4)}******` : '1234******'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link href="/dashboard" className="hand-btn-primary text-base h-10 px-2 text-center">
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="hand-btn-secondary text-base h-10 px-2 text-center"
                  >
                    Logout
                  </button>
                </div>

              </div>
            </div>
          ) : (
            <div className="lg:col-span-5 relative">
              <div className="postit-card p-7 space-y-4 text-center relative rotate-2">
                <div className="thumbtack" />
                <h3 className="text-2xl font-bold font-heading text-[#2d2d2d] pt-2">
                  📌 Quick Ticket Booking
                </h3>
                <p className="text-lg text-[#2d2d2d]/80 leading-relaxed">
                  Search luxury coaches, Bangladesh Railway trains, and domestic flights in one notebook sketchbook!
                </p>
                <div className="pt-2">
                  <a href="#search-form-container" className="hand-btn-primary w-full py-3">
                    ✏️ Start Booking Now
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Platform Statistics */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { label: 'Daily Transits', val: 2640, suffix: '+', color: 'text-[#ff4d4d]' },
              { label: 'Transit Nodes', val: 26, suffix: ' Nodes', color: 'text-[#2d5da1]' },
              { label: 'Registered Pilots', val: 15.2, decimals: 1, suffix: 'K', color: 'text-[#ff4d4d]' },
              { label: 'Route Telemetry', val: 99.9, decimals: 1, suffix: '%', color: 'text-[#2d5da1]' }
            ].map((stat, idx) => (
              <div key={idx} className="hand-card p-4 text-center space-y-1 wobbly-box rotate-1">
                <span className="block text-base font-bold text-[#2d2d2d]/70 uppercase">// {stat.label}</span>
                <span className={`block text-3xl font-bold font-heading ${stat.color}`}>
                  <NumberTicker value={stat.val} decimals={stat.decimals} suffix={stat.suffix} />
                </span>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Post-It Yellow Search Container */}
      <section id="search-form-container" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 relative scroll-mt-24 z-20">
        
        {validationError && (
          <div className="max-w-4xl mx-auto mb-4 border-[3px] border-[#2d2d2d] bg-[#ff4d4d] text-white p-3 text-base flex items-center space-x-2 font-bold wobbly-box shadow-[3px_3px_0px_#2d2d2d]">
            <AlertCircle className="h-5 w-5 shrink-0 text-white" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="postit-card p-6 sm:p-8 relative -rotate-1">
          <div className="tape-strip" />

          <h2 className="text-3xl font-bold font-heading text-[#2d2d2d] text-center mb-6 pt-2">
            ✏️ Search Transit Route Matrix
          </h2>

          <form onSubmit={handleSearch} className="space-y-6">
          
            {/* Control Bar: Mode & Type Select */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-dashed border-[#2d2d2d]/40 pb-5">
              
              {/* Transport Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'ALL', label: 'All Modes ✨', icon: Sparkles },
                  { id: 'BUS', label: 'Bus 🚌', icon: Bus },
                  { id: 'TRAIN', label: 'Train 🚂', icon: Train },
                  { id: 'PLANE', label: 'Plane ✈️', icon: Plane }
                ].map((tab) => {
                  const active = transportType === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => { setTransportType(tab.id); setValidationError(''); }}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-base font-bold wobbly-btn transition-all cursor-pointer ${
                        active 
                          ? 'border-[3px] border-[#2d2d2d] bg-[#ff4d4d] text-white shadow-[3px_3px_0px_#2d2d2d] -rotate-1' 
                          : 'border-[2px] border-[#2d2d2d] bg-white text-[#2d2d2d] hover:bg-[#e5e0d8]'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Trip Type Choice */}
              <div className="flex space-x-4 text-base font-bold text-[#2d2d2d]">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={tripType === 'oneway'} 
                    onChange={() => setTripType('oneway')}
                    className="accent-[#ff4d4d] h-4 w-4 cursor-pointer" 
                  />
                  <span className={tripType === 'oneway' ? 'text-[#ff4d4d] underline' : ''}>One-Way</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer opacity-70 hover:opacity-100">
                  <input 
                    type="radio" 
                    checked={tripType === 'round'} 
                    onChange={() => {
                      setTripType('round');
                      alert('Round-trip return dates are mocked. You will search and book your outward journey first.');
                    }}
                    className="accent-[#ff4d4d] h-4 w-4 cursor-pointer" 
                  />
                  <span className={tripType === 'round' ? 'text-[#ff4d4d] underline' : ''}>Round-Trip</span>
                </label>
              </div>

            </div>

            {/* Location Selection Fields */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
              
              {/* FROM Dropdown */}
              <div ref={sourceRef} className="md:col-span-3 space-y-1 relative">
                <label className="text-base font-bold text-[#2d2d2d] block">Departure Node:</label>
                <button
                  type="button"
                  onClick={() => { setSourceOpen(!sourceOpen); setDestOpen(false); }}
                  className="w-full bg-white border-[3px] border-[#2d2d2d] p-3 text-left wobbly-input shadow-[3px_3px_0px_#2d2d2d] flex items-center justify-between cursor-pointer hover:border-[#2d5da1]"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="h-5 w-5 text-[#ff4d4d]" />
                    <div>
                      <span className="block font-bold text-base text-[#2d2d2d]">
                        {source ? getStationLabel(source) : 'SELECT DEPARTURE'}
                      </span>
                      <span className="block text-xs text-[#2d2d2d]/60 mt-0.5">
                        {source ? getStationDetail(source) : 'Choose origin node'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-[#2d2d2d]" />
                </button>

                {sourceOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-40 border-[3px] border-[#2d2d2d] bg-white p-3 shadow-2xl wobbly-box flex flex-col space-y-2 text-base">
                    <div className="relative">
                       <input
                        type="text"
                        placeholder="Search station or city..."
                        value={sourceSearch}
                        onChange={(e) => setSourceSearch(e.target.value)}
                        className="hand-input w-full text-base"
                        autoFocus
                      />
                      {sourceSearch && (
                        <button type="button" onClick={() => setSourceSearch('')} className="absolute right-2 top-3 text-[#ff4d4d]">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {sourceGroups.bus.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#ff4d4d] uppercase block px-1">// Bus Terminals</span>
                          {sourceGroups.bus.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-base text-[#2d2d2d] hover:bg-[#fff9c4] flex items-center justify-between cursor-pointer rounded"
                            >
                              <span>{st.name}</span>
                              <span className="font-bold text-[#2d5da1]">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.railway.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#2d5da1] uppercase block px-1">// Railway Stations</span>
                          {sourceGroups.railway.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-base text-[#2d2d2d] hover:bg-[#fff9c4] flex items-center justify-between cursor-pointer rounded"
                            >
                              <span>{st.name}</span>
                              <span className="font-bold text-[#2d5da1]">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.airport.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#ff4d4d] uppercase block px-1">// Airports</span>
                          {sourceGroups.airport.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setSource(st.code); setSourceOpen(false); setSourceSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-base text-[#2d2d2d] hover:bg-[#fff9c4] flex items-center justify-between cursor-pointer rounded"
                            >
                              <span>{st.name}</span>
                              <span className="font-bold text-[#2d5da1]">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {sourceGroups.bus.length === 0 && sourceGroups.railway.length === 0 && sourceGroups.airport.length === 0 && (
                        <span className="text-base text-[#2d2d2d]/50 block text-center py-2">No matching stations found</span>
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
                  className="p-3 border-[3px] border-[#2d2d2d] bg-white text-[#2d2d2d] wobbly-btn shadow-[3px_3px_0px_#2d2d2d] hover:bg-[#ff4d4d] hover:text-white transition-all cursor-pointer"
                  title="Swap Departure and Destination"
                >
                  <ArrowLeftRight className="h-5 w-5 md:rotate-90" />
                </button>
              </div>

              {/* TO Dropdown */}
              <div ref={destRef} className="md:col-span-3 space-y-1 relative">
                <label className="text-base font-bold text-[#2d2d2d] block">Destination Node:</label>
                <button
                  type="button"
                  onClick={() => { setDestOpen(!destOpen); setSourceOpen(false); }}
                  className="w-full bg-white border-[3px] border-[#2d2d2d] p-3 text-left wobbly-input shadow-[3px_3px_0px_#2d2d2d] flex items-center justify-between cursor-pointer hover:border-[#2d5da1]"
                >
                  <div className="flex items-center space-x-2.5">
                    <MapPin className="h-5 w-5 text-[#2d5da1]" />
                    <div>
                      <span className="block font-bold text-base text-[#2d2d2d]">
                        {destination ? getStationLabel(destination) : 'SELECT DESTINATION'}
                      </span>
                      <span className="block text-xs text-[#2d2d2d]/60 mt-0.5">
                        {destination ? getStationDetail(destination) : 'Choose destination node'}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-5 w-5 text-[#2d2d2d]" />
                </button>

                {destOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-40 border-[3px] border-[#2d2d2d] bg-white p-3 shadow-2xl wobbly-box flex flex-col space-y-2 text-base">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search station or city..."
                        value={destSearch}
                        onChange={(e) => setDestSearch(e.target.value)}
                        className="hand-input w-full text-base"
                        autoFocus
                      />
                      {destSearch && (
                        <button type="button" onClick={() => setDestSearch('')} className="absolute right-2 top-3 text-[#ff4d4d]">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                      {destGroups.bus.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#ff4d4d] uppercase block px-1">// Bus Terminals</span>
                          {destGroups.bus.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-base text-[#2d2d2d] hover:bg-[#fff9c4] flex items-center justify-between cursor-pointer rounded"
                            >
                              <span>{st.name}</span>
                              <span className="font-bold text-[#2d5da1]">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.railway.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#2d5da1] uppercase block px-1">// Railway Stations</span>
                          {destGroups.railway.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-base text-[#2d2d2d] hover:bg-[#fff9c4] flex items-center justify-between cursor-pointer rounded"
                            >
                              <span>{st.name}</span>
                              <span className="font-bold text-[#2d5da1]">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.airport.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[#ff4d4d] uppercase block px-1">// Airports</span>
                          {destGroups.airport.map(st => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => { setDestination(st.code); setDestOpen(false); setDestSearch(''); setValidationError(''); }}
                              className="w-full text-left p-1.5 text-base text-[#2d2d2d] hover:bg-[#fff9c4] flex items-center justify-between cursor-pointer rounded"
                            >
                              <span>{st.name}</span>
                              <span className="font-bold text-[#2d5da1]">[{st.code}]</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {destGroups.bus.length === 0 && destGroups.railway.length === 0 && destGroups.airport.length === 0 && (
                        <span className="text-base text-[#2d2d2d]/50 block text-center py-2">No matching stations found</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Travel Date & Priority selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1">
                <label className="text-base font-bold text-[#2d2d2d] flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-[#ff4d4d]" />
                  <span>Journey Date:</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayStr}
                  max={getMaxDate()}
                  onChange={(e) => { setDate(e.target.value); setValidationError(''); }}
                  className="hand-input w-full cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-base font-bold text-[#2d2d2d] flex items-center space-x-1">
                  <Sparkles className="h-4 w-4 text-[#2d5da1]" />
                  <span>Ranking Preference:</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="hand-input w-full cursor-pointer"
                >
                  <option value="balanced">Balanced Matrix</option>
                  <option value="budget">Budget Saver</option>
                  <option value="speed">Velocity Drive</option>
                  <option value="comfort">Max Comfort</option>
                </select>
              </div>

            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="hand-btn-primary w-full py-4 text-xl font-bold mt-2"
            >
              <span className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <span>✏️ Execute Search</span>
              </span>
            </button>
          </form>
        </div>
      </section>

      {/* Promotional Offers Row */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="text-3xl font-bold font-heading text-[#2d2d2d] text-center mb-6 flex items-center justify-center space-x-2">
            <Percent className="h-6 w-6 text-[#ff4d4d]" />
            <span>Promotional Coupons</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {promos.map((promo, idx) => (
              <div key={idx} className="hand-card p-5 flex flex-col justify-between space-y-3 relative rotate-1">
                <div className="thumbtack" />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold font-heading text-xl text-[#2d2d2d]">Code: {promo.code}</span>
                  <span className="text-sm font-bold text-white bg-[#ff4d4d] px-2 py-0.5 wobbly-badge">{promo.badge}</span>
                </div>
                <p className="text-base text-[#2d2d2d]/80 leading-relaxed font-body">{promo.desc}</p>
                <div className="text-sm font-bold text-[#2d5da1] border-t border-dashed border-[#2d2d2d]/30 pt-2">{promo.expiry}</div>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Top Destinations Cards */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-3xl font-bold font-heading text-[#2d2d2d] flex items-center justify-center space-x-2">
              <Flame className="h-6 w-6 text-[#ff4d4d]" />
              <span>Popular Destinations</span>
            </h2>
            <p className="text-base text-[#2d5da1] font-bold">Click any route to auto-fill search telemetry</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topDestinations.map((dest, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickBookSelect(dest.fromCode, dest.toCode, dest.type)}
                className="text-left hand-card p-5 flex flex-col justify-between cursor-pointer group h-48 hover:-rotate-1 transition-all"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs bg-[#e5e0d8] text-[#2d2d2d] px-2 py-0.5 wobbly-badge">
                    {dest.type}
                  </span>
                  <span className="text-sm font-bold text-[#ff4d4d]">Fare: {dest.basePrice}</span>
                </div>

                <div>
                  <h4 className="text-2xl font-bold font-heading text-[#2d2d2d] flex items-center space-x-1.5 group-hover:text-[#ff4d4d]">
                    <span>{dest.name}</span>
                    <ArrowRight className="h-4 w-4 text-[#ff4d4d] transform group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-base text-[#2d2d2d]/70 mt-1">{dest.tagline}</p>
                </div>

                <div className="border-t border-dashed border-[#2d2d2d]/30 pt-2 mt-auto text-sm font-bold text-[#2d5da1]">
                  Click to auto-fill route ✏️
                </div>
              </button>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* Frequently Asked Questions */}
      <ScrollReveal delay={0.1}>
        <section className="mx-auto max-w-3xl px-4 py-16 space-y-6">
          <h2 className="text-3xl font-bold font-heading text-[#2d2d2d] text-center flex items-center justify-center space-x-2">
            <HelpCircle className="h-6 w-6 text-[#2d5da1]" />
            <span>Frequently Asked Questions</span>
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="hand-card p-5 space-y-2 wobbly-box -rotate-1">
                <h4 className="font-bold font-heading text-xl text-[#ff4d4d]">{faq.q}</h4>
                <p className="text-lg text-[#2d2d2d]/80 leading-relaxed font-body">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </ScrollReveal>

    </div>
  );
}
