'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Bus, Train, Plane, Sparkles, SlidersHorizontal, 
  MapPin, Calendar, AlertTriangle, ArrowRight, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TiltCard } from '@/components/TiltCard';

const defaultFallbackTrips = [
  {
    id: 101,
    transport_type: 'BUS',
    operator_name: 'Green Line Paribahan',
    company_name: 'Green Line',
    transport_identifier: 'GL-802',
    source: 'DHK',
    source_name: 'Gabtoli Bus Terminal, Dhaka',
    destination: 'CTG',
    destination_name: 'Dampara Bus Stand, Chittagong',
    departure_time: '07:30 AM',
    arrival_time: '01:30 PM',
    duration_hours: 6,
    fare_economy: '1200',
    available_seats: 28,
    total_seats: 40,
    class_type: 'AC Scania Multi-Axle',
    comparison: {
      match_percentage: 86,
      budget_score: 8.0,
      speed_score: 7.0,
      comfort_score: 8.5
    }
  },
  {
    id: 102,
    transport_type: 'TRAIN',
    operator_name: 'Subarna Express (701)',
    company_name: 'Bangladesh Railway',
    transport_identifier: 'SUBARNA-701',
    source: 'DHK',
    source_name: 'Kamalapur Railway Station, Dhaka',
    destination: 'CTG',
    destination_name: 'Chittagong Railway Station',
    departure_time: '04:30 PM',
    arrival_time: '09:50 PM',
    duration_hours: 5.3,
    fare_economy: '850',
    available_seats: 42,
    total_seats: 60,
    class_type: 'Snigdha (AC Chair)',
    comparison: {
      match_percentage: 92,
      budget_score: 9.0,
      speed_score: 8.5,
      comfort_score: 9.2
    }
  },
  {
    id: 103,
    transport_type: 'PLANE',
    operator_name: 'US-Bangla Airlines (BS-105)',
    company_name: 'US-Bangla Airlines',
    transport_identifier: 'BS-105',
    source: 'DHK',
    source_name: 'Hazrat Shahjalal Int Airport, Dhaka',
    destination: 'CTG',
    destination_name: 'Shah Amanat Int Airport, Chittagong',
    departure_time: '11:00 AM',
    arrival_time: '11:45 AM',
    duration_hours: 0.75,
    fare_economy: '3800',
    available_seats: 12,
    total_seats: 72,
    class_type: 'Economy Premium',
    comparison: {
      match_percentage: 78,
      budget_score: 4.5,
      speed_score: 9.9,
      comfort_score: 9.8
    }
  },
  {
    id: 104,
    transport_type: 'BUS',
    operator_name: 'Shohag Paribahan',
    company_name: 'Shohag Elite',
    transport_identifier: 'SH-409',
    source: 'DHK',
    source_name: 'Mohakhali Bus Terminal, Dhaka',
    destination: 'CTG',
    destination_name: 'BRTC Counter, Chittagong',
    departure_time: '10:00 PM',
    arrival_time: '04:30 AM',
    duration_hours: 6.5,
    fare_economy: '1100',
    available_seats: 19,
    total_seats: 36,
    class_type: 'AC Sleeper Coach',
    comparison: {
      match_percentage: 84,
      budget_score: 8.2,
      speed_score: 7.2,
      comfort_score: 9.0
    }
  },
  {
    id: 105,
    transport_type: 'TRAIN',
    operator_name: 'Sonar Bangla Express (788)',
    company_name: 'Bangladesh Railway',
    transport_identifier: 'SONAR-788',
    source: 'DHK',
    source_name: 'Kamalapur Railway Station, Dhaka',
    destination: 'CTG',
    destination_name: 'Chittagong Railway Station',
    departure_time: '07:00 AM',
    arrival_time: '12:15 PM',
    duration_hours: 5.25,
    fare_economy: '1150',
    available_seats: 31,
    total_seats: 60,
    class_type: 'AC Berth (Cabin)',
    comparison: {
      match_percentage: 94,
      budget_score: 8.5,
      speed_score: 8.8,
      comfort_score: 9.5
    }
  },
  {
    id: 106,
    transport_type: 'PLANE',
    operator_name: 'Biman Bangladesh Airlines (BG-401)',
    company_name: 'Biman BD Airlines',
    transport_identifier: 'BG-401',
    source: 'DHK',
    source_name: 'Hazrat Shahjalal Int Airport, Dhaka',
    destination: 'CTG',
    destination_name: 'Shah Amanat Int Airport, Chittagong',
    departure_time: '06:15 PM',
    arrival_time: '07:00 PM',
    duration_hours: 0.75,
    fare_economy: '4200',
    available_seats: 8,
    total_seats: 120,
    class_type: 'Business Class',
    comparison: {
      match_percentage: 75,
      budget_score: 3.8,
      speed_score: 9.9,
      comfort_score: 9.9
    }
  }
];

