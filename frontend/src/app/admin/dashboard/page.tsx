'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, User } from '@/utils/api';
import { 
  Users, Ticket, MapPin, Database, 
  Search, RefreshCw, AlertCircle, Check, Clock, ShieldAlert, ArrowLeft, KeyRound, Edit3, X, DollarSign
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

  // Payment Management Modal State
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('SUCCESS');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

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
    if (!authLoading) {
      if (!user) {
        router.push('/auth/login?redirect=/admin/dashboard');
      } else if (user.profile?.role !== 'admin' && !user.username.toLowerCase().includes('admin')) {
        router.push('/dashboard');
      } else {
        fetchData();
      }
    }
  }, [user, authLoading]);

  const handleOpenPaymentModal = (payment: any) => {
    setSelectedPayment(payment);
    setNewPaymentStatus(payment.status || 'SUCCESS');
    setAdminNotes(payment.admin_notes || '');
    setUpdateMessage('');
    setPaymentModalOpen(true);
  };

  const handleSavePaymentStatus = async () => {
    if (!selectedPayment) return;
    setUpdatingPayment(true);
    setUpdateMessage('');
    try {
      const res = await api.updateAdminPayment(selectedPayment.id, {
        status: newPaymentStatus,
        admin_notes: adminNotes
      });
      setUpdateMessage(res.message || 'Payment updated successfully!');
      
      // Update local state immediately
      setData((prev: any) => {
        if (!prev) return null;
        const updatedPayments = prev.payments.map((p: any) => 
          p.id === selectedPayment.id ? { ...p, status: newPaymentStatus, admin_notes: adminNotes } : p
        );
        return { ...prev, payments: updatedPayments };
      });

      setTimeout(() => {
        setPaymentModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setUpdateMessage('Failed to update payment: ' + (err.message || 'Error occurred'));
    } finally {
      setUpdatingPayment(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <RefreshCw className="h-10 w-10 text-[#C5D050] animate-spin" />
        <span className="text-[#444E29] font-medium">Authenticating credentials...</span>
      </div>
    );
  }

  const isAdmin = user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin'));
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center space-y-5">
        <ShieldAlert className="h-14 w-14 text-red-500 mx-auto animate-pulse" />
        <h2 className="text-2xl font-bold text-[#2A5B60] font-sans tracking-tight">403 FORBIDDEN ACCESS</h2>
        <p className="text-[#444E29]/80 text-sm leading-relaxed">
          Server-side protection blocks this identity node. Your credentials do not possess the required `admin` authority level.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button 
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center space-x-2 rounded-xl text-white px-5 py-2.5 font-bold transition-all text-xs"
            style={{ backgroundColor: '#2A5B60' }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go to Standard Profile</span>
          </button>
          <button 
            onClick={logout}
            className="inline-flex items-center space-x-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-600 px-5 py-2.5 font-bold transition-all text-xs"
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
          <h1 className="text-3xl font-extrabold text-[#2A5B60] tracking-tight flex items-center gap-2.5" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            <Database className="h-8 w-8 text-[#6F9526]" />
            <span>Central Management Terminal</span>
          </h1>
          <p className="text-[#444E29] text-xs mt-1.5 font-mono">
            SECURE ACCESS AUTHORIZED • ROLE: <span className="text-[#6F9526] font-bold uppercase">{user?.profile?.role}</span> • NODE USERNAME: {user?.username}
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center space-x-2 rounded-xl border border-[#2A5B60]/30 bg-white px-4 py-2.5 text-xs font-bold text-[#444E29] hover:bg-[#F3F3F3] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Database Registry</span>
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 rounded-xl text-white px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md"
            style={{ backgroundColor: '#2A5B60' }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Standard View</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/15 border border-red-500/30 p-5 text-sm text-red-600 flex items-center space-x-3 shadow-lg">
          <AlertCircle className="h-6 w-6 shrink-0 text-red-500" />
          <span className="font-bold">{error}</span>
        </div>
      )}

      {/* System Statistics Metric Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Enrolled Users', value: data?.stats.total_users ?? 0, icon: Users },
            { label: 'Total Node Bookings', value: data?.stats.total_bookings ?? 0, icon: Ticket },
            { label: 'Total Transit Trips', value: data?.stats.total_trips ?? 0, icon: KeyRound },
            { label: 'Configured Stations', value: data?.stats.total_stations ?? 0, icon: MapPin },
            { label: 'Synchronized Payments', value: data?.stats.total_payments ?? 0, icon: Database }
          ].map((stat, idx) => (
            <div key={idx} className="p-5 rounded-2xl border border-[#2A5B60]/20 space-y-4 flex flex-col justify-between h-full bg-white shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#444E29]/70 font-bold uppercase tracking-wider font-sans leading-tight">{stat.label}</span>
                <stat.icon className="h-5 w-5 text-[#6F9526] shrink-0" />
              </div>
              <div className="space-y-1">
                <span className="block text-2xl sm:text-3xl font-black text-[#2A5B60] font-mono leading-none">
                  {loading ? (
                    <span className="block h-8 w-12 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    stat.value
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>

      {/* Dynamic Tabs Selector */}
      <div className="flex border-b border-[#2A5B60]/20 space-x-6 overflow-x-auto">
        {[
          { id: 'users', label: 'User Identity & Analytics', count: data?.users.length ?? 0 },
          { id: 'bookings', label: 'Ticket Bookings', count: data?.bookings?.length ?? 0 },
          { id: 'payments', label: 'Payments & Transactions', count: data?.payments?.length ?? 0 },
          { id: 'searches', label: 'User Search Logs', count: data?.searches?.length ?? 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSearchQuery(''); }}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative border-b-2 cursor-pointer shrink-0 ${
              activeTab === tab.id 
                ? 'border-[#6F9526] text-[#2A5B60] font-extrabold' 
                : 'border-transparent text-[#444E29]/60 hover:text-[#444E29]'
            }`}
          >
            <span>{tab.label}</span>
            <span className="ml-2 rounded-md bg-[#F3F3F3] border border-[#2A5B60]/20 px-1.5 py-0.5 text-[10px] text-[#444E29] font-mono">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Database Management View Area */}
      <ScrollReveal>
        <div className="rounded-3xl p-6 sm:p-8 space-y-6 bg-white border border-[#2A5B60]/20 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-bold text-[#2A5B60] text-base uppercase tracking-wider">
                {activeTab === 'users' && 'User Identity & Activity Analytics'}
                {activeTab === 'bookings' && 'Booking Telemetry Logs'}
                {activeTab === 'payments' && 'Payment Sync & Timeline Management'}
                {activeTab === 'searches' && 'Live Search Log Database'}
              </h3>
              <p className="text-[#444E29]/80 text-xs mt-1">
                {activeTab === 'users' && 'Track user activity timestamps, login logs, and onboarding duration metrics.'}
                {activeTab === 'bookings' && 'Global registry of ticket reservations, passenger seat lists, and fares.'}
                {activeTab === 'payments' && 'Manage payment statuses (Cancel, Refund, Modify), schedules, and audit notes.'}
                {activeTab === 'searches' && 'Audit log tracking source/destination parameters searched by passengers.'}
              </p>
            </div>
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#444E29]/50">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="block w-full pl-9 pr-4 py-2 rounded-xl border border-[#2A5B60]/20 bg-[#F3F3F3] text-[#444E29] placeholder-[#444E29]/50 focus:border-[#2A5B60] focus:outline-none text-xs transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full border border-[#2A5B60]/20 rounded-2xl bg-[#F3F3F3]/50">
            {/* USERS TAB */}
            {activeTab === 'users' && (
              <table className="min-w-full divide-y divide-[#2A5B60]/15 text-left text-xs text-[#444E29]">
                <thead className="bg-[#2A5B60] font-bold uppercase tracking-wider text-[#F3F3F3]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Identity Details</th>
                    <th scope="col" className="px-6 py-4">Gmail Address</th>
                    <th scope="col" className="px-6 py-4">SIM Mobile</th>
                    <th scope="col" className="px-6 py-4">Security Role</th>
                    <th scope="col" className="px-6 py-4">Activity (Last Login)</th>
                    <th scope="col" className="px-6 py-4">Onboarding Duration</th>
                    <th scope="col" className="px-6 py-4 text-right">Registration Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A5B60]/10 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12">
                        <RefreshCw className="h-6 w-6 text-[#6F9526] animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#444E29]/60 font-mono">No matching records.</td>
                    </tr>
                  ) : (
                    filteredUsers.map((item) => {
                      const onboardingSec = item.profile?.onboarding_duration_seconds || 0;
                      const onboardingDisplay = onboardingSec > 0 
                        ? `${Math.floor(onboardingSec / 60)}m ${onboardingSec % 60}s` 
                        : 'N/A';
                      
                      const lastLoginDisplay = item.profile?.last_login_at 
                        ? new Date(item.profile.last_login_at).toLocaleString()
                        : 'Never logged in';

                      return (
                        <tr key={item.id} className="hover:bg-[#F3F3F3] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-xs uppercase shadow" style={{ backgroundColor: '#2A5B60' }}>
                                {item.username.substring(0, 2)}
                              </div>
                              <div>
                                <div className="font-bold text-[#2A5B60] text-sm">{item.first_name} {item.last_name}</div>
                                <div className="text-[#444E29]/60 font-mono text-[10px]">@{item.username} (ID: #{item.id})</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-medium">
                            <div>{item.email}</div>
                            {item.profile?.email_verified ? (
                              <span className="inline-flex items-center text-[9px] bg-[#6F9526]/15 text-[#6F9526] font-bold px-1.5 py-0.5 rounded-full mt-1 border border-[#6F9526]/30">Verified</span>
                            ) : (
                              <span className="inline-flex items-center text-[9px] bg-slate-200 text-[#444E29] px-1.5 py-0.5 rounded-full mt-1">Unverified</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono font-medium">{item.profile?.phone || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold font-sans uppercase border ${
                              item.profile?.role === 'admin' ? 'bg-[#2A5B60]/10 border-[#2A5B60]/30 text-[#2A5B60]' : 'bg-[#C5D050]/20 border-[#C5D050]/40 text-[#444E29]'
                            }`}>
                              {item.profile?.role === 'admin' ? 'Admin' : 'Passenger'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[#444E29]">
                            <div className="flex items-center space-x-1.5">
                              <Clock className="h-3.5 w-3.5 text-[#6F9526]" />
                              <span>{lastLoginDisplay}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-[#C5D050]/30 border border-[#C5D050]/60 text-[#444E29] font-bold">
                              ⏱️ {onboardingDisplay}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-[#444E29]/80">{item.registration_date ? new Date(item.registration_date).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <table className="min-w-full divide-y divide-[#2A5B60]/15 text-left text-xs text-[#444E29]">
                <thead className="bg-[#2A5B60] font-bold uppercase tracking-wider text-[#F3F3F3]">
                  <tr>
                    <th scope="col" className="px-6 py-4">PNR / User</th>
                    <th scope="col" className="px-6 py-4">Transit Details</th>
                    <th scope="col" className="px-6 py-4">Seats / Class</th>
                    <th scope="col" className="px-6 py-4">Passenger Group</th>
                    <th scope="col" className="px-6 py-4">Fare (BDT)</th>
                    <th scope="col" className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A5B60]/10 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <RefreshCw className="h-6 w-6 text-[#6F9526] animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[#444E29]/60 font-mono">No matching records.</td>
                    </tr>
                  ) : (
                    filteredBookings.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#F3F3F3] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-[#2A5B60]">{item.pnr_number}</div>
                          <div className="text-[#444E29]/60 text-[10px] font-mono">@{item.user?.username || 'Guest'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#2A5B60]">{item.trip?.source?.name} ➔ {item.trip?.destination?.name}</div>
                          <div className="text-[#444E29]/70 font-mono text-[10px]">Travel Date: {item.travel_date}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-[#444E29]">
                            {item.passengers?.map((p: any) => p.seat_number).join(', ') || 'N/A'}
                          </div>
                          <div className="text-xs text-[#6F9526] font-bold uppercase tracking-wider mt-0.5">{item.trip?.transport_type || 'BUS'}</div>
                        </td>
                        <td className="px-6 py-4 space-y-1">
                          {item.passengers?.map((p: any) => (
                            <div key={p.id} className="text-[#444E29] font-medium">
                              • {p.name} ({p.gender[0]}, Age {p.age})
                              {p.nid && <span className="text-[10px] text-[#444E29]/60 block pl-3 font-mono">NID: {p.nid}</span>}
                            </div>
                          )) || 'N/A'}
                        </td>
                        <td className="px-6 py-4 font-mono font-black text-[#2A5B60]">
                          ৳ {parseFloat(item.total_fare).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                            item.status === 'PAID' ? 'bg-[#6F9526]/15 border-[#6F9526]/30 text-[#6F9526]' :
                            item.status === 'CANCELLED' ? 'bg-red-500/15 border-red-500/30 text-red-600' :
                            'bg-amber-500/15 border-amber-500/30 text-amber-700'
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

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <table className="min-w-full divide-y divide-[#2A5B60]/15 text-left text-xs text-[#444E29]">
                <thead className="bg-[#2A5B60] font-bold uppercase tracking-wider text-[#F3F3F3]">
                  <tr>
                    <th scope="col" className="px-6 py-4">Transaction / PNR</th>
                    <th scope="col" className="px-6 py-4">Gateway Method</th>
                    <th scope="col" className="px-6 py-4">Amount</th>
                    <th scope="col" className="px-6 py-4 text-center">Status</th>
                    <th scope="col" className="px-6 py-4">Admin Notes</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A5B60]/10 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <RefreshCw className="h-6 w-6 text-[#6F9526] animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[#444E29]/60 font-mono">No matching records.</td>
                    </tr>
                  ) : (
                    filteredPayments.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#F3F3F3] transition-colors">
                        <td className="px-6 py-4 font-mono">
                          <div className="font-bold text-[#2A5B60]">{item.trx_id}</div>
                          <div className="text-[#444E29]/60 text-[10px]">Booking ID: #{item.booking}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-[#6F9526] uppercase tracking-widest text-[10px]">{item.payment_method}</span>
                        </td>
                        <td className="px-6 py-4 font-mono font-black text-[#2A5B60]">
                          ৳ {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase border ${
                            item.status === 'SUCCESS' ? 'bg-[#6F9526]/15 border-[#6F9526]/30 text-[#6F9526]' :
                            item.status === 'REFUNDED' ? 'bg-purple-500/15 border-purple-500/30 text-purple-700' :
                            item.status === 'CANCELLED' ? 'bg-red-500/15 border-red-500/30 text-red-600' :
                            'bg-amber-500/15 border-amber-500/30 text-amber-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-[#444E29]/80 max-w-[200px] truncate">
                          {item.admin_notes || <span className="text-slate-400 italic">None</span>}
                        </td>
                        <td className="px-6 py-4 text-right font-mono">
                          <button
                            onClick={() => handleOpenPaymentModal(item)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#C5D050]/30 hover:bg-[#C5D050] text-[#444E29] font-bold transition-all border border-[#C5D050]/60 cursor-pointer text-xs"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Manage</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* SEARCHES TAB */}
            {activeTab === 'searches' && (
              <table className="min-w-full divide-y divide-[#2A5B60]/15 text-left text-xs text-[#444E29]">
                <thead className="bg-[#2A5B60] font-bold uppercase tracking-wider text-[#F3F3F3]">
                  <tr>
                    <th scope="col" className="px-6 py-4">User Node</th>
                    <th scope="col" className="px-6 py-4">Source Station</th>
                    <th scope="col" className="px-6 py-4">Destination Station</th>
                    <th scope="col" className="px-6 py-4 font-mono">Travel Date Requested</th>
                    <th scope="col" className="px-6 py-4">Transit Mode</th>
                    <th scope="col" className="px-6 py-4 text-right">Search Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A5B60]/10 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12">
                        <RefreshCw className="h-6 w-6 text-[#6F9526] animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredSearches.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-[#444E29]/60 font-mono">No matching records.</td>
                    </tr>
                  ) : (
                    filteredSearches.map((item: any) => (
                      <tr key={item.id} className="hover:bg-[#F3F3F3] transition-colors">
                        <td className="px-6 py-4 font-mono font-bold">
                          {item.user_username === 'Anonymous' ? (
                            <span className="text-[#444E29]/50 italic">Guest User</span>
                          ) : (
                            <span className="text-[#2A5B60]">@{item.user_username}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#2A5B60]">{item.source_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-[#2A5B60]">{item.destination_name}</div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[#444E29]">{item.travel_date}</td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-xs uppercase tracking-wider text-[#6F9526]">{item.transport_type}</span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-[#444E29]/80">
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

      {/* PAYMENT MANAGEMENT MODAL */}
      <AnimatePresence>
        {paymentModalOpen && selectedPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#2A5B60]/30 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#2A5B60]/15 pb-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-6 w-6 text-[#6F9526]" />
                  <h3 className="text-base font-extrabold text-[#2A5B60]">Payment Control Terminal</h3>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="p-1 rounded-lg text-[#444E29]/60 hover:text-[#444E29] hover:bg-[#F3F3F3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#444E29]">
                <div className="p-3 rounded-xl bg-[#F3F3F3] border border-[#2A5B60]/10 space-y-1">
                  <div className="font-bold text-[#2A5B60]">Transaction: <span className="font-mono">{selectedPayment.trx_id}</span></div>
                  <div>Method: <span className="font-bold text-[#6F9526]">{selectedPayment.payment_method}</span> | Amount: <span className="font-mono font-bold">৳ {selectedPayment.amount}</span></div>
                  <div>Booking Reference: <span className="font-mono">#{selectedPayment.booking}</span></div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2A5B60]">Payment Status</label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#2A5B60]/20 bg-[#F3F3F3] text-[#444E29] font-bold focus:outline-none focus:border-[#2A5B60]"
                  >
                    <option value="SUCCESS">SUCCESS (Paid & Active)</option>
                    <option value="PENDING">PENDING (Verification Required)</option>
                    <option value="CANCELLED">CANCELLED (Cancelled & Void)</option>
                    <option value="REFUNDED">REFUNDED (Refund Processed)</option>
                    <option value="FAILED">FAILED (Transaction Error)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2A5B60]">Admin Timeline Notes</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter reason or timeline details for payment modification..."
                    className="w-full p-2.5 rounded-xl border border-[#2A5B60]/20 bg-[#F3F3F3] text-[#444E29] placeholder-[#444E29]/50 text-xs focus:outline-none focus:border-[#2A5B60]"
                  />
                </div>

                {updateMessage && (
                  <div className="p-3 rounded-xl bg-[#C5D050]/20 border border-[#C5D050]/50 text-[#444E29] font-bold text-xs">
                    {updateMessage}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#F3F3F3] text-[#444E29] font-bold text-xs hover:bg-[#EBF0F1]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePaymentStatus}
                  disabled={updatingPayment}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl text-white font-bold text-xs shadow-md disabled:opacity-50"
                  style={{ backgroundColor: '#2A5B60' }}
                >
                  {updatingPayment ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-[#C5D050]" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
