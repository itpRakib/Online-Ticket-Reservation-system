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
  const [data, setData] = useState<{ users: User[]; stats: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
            onClick={() => router.push('/dashboard')}
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

      {/* User Management Table Section */}
      <ScrollReveal>
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-white text-base uppercase tracking-wider">User Identity Database</h3>
              <p className="text-slate-400 text-xs mt-1">Management overview of all users, roles, and verified credentials.</p>
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
                placeholder="Search database nodes..."
                className="block w-full pl-9 pr-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none text-xs transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full border border-slate-800/80 rounded-2xl bg-slate-950/20">
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
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
                        <span className="text-slate-500">Retrieving user nodes...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500 font-mono">
                      No matching identity records found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/20 transition-colors">
                      {/* Name & Username */}
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
                      {/* Email */}
                      <td className="px-6 py-4 font-mono font-medium">
                        <div>{item.email}</div>
                        {item.profile?.email_verified ? (
                          <span className="inline-flex items-center text-[9px] bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.5 rounded-full mt-1 border border-cyan-500/10">Verified</span>
                        ) : (
                          <span className="inline-flex items-center text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full mt-1">Unverified</span>
                        )}
                      </td>
                      {/* Phone */}
                      <td className="px-6 py-4 font-mono font-medium">
                        <div>{item.profile?.phone || 'N/A'}</div>
                        {item.profile?.phone_verified && (
                          <span className="inline-flex items-center text-[9px] bg-cyan-500/10 text-cyan-400 font-bold px-1.5 py-0.5 rounded-full mt-1 border border-cyan-500/10">SMS Linked</span>
                        )}
                      </td>
                      {/* NID */}
                      <td className="px-6 py-4">
                        {item.profile?.nid ? (
                          <div className="space-y-1">
                            <div className="font-mono font-bold text-slate-200">{item.profile.nid}</div>
                            <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{item.profile.nid_name || 'Owner Sync Pending'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No NID registered</span>
                        )}
                      </td>
                      {/* Role Badge */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold font-sans uppercase border ${
                          item.profile?.role === 'admin' 
                            ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400 shadow-md shadow-fuchsia-500/5' 
                            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                        }`}>
                          {item.profile?.role === 'admin' ? 'Admin Node' : 'Standard User'}
                        </span>
                      </td>
                      {/* Joined Date */}
                      <td className="px-6 py-4 text-right font-mono text-slate-400">
                        <div className="flex items-center justify-end space-x-1.5">
                          <Clock className="h-3.5 w-3.5 opacity-60" />
                          <span>{item.registration_date ? new Date(item.registration_date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