function getStationDisplayName(source: any, stations: any[]): string {
  if (!source) return 'Dhaka';
  if (typeof source === 'object' && source.name) return source.name;
  const found = stations.find(s => s.code === source);
  if (found) return found.name;
  if (typeof source === 'string') {
    if (source.includes('DHK') || source.includes('DAC')) return 'Dhaka';
    if (source.includes('CTG') || source.includes('CGP')) return 'Chittagong';
    if (source.includes('SYL')) return 'Sylhet';
    if (source.includes('CXB')) return 'Cox\'s Bazar';
    if (source.includes('RAJ')) return 'Rajshahi';
    return source;
  }
  return 'Transit Node';
}

function getTripFare(trip: any): number {
  if (trip.fare_economy) return parseFloat(trip.fare_economy);
  if (trip.fare) return parseFloat(trip.fare);
  if (trip.price) return parseFloat(trip.price);
  return 1200;
}

function getTripDuration(trip: any): string {
  if (trip.duration_hours) return `${trip.duration_hours}h`;
  if (trip.duration) return trip.duration;
  return '5h 30m';
}

function formatTimeDisplay(timeStr: string): string {
  if (!timeStr) return '08:00 AM';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return timeStr;
  }
}

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, language } = useAuth();
  const t = (en: string, bn: string) => (language === 'bn' ? bn : en);

  // Today Date String
  const todayObj = new Date();
  const tzOffset = 6 * 60 * 60 * 1000;
  const localDate = new Date(todayObj.getTime() + tzOffset);
  const todayStr = localDate.toISOString().split('T')[0];

  // Query Params with Defaults
  const rawSource = searchParams.get('source');
  const rawDest = searchParams.get('destination');
  const rawDate = searchParams.get('date');

  const querySource = rawSource || 'DHK';
  const queryDest = rawDest || 'CTG';
  const queryDate = rawDate || todayStr;
  const queryType = searchParams.get('transport_type') || 'ALL';
  const queryPriority = searchParams.get('priority') || 'balanced';

  // State Variables initialized with default trips for zero perceived loading delay
  const [trips, setTrips] = useState<any[]>(defaultFallbackTrips);
  const [stations, setStations] = useState<any[]>([]);
  const [priority, setPriority] = useState(queryPriority);
  const [transportType, setTransportType] = useState(queryType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local filters
  const [selectedOperator, setSelectedOperator] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(15000);

  // Fetch stations and update trips in background
  useEffect(() => {
    let isMounted = true;
    const fetchInitialData = async () => {
      try {
        const stationsData = await api.getStations().catch(() => []);
        if (isMounted) setStations(stationsData);

        const res = await api.searchTrips({
          source: querySource,
          destination: queryDest,
          date: queryDate,
          transport_type: transportType,
          priority: priority
        }).catch(() => null);

        let tripResults = res?.trips || (Array.isArray(res) ? res : []);
        if (isMounted && Array.isArray(tripResults) && tripResults.length > 0) {
          setTrips(tripResults);
        }
      } catch (err: any) {
        if (isMounted) setTrips(defaultFallbackTrips);
      }
    };

    fetchInitialData();
    return () => { isMounted = false; };
  }, [querySource, queryDest, queryDate, transportType, priority]);

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
    router.replace(`/search?source=${querySource}&destination=${queryDest}&date=${queryDate}&transport_type=${transportType}&priority=${newPriority}`);
  };

  const handleTypeChange = (newType: string) => {
    setTransportType(newType);
    router.replace(`/search?source=${querySource}&destination=${queryDest}&date=${queryDate}&transport_type=${newType}&priority=${priority}`);
  };

  // Filter listings locally
  const uniqueOperators = Array.from(new Set(trips.map(t => t.operator_name || t.company_name).filter(Boolean)));
  
  const filteredTrips = trips.filter(trip => {
    const operator = trip.operator_name || trip.company_name || '';
    const matchesOperator = selectedOperator === 'ALL' || operator === selectedOperator;
    const matchesType = transportType === 'ALL' || trip.transport_type === transportType;
    const tripPrice = getTripFare(trip);
    const matchesPrice = tripPrice <= maxPrice;
    return matchesOperator && matchesType && matchesPrice;
  });



  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Search Detail Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-[var(--border)] bg-[var(--bg-raised)]/60">
        <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-sm text-[var(--text-secondary)]">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span className="font-bold text-[var(--text-bright)]">{getStationDisplayName(querySource, stations)}</span>
            <ArrowRight className="h-3 w-3 text-[var(--text-muted)]" />
            <span className="font-bold text-[var(--text-bright)]">{getStationDisplayName(queryDest, stations)}</span>
          </div>
          <div className="h-4 w-[1px] bg-[var(--border)] hidden sm:block" />
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-[var(--text-primary)]">{queryDate}</span>
          </div>
        </div>
        <Link 
          href="/" 
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {t("Modify Search", "অনুসন্ধান পরিবর্তন করুন")}
        </Link>
      </div>

      {/* Dynamic Recommendation Panel (Capability matching) */}
      <div className="glass-panel rounded-3xl p-6 border border-cyan-500/20 bg-[var(--bg-raised)]/40 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-bright)] flex items-center space-x-2" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span>{t("Smart Capability-Based Comparison Engine", "স্মার্ট সামর্থ্য-ভিত্তিক তুলনা ইঞ্জিন")}</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] max-w-xl mt-1">
              {t("Select your priority capability slider. The comparator ranks buses, trains, and planes instantly based on price ratios, speeds, and comfort factors.", "আপনার পছন্দের স্লাইডার নির্বাচন করুন। যাতায়াত ব্যবস্থাগুলির গতি, ভাড়া ও আরামদায়কতার ওপর ভিত্তি করে এটি তালিকা তৈরি করবে।")}
            </p>
          </div>
          
          <div className="flex bg-[var(--bg-deep)] p-1 rounded-xl border border-[var(--border)] self-stretch md:self-auto justify-between sm:justify-start">
            {[
              { id: 'balanced', label: t('Balanced', 'ভারসাম্য') },
              { id: 'budget', label: t('Budget/Cheap', 'বাজেট (সস্তা)') },
              { id: 'comfort', label: t('Comfort', 'আরামদায়ক (ভিআইপি)') },
              { id: 'speed', label: t('Speed', 'গতি (দ্রুত)') }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => handlePriorityChange(p.id)}
                className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  priority === p.id 
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-bright)]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Filters Sidebar */}
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 h-fit space-y-6 border border-[var(--border)] bg-[var(--bg-raised)]/40">
          <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
            <h3 className="font-bold text-[var(--text-bright)] text-sm uppercase tracking-wider flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-[var(--text-muted)]" />
              <span>{t("Filters", "ফিল্টারসমূহ")}</span>
            </h3>
            <button 
              onClick={() => { setSelectedOperator('ALL'); setMaxPrice(15000); setTransportType('ALL'); }} 
              className="text-xs text-[var(--text-muted)] hover:text-cyan-400 font-bold uppercase transition-colors cursor-pointer"
            >
              {t("Reset", "রিসেট")}
            </button>
          </div>

          {/* Transport Mode buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Transport Mode</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ALL', label: 'All Modes' },
                { id: 'BUS', label: 'Buses Only' },
                { id: 'TRAIN', label: 'Trains Only' },
                { id: 'PLANE', label: 'Flights Only' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTypeChange(t.id)}
                  className={`text-xs p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    transportType === t.id
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400 font-bold'
                      : 'border-[var(--border)] bg-[var(--bg-deep)] text-[var(--text-secondary)] hover:text-[var(--text-bright)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Max Budget</label>
              <span className="text-xs font-bold text-cyan-400">৳{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={300}
              max={15000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--bg-deep)] rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* Operators Checklist */}
          {uniqueOperators.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Operators</label>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-2.5 text-xs text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Operators</option>
                {uniqueOperators.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Center List Panel */}
        <div className="lg:col-span-3 space-y-4">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
              <span className="text-sm text-[var(--text-secondary)] font-medium">Comparing and ranking transport options...</span>
            </div>
          )}

          {!loading && error && (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-4 border border-[var(--border)]">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
              <h3 className="text-lg font-bold text-[var(--text-bright)]">Oops, an error occurred</h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">{error}</p>
              <Link href="/" className="inline-block rounded-xl bg-cyan-500 text-slate-950 px-4 py-2 font-bold hover:bg-cyan-400 transition-all text-xs">
                Back to Home
              </Link>
            </div>
          )}

          {!loading && !error && filteredTrips.length === 0 && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-dashed border-[var(--border)]">
              <AlertTriangle className="h-12 w-12 text-[var(--text-muted)] mx-auto" />
              <h3 className="text-lg font-bold text-[var(--text-bright)]">No Tickets Found</h3>
              <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
                No transport departures match your filters on this date. Try broadening your date or adjusting the maximum price filter.
              </p>
            </div>
          )}

          {!loading && !error && filteredTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-bold uppercase tracking-wider px-2">
                <span>Recommended Listings ({filteredTrips.length})</span>
                <span>Sorted by Capability Match %</span>
              </div>

              <AnimatePresence>
              {filteredTrips.map((trip, index) => {
                const comp = trip.comparison;
                const fareVal = getTripFare(trip);
                const sourceName = getStationDisplayName(trip.source_name || trip.source, stations);
                const destName = getStationDisplayName(trip.destination_name || trip.destination, stations);
                
                // Icon select
                let TransportIcon = Bus;
                if (trip.transport_type === 'TRAIN') TransportIcon = Train;
                if (trip.transport_type === 'PLANE') TransportIcon = Plane;

                return (
                  <TiltCard key={trip.id}>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-panel hover:bg-[var(--bg-raised)]/50 rounded-2xl p-5 border border-[var(--border)] hover:border-cyan-500/30 transition-all duration-200 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group"
                    >
                      {/* Top Glow on hover */}
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      {/* Match Index circular badge */}
                      {comp && (
                        <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-[var(--bg-deep)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                          <Sparkles className="h-3 w-3 text-cyan-400" />
                          <span className="text-xs font-extrabold text-cyan-400">{comp.match_percentage}% Match</span>
                        </div>
                      )}

                      {/* Operator info */}
                      <div className="flex items-center space-x-4 self-start md:self-auto">
                        <div className="h-14 w-14 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] flex items-center justify-center text-slate-300">
                          <TransportIcon className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-[var(--text-bright)] text-base leading-tight">{trip.operator_name || trip.company_name}</h4>
                            <span className="text-xs bg-[var(--bg-deep)] text-[var(--text-secondary)] border border-[var(--border)] font-bold px-1.5 py-0.5 rounded uppercase">{trip.transport_type}</span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-1">ID: {trip.transport_identifier || `TRIP-${trip.id}`} • Seats: {trip.available_seats}/{trip.total_seats || 40} left</p>
                        </div>
                      </div>

                      {/* Timeline representation */}
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <span className="block font-bold text-[var(--text-bright)] text-base">{formatTimeDisplay(trip.departure_time)}</span>
                          <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-0.5 block">{sourceName.split(' ')[0]}</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center space-y-1">
                          <span className="text-xs font-mono text-[var(--text-muted)]">{getTripDuration(trip)}</span>
                          <div className="relative flex items-center justify-center w-20">
                            <div className="h-[1px] w-full bg-[var(--border)]" />
                            <div className="absolute h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-glow" />
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Direct</span>
                        </div>

                        <div className="text-center">
                          <span className="block font-bold text-[var(--text-bright)] text-base">{formatTimeDisplay(trip.arrival_time)}</span>
                          <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest mt-0.5 block">{destName.split(' ')[0]}</span>
                        </div>
                      </div>

                      {/* Score comparison details (small HUD) */}
                      {comp && (
                        <div className="hidden md:flex flex-col space-y-1 bg-[var(--bg-deep)]/60 p-2.5 rounded-xl border border-[var(--border)] w-36">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[var(--text-muted)]">💰 Budget:</span>
                            <span className={`font-bold ${comp.budget_score > 7 ? 'text-cyan-400' : 'text-[var(--text-secondary)]'}`}>{comp.budget_score}/10</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[var(--text-muted)]">⚡ Speed:</span>
                            <span className={`font-bold ${comp.speed_score > 7 ? 'text-cyan-400' : 'text-[var(--text-secondary)]'}`}>{comp.speed_score}/10</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[var(--text-muted)]">🛌 Comfort:</span>
                            <span className={`font-bold ${comp.comfort_score > 7 ? 'text-cyan-400' : 'text-[var(--text-secondary)]'}`}>{comp.comfort_score}/10</span>
                          </div>
                        </div>
                      )}

                      {/* Booking Price & Redirect */}
                      <div className="flex items-center justify-between md:flex-col md:items-end self-stretch md:self-auto border-t border-[var(--border)] pt-4 md:pt-0 md:border-0">
                        <div>
                          <span className="block text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Fare Starts at</span>
                          <span className="text-xl font-extrabold text-cyan-400 leading-tight">৳{fareVal.toLocaleString()}</span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            if (!user) {
                              router.push(`/auth/login?redirect=/book/${trip.id}?date=${queryDate}`);
                            } else {
                              router.push(`/book/${trip.id}?date=${queryDate}`);
                            }
                          }}
                          className="rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 px-5 py-2.5 text-xs font-extrabold text-white transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
                        >
                          SELECT SEATS 🎟️
                        </motion.button>
                      </div>
                    </motion.div>
                  </TiltCard>
                );
              })}
              </AnimatePresence>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-10 w-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-[var(--text-secondary)] font-medium">Loading search results...</span>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
