'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Bus, Train, Plane, Search, Sparkles, SlidersHorizontal, 
  MapPin, Calendar, Clock, AlertTriangle, ArrowRight, CheckCircle2, Lock 
} from 'lucide-react';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, language } = useAuth();
  const t = (en: string, bn: string) => (language === 'bn' ? bn : en);

  // Query Params
  const querySource = searchParams.get('source') || '';
  const queryDest = searchParams.get('destination') || '';
  const queryDate = searchParams.get('date') || '';
  const queryType = searchParams.get('transport_type') || 'ALL';
  const queryPriority = searchParams.get('priority') || 'balanced';

  // State Variables
  const [trips, setTrips] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [priority, setPriority] = useState(queryPriority);
  const [transportType, setTransportType] = useState(queryType);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Local filters
  const [selectedOperator, setSelectedOperator] = useState<string>('ALL');
  const [maxPrice, setMaxPrice] = useState<number>(15000);

  // Fetch stations and search trips
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch Stations for names map
        const stationsData = await api.getStations();
        setStations(stationsData);

        // Fetch Trips
        if (querySource && queryDest && queryDate) {
          // Validate Date Limits
          const today = new Date();
          const tzOffset = 6 * 60 * 60 * 1000;
          const localDate = new Date(today.getTime() + tzOffset);
          const todayStr = localDate.toISOString().split('T')[0];

          if (queryDate < todayStr) {
            setError('Selected date has already passed. Please select a current or future date.');
            setLoading(false);
            return;
          }

          const maxDaysAllowed = transportType === 'BUS' ? 20 : (transportType === 'TRAIN' ? 10 : 60);
          const maxAllowedDate = new Date(localDate);
          maxAllowedDate.setDate(maxAllowedDate.getDate() + maxDaysAllowed);
          const maxAllowedStr = maxAllowedDate.toISOString().split('T')[0];

          if (queryDate > maxAllowedStr) {
            setError(`Invalid journey date: ${queryDate}. For ${transportType === 'ALL' ? 'all' : transportType.toLowerCase()} journeys, tickets can only be booked up to ${maxDaysAllowed} days in advance (Max date allowed: ${maxAllowedStr}).`);
            setLoading(false);
            return;
          }

          const res = await api.searchTrips({
            source: querySource,
            destination: queryDest,
            date: queryDate,
            transport_type: transportType,
            priority: priority
          });
          setTrips(res.trips);
        } else {
          setError('Missing search parameters. Please return to Home page.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [querySource, queryDest, queryDate, transportType, priority]);

  const handlePriorityChange = (newPriority: string) => {
    setPriority(newPriority);
    // Push updated priority to query
    router.replace(`/search?source=${querySource}&destination=${queryDest}&date=${queryDate}&transport_type=${transportType}&priority=${newPriority}`);
  };

  const handleTypeChange = (newType: string) => {
    setTransportType(newType);
    router.replace(`/search?source=${querySource}&destination=${queryDest}&date=${queryDate}&transport_type=${newType}&priority=${priority}`);
  };

  // Helper to get friendly names
  const getStationName = (code: string) => {
    const s = stations.find(item => item.code === code);
    return s ? s.name : code;
  };

  // Filter listings locally
  const uniqueOperators = Array.from(new Set(trips.map(t => t.operator_name)));
  
  const filteredTrips = trips.filter(trip => {
    const matchesOperator = selectedOperator === 'ALL' || trip.operator_name === selectedOperator;
    const matchesPrice = parseFloat(trip.fare_economy) <= maxPrice;
    return matchesOperator && matchesPrice;
  });

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-medium">{t("Verifying travel credentials...", "ভ্রমণ বিবরণী যাচাই করা হচ্ছে...")}</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Search Detail Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-sm text-slate-300">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-white">{getStationName(querySource)}</span>
            <ArrowRight className="h-3 w-3 text-slate-500" />
            <span className="font-bold text-white">{getStationName(queryDest)}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold">{queryDate}</span>
          </div>
        </div>
        <Link 
          href="/" 
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {t("Modify Search", "অনুসন্ধান পরিবর্তন করুন")}
        </Link>
      </div>

      {!user ? (
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto border border-emerald-500/10 shadow-2xl flex flex-col items-center justify-center my-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500" />
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg animate-pulse">
            <Lock className="h-8 w-8 text-emerald-400" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">{t("Unlock Live Transport Routes", "লাইভ যাতায়াত রুটগুলি আনলক করুন")}</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {t("Due to seat reservation policies and anti-scalping measures, you must be logged in with a verified NID & SIM account to view routes, timetables, prices, and capability comparisons.", "টিকিট কালোবাজারি প্রতিরোধে এবং আসন সংরক্ষণ নীতিমালার কারণে, সময়সূচী, ভাড়া এবং বুকিং করার পূর্বে অবশ্যই জাতীয় পরিচয়পত্র ও মোবাইল সিম দিয়ে লগইন করতে হবে।")}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm pt-4">
            <Link
              href={`/auth/login?redirect=/search?source=${querySource}&destination=${queryDest}&date=${queryDate}&transport_type=${transportType}&priority=${priority}`}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3.5 font-bold text-slate-950 text-center transition-all hover:scale-[1.01] shadow-lg shadow-emerald-500/10"
            >
              {t("Log In", "লগইন করুন")}
            </Link>
            <Link
              href="/auth/register"
              className="flex-1 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-850 py-3.5 font-bold text-slate-350 text-center transition-all"
            >
              {t("Sign Up", "নিবন্ধন করুন")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Dynamic Recommendation Panel (Capability matching) */}
      <div className="glass-panel rounded-3xl p-6 border-emerald-500/20 bg-emerald-950/10 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span>{t("Smart Capability-Based Comparison Engine", "স্মার্ট সামর্থ্য-ভিত্তিক তুলনা ইঞ্জিন")}</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-xl mt-1">
              {t("Select your priority capability slider. The comparator ranks buses, trains, and planes instantly based on price ratios, speeds, and comfort factors.", "আপনার পছন্দের স্লাইডার নির্বাচন করুন। যাতায়াত ব্যবস্থাগুলির গতি, ভাড়া ও আরামদায়কতার ওপর ভিত্তি করে এটি তালিকা তৈরি করবে।")}
            </p>
          </div>
          
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-850 self-stretch md:self-auto justify-between sm:justify-start">
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
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
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
        <div className="lg:col-span-1 glass-panel rounded-2xl p-6 h-fit space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center space-x-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-450" />
              <span>{t("Filters", "ফিল্টারসমূহ")}</span>
            </h3>
            <button 
              onClick={() => { setSelectedOperator('ALL'); setMaxPrice(15000); }} 
              className="text-[10px] text-slate-500 hover:text-emerald-400 font-bold uppercase transition-colors cursor-pointer"
            >
              {t("Reset", "রিসেট")}
            </button>
          </div>

          {/* Transport Mode buttons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transport Mode</label>
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
                      ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400 font-bold'
                      : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:text-slate-200'
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Budget</label>
              <span className="text-xs font-bold text-emerald-400">৳{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={300}
              max={15000}
              step={100}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Operators Checklist */}
          {uniqueOperators.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operators</label>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
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
              <RefreshCwIcon className="h-10 w-10 text-emerald-500 animate-spin" />
              <span className="text-sm text-slate-400 font-medium">Comparing and ranking transport options...</span>
            </div>
          )}

          {!loading && error && (
            <div className="glass-panel rounded-2xl p-8 text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-red-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Oops, an error occurred</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">{error}</p>
              <Link href="/" className="inline-block rounded-xl bg-emerald-500 text-slate-950 px-4 py-2 font-bold hover:bg-emerald-400 transition-all text-xs">
                Back to Home
              </Link>
            </div>
          )}

          {!loading && !error && filteredTrips.length === 0 && (
            <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-dashed border-slate-800">
              <AlertTriangle className="h-12 w-12 text-slate-500 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Tickets Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No transport departures match your filters on this date. Try broadening your date or adjusting the maximum price filter.
              </p>
            </div>
          )}

          {!loading && !error && filteredTrips.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-wider px-2">
                <span>Recommended Listings ({filteredTrips.length})</span>
                <span>Sorted by Match %</span>
              </div>

              {filteredTrips.map((trip) => {
                const comp = trip.comparison;
                const matchesMinPrice = parseFloat(trip.fare_economy);
                
                // Icon select
                let TransportIcon = Bus;
                if (trip.transport_type === 'TRAIN') TransportIcon = Train;
                if (trip.transport_type === 'PLANE') TransportIcon = Plane;

                return (
                  <div 
                    key={trip.id} 
                    className="glass-panel hover:bg-slate-900/30 rounded-2xl p-5 border border-slate-900 hover:border-emerald-500/20 transition-all duration-200 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group"
                  >
                    {/* Top Glow on hover */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    {/* Match Index circular badge */}
                    {comp && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-slate-950 border border-slate-850 px-2.5 py-1 rounded-full">
                        <Sparkles className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] font-extrabold text-emerald-400">{comp.match_percentage}% Match</span>
                      </div>
                    )}

                    {/* Operator info */}
                    <div className="flex items-center space-x-4 self-start md:self-auto">
                      <div className="h-14 w-14 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-300">
                        <TransportIcon className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-base leading-tight">{trip.operator_name}</h4>
                          <span className="text-[10px] bg-slate-800 text-slate-400 font-bold px-1.5 py-0.5 rounded uppercase">{trip.transport_type}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">ID: {trip.transport_identifier} • Seats: {trip.available_seats}/{trip.total_seats} left</p>
                      </div>
                    </div>

                    {/* Timeline representation */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <span className="block font-bold text-white text-base">{formatTime(trip.departure_time)}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 block">{trip.source.name.split(' ')[0]}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <span className="text-[10px] font-mono text-slate-500">{trip.duration_hours}h</span>
                        <div className="relative flex items-center justify-center w-20">
                          <div className="h-[1px] w-full bg-slate-800" />
                          <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-glow" />
                        </div>
                        <span className="text-[9px] text-slate-600 font-bold uppercase">Direct</span>
                      </div>

                      <div className="text-center">
                        <span className="block font-bold text-white text-base">{formatTime(trip.arrival_time)}</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5 block">{trip.destination.name.split(' ')[0]}</span>
                      </div>
                    </div>

                    {/* Score comparison details (small HUD) */}
                    {comp && (
                      <div className="hidden md:flex flex-col space-y-1 bg-slate-900/30 p-2.5 rounded-xl border border-slate-900/80 w-36">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">💰 Budget:</span>
                          <span className={`font-bold ${comp.budget_score > 7 ? 'text-emerald-400' : 'text-slate-350'}`}>{comp.budget_score}/10</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">⚡ Speed:</span>
                          <span className={`font-bold ${comp.speed_score > 7 ? 'text-emerald-400' : 'text-slate-350'}`}>{comp.speed_score}/10</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">🛌 Comfort:</span>
                          <span className={`font-bold ${comp.comfort_score > 7 ? 'text-emerald-400' : 'text-slate-350'}`}>{comp.comfort_score}/10</span>
                        </div>
                      </div>
                    )}

                    {/* Booking Price & Redirect */}
                    <div className="flex items-center justify-between md:flex-col md:items-end self-stretch md:self-auto border-t border-slate-900 pt-4 md:pt-0 md:border-0">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Fare Starts at</span>
                        <span className="text-xl font-extrabold text-emerald-400 leading-tight">৳{parseFloat(trip.fare_economy).toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => router.push(`/book/${trip.id}?date=${queryDate}`)}
                        className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-5 py-2.5 text-xs font-bold text-slate-950 transition-all hover:scale-[1.03] shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
      </>
      )}
    </div>
  );
}

// Utility: format datetime to HH:MM AM/PM
function formatTime(dtStr: string) {
  try {
    const d = new Date(dtStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return dtStr;
  }
}

// RefreshCwIcon component helper
function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-medium">Loading search results...</span>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}
