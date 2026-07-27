'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, User } from '@/utils/api';
import { 
  Users, Ticket, MapPin, Database, 
  Search, RefreshCw, AlertCircle, Check, Clock, ShieldAlert, ArrowLeft, KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/ScrollReveal';
import { GlowCard } from '@/components/GlowCard';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // State
  const [data, setData] = useState<{ 
    users: User[]; 
    bookings: any[]; 
    payments: any[]; 
    searches: any[]; 
    stats: any 
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'payments' | 'searches'>('users');

  // Fetch admin database data
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAdminUsers();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve administrative records.');
    } finally {
      setData((prev: any) => {
        if (!prev) return null;
        return {
          ...prev,
          bookings: prev.bookings || [],
          payments: prev.payments || [],
          searches: prev.searches || [],
        };
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not admin
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/admin/dashboard');
      } else if (user.profile?.role !== 'admin' && !user.username.toLowerCase().includes('admin')) {
        // Redirect standard users to standard dashboard
        router.push('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
        <span className="text-slate-400 font-medium">Authenticating credentials...</span>
      </div>
    );
  }

  // Ensure strict role-based access before rendering any database UI
  const isAdmin = user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin'));
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-5">
        <ShieldAlert className="h-14 w-14 text-red-500 mx-auto animate-pulse" />
        <h2 className="text-2xl font-bold text-white font-sans tracking-tight">403 FORBIDDEN ACCESS</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Server-side protection blocks this identity node. Your credentials do not possess the required `admin` authority level.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button 
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 font-bold transition-all text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Standard Profile</span>
          </button>
          <button 
            onClick={logout}
            className="inline-flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 px-5 py-2.5 font-bold transition-all text-xs"
          >
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter users list based on search query
  const filteredUsers = data?.users.filter(u => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name || '').toLowerCase().includes(q) ||
      (u.profile?.phone || '').includes(q) ||
      (u.profile?.nid || '').includes(q)
    );
  }) || [];

  // Filter bookings list
  const filteredBookings = data?.bookings?.filter(b => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.pnr_number.toLowerCase().includes(q) ||
      (b.user?.username || '').toLowerCase().includes(q) ||
      (b.trip?.source?.name || '').toLowerCase().includes(q) ||
      (b.trip?.destination?.name || '').toLowerCase().includes(q) ||
      (b.status || '').toLowerCase().includes(q)
    );
  }) || [];

  // Filter payments list
  const filteredPayments = data?.payments?.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.trx_id || '').toLowerCase().includes(q) ||
      (p.payment_method || '').toLowerCase().includes(q) ||
      (p.status || '').toLowerCase().includes(q)
    );
  }) || [];

  // Filter searches list
  const filteredSearches = data?.searches?.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.user_username || '').toLowerCase().includes(q) ||
      (s.source_name || '').toLowerCase().includes(q) ||
      (s.destination_name || '').toLowerCase().includes(q) ||
      (s.transport_type || '').toLowerCase().includes(q)
    );
  }) || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            <Database className="h-8 w-8 text-cyan-400" />
            <span>Central Management Terminal</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-mono">
            SECURE ACCESS AUTHORIZED • ROLE: <span className="text-cyan-400 font-bold uppercase">{user?.profile?.role}</span> • NODE USERNAME: {user?.username}
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center space-x-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Database Registry</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Standard View</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/15 border border-red-500/30 p-5 text-sm text-red-400 flex items-center space-x-3 shadow-lg">
          <AlertCircle className="h-6 w-6 shrink-0 text-red-400" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* System Statistics Metric Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Enrolled Users', value: data?.stats.total_users ?? 0, icon: Users, color: 'cyan' as const },
            { label: 'Total Node Bookings', value: data?.stats.total_bookings ?? 0, icon: Ticket, color: 'purple' as const },
            { label: 'Total Transit Trips', value: data?.stats.total_trips ?? 0, icon: KeyRound, color: 'emerald' as const },
            { label: 'Configured Stations', value: data?.stats.total_stations ?? 0, icon: MapPin, color: 'amber' as const },
            { label: 'Synchronized Payments', value: data?.stats.total_payments ?? 0, icon: Database, color: 'indigo' as const }
          ].map((stat, idx) => (
            <GlowCard key={idx} glowColor={stat.color} intensity="low">
              <div className="glass-panel p-5 rounded-2xl border border-white/[0.03] space-y-4 flex flex-col justify-between h-full bg-[var(--bg-raised)]/30">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans leading-tight">{stat.label}</span>
                  <stat.icon className={`h-5 w-5 text-cyan-400 shrink-0 opacity-70`} />
                </div>
                <div className="space-y-1">
                  <span className="block text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                    {loading ? (
                      <span className="block h-8 w-12 bg-slate-800 rounded animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </span>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </ScrollReveal>

      {/* Dynamic Tabs Selector */}
      <div className="flex border-b border-slate-800 space-x-6">
        {[
          { id: 'users', label: 'Users Identity', count: data?.users.length ?? 0 },
          { id: 'bookings', label: 'Ticket Bookings', count: data?.bookings?.length ?? 0 },
          { id: 'payments', label: 'Payments History', count: data?.payments?.length ?? 0 },
          { id: 'searches', label: 'User Search Logs', count: data?.searches?.length ?? 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative border-b-2 cursor-pointer ${
              activeTab === tab.id 
                ? 'border-cyan-400 text-cyan-400 font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-2 rounded-md bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Database Management View Area */}
      <ScrollReveal>
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base uppercase tracking-wider">
                {activeTab === 'users' && 'User Identity Database'}
                {activeTab === 'bookings' && 'Booking Telemetry Logs'}
                {activeTab === 'payments' && 'Payment Sync History'}
                {activeTab === 'searches' && 'Live Search Log Database'}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                {activeTab === 'users' && 'Management overview of all users, roles, and verified credentials.'}
                {activeTab === 'bookings' && 'Global registry of ticket reservations, passenger seat lists, and fares.'}
                {activeTab === 'payments' && 'Financial ledger mapping mobile wallets, transactional ids, and success statuses.'}
                {activeTab === 'searches' && 'Audit log tracking source/destination parameters searched by passengers.'}
              </p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="block w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full border border-slate-800/80 rounded-2xl bg-slate-950/20">
            {activeTab === 'users' && (
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">Identity Details</th>
                    <th scope="col" className="px-6 py-4">Gmail Address</th>
                    <th scope="col" className="px-6 py-4">SIM Mobile</th>
                    <th scope="col" className="px-6 py-4">NID Reference</th>
                    <th scope="col" className="px-6 py-4 text-center">Security Role</th>
                    <th scope="col" className="px-6 py-4 text-right">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-transparent">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 font-mono">No matching records.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-slate-950 font-black text-xs uppercase shadow">
                              {item.username.substring(0, 2)}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{item.first_name} {item.last_name}</div>
                              <div className="text-slate-500 font-mono text-[10px]">@{item.username} (ID: #{item.id})</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">
                          <div>{item.email}</div>
                          {item.profile?.email_verified ? (
                            <span className="inline-flex items-center text-[9px] bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.5 rounded-full mt-1 border border-cyan-500/10">Verified</span>
                          ) : (
                            <span className="inline-flex items-center text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full mt-1">Unverified</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-medium">{item.profile?.phone || 'N/A'}</td>
                        <td className="px-6 py-4 font-mono">{item.profile?.nid || 'N/A'}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold font-sans uppercase border ${
                            item.profile?.role === 'admin' ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                          }`}>
                            {item.profile?.role === 'admin' ? 'Admin' : 'Passenger'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono">{item.registration_date ? new Date(item.registration_date).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'bookings' && (
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">PNR / User</th>
                    <th scope="col" className="px-6 py-4">Transit Details</th>
                    <th scope="col" className="px-6 py-4">Seats / Class</th>
                    <th scope="col" className="px-6 py-4">Passenger Group</th>
                    <th scope="col" className="px-6 py-4">Fare (BDT)</th>
                    <th scope="col" className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-transparent">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 font-mono">No matching records.</td>
                    </tr>
                  ) : (
                    filteredBookings.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-white">{item.pnr_number}</div>
                          <div className="text-slate-500 text-[10px] font-mono">@{item.user?.username || 'Guest'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{item.trip?.source?.name} ➔ {item.trip?.destination?.name}</div>
                          <div className="text-slate-500 font-mono text-[10px]">Travel Date: {item.travel_date}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-slate-200">
                            {item.passengers?.map((p: any) => p.seat_number).join(', ') || 'N/A'}
                          </div>
                          <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider mt-0.5">{item.trip?.transport_type || 'BUS'}</div>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          {item.passengers?.map((p: any) => (
                            <div key={p.id} className="text-slate-300 font-medium">
                              • {p.name} ({p.gender[0]}, Age {p.age})
                              {p.nid && <span className="text-[10px] text-slate-500 block pl-3 font-mono">NID: {p.nid}</span>}
                            </div>
                          )) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-mono font-black text-slate-200">
                          ৳ {parseFloat(item.total_fare).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                            item.status === 'PAID' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            item.status === 'CANCELLED' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'payments' && (
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">Transaction / PNR</th>
                    <th scope="col" className="px-6 py-4">User Identity</th>
                    <th scope="col" className="px-6 py-4">Gateway Method</th>
                    <th scope="col" className="px-6 py-4">Payment Amount</th>
                    <th scope="col" className="px-6 py-4 text-center">Gateway Status</th>
                    <th scope="col" className="px-6 py-4 text-right">Synchronization Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-transparent">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 font-mono">No matching records.</td>
                    </tr>
                  ) : (
                    filteredPayments.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 font-mono">
                          <div className="font-bold text-white">{item.trx_id}</div>
                          <div className="text-slate-500 text-[10px]">Booking ID: #{item.booking}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">Ref Passenger</div>
                          <div className="text-slate-500 font-mono text-[10px]">Payment Sync Node</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-cyan-400 uppercase tracking-widest text-[10px]">{item.payment_method}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-black text-slate-200">
                          ৳ {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                            item.status === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-400">
                          {new Date(item.payment_date).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'searches' && (
              <table className="min-w-full divide-y divide-slate-800 text-left text-xs text-slate-300">
                <thead className="bg-slate-900/50 font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th scope="col" className="px-6 py-4">User Node</th>
                    <th scope="col" className="px-6 py-4">Source Station</th>
                    <th scope="col" className="px-6 py-4">Destination Station</th>
                    <th scope="col" className="px-6 py-4 font-mono">Travel Date Requested</th>
                    <th scope="col" className="px-6 py-4">Transit Mode</th>
                    <th scope="col" className="px-6 py-4 text-right">Search Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-transparent">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredSearches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-500 font-mono">No matching records.</td>
                    </tr>
                  ) : (
                    filteredSearches.map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold">
                          {item.user_username === 'Anonymous' ? (
                            <span className="text-slate-500 italic">Guest User</span>
                          ) : (
                            <span className="text-cyan-400">@{item.user_username}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{item.source_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">{item.destination_name}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300">{item.travel_date}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-xs uppercase tracking-wider text-purple-400">{item.transport_type}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-400">
                          {new Date(item.search_time).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
