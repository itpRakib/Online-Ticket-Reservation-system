'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  User, CheckCircle2, AlertCircle, RefreshCw, Calendar, 
  MapPin, Ticket, ShieldCheck, Printer, LogOut, Check, X
} from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const { user, refreshProfile, logout, language } = useAuth();
  const t = (en: string, bn: string) => (language === 'bn' ? bn : en);
  
  const showConfirm = searchParams.get('confirm') === 'true';
  const confirmPnr = searchParams.get('pnr') || '';

  // State
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Cancellation / Refund Modal State
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelPassword, setCancelPassword] = useState('');
  const [cancelRefundWallet, setCancelRefundWallet] = useState('');
  const [cancelReason, setCancelReason] = useState('Change of Travel Plans');
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch profile once on mount
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, []);

  // Fetch travel history
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getMyBookings();
        setBookings(data);
        if (data.length > 0) {
          // If redirected after payment, highlight the newly paid booking
          if (confirmPnr) {
            const newlyPaid = data.find(b => b.pnr_number === confirmPnr);
            if (newlyPaid) setSelectedTicket(newlyPaid);
          } else {
            // Default to first booking
            setSelectedTicket(data[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user, confirmPnr]);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!cancelPassword) {
      setCancelError('Password is required.');
      return;
    }
    if (!cancelRefundWallet) {
      setCancelError('Refund mobile wallet number is required.');
      return;
    }

    setIsCancelling(true);
    setCancelError('');
    setCancelSuccess('');

    try {
      const res = await api.cancelBooking(selectedTicket.id, {
        password: cancelPassword,
        refund_wallet: cancelRefundWallet,
        reason: cancelReason
      });
      
      setCancelSuccess(res.message || 'Ticket cancelled successfully.');
      
      // Update local state of the ticket list
      setBookings((prev: any[]) => prev.map(b => b.id === selectedTicket.id ? { ...b, status: 'CANCELLED' } : b));
      setSelectedTicket((prev: any) => prev ? { ...prev, status: 'CANCELLED' } : null);
      
      // Close modal after delay
      setTimeout(() => {
        setIsCancelModalOpen(false);
        setCancelSuccess('');
        setCancelPassword('');
      }, 2500);

    } catch (err: any) {
      setCancelError(err.message || 'Failed to process refund. Check password or try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white font-sans">Access Denied</h2>
        <p className="text-slate-400">Please login to view your personal dashboard and travel history.</p>
        <a href="/auth/login" className="inline-block rounded-xl bg-emerald-500 text-slate-950 px-5 py-2.5 font-bold hover:bg-emerald-400 transition-all text-sm">
          Login Now
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 print:p-0 print:bg-white print:text-black">
      
      {/* Confirmation Success Header */}
      {showConfirm && confirmPnr && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-sm text-emerald-400 flex items-start space-x-3 shadow-lg print:hidden">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400 animate-bounce" />
          <div>
            <h4 className="font-bold text-white text-base">Payment Confirmed Successfully!</h4>
            <p className="text-slate-300 mt-1">
              Your booking under PNR <span className="font-mono font-bold text-emerald-400">{confirmPnr}</span> has been confirmed. Below is your official e-Ticket.
            </p>
          </div>
        </div>
      )}

      {/* Profile Details & Verification Badges */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 print:hidden">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-black text-2xl uppercase shadow-lg">
            {user.username.substring(0, 2)}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{user.first_name} {user.last_name}</h2>
            <p className="text-xs text-slate-400 mt-1">Username: {user.username} • Email: {user.email}</p>
          </div>
        </div>

        {/* Verification Badges Group */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {user.profile?.phone_verified && (
            <span className="flex items-center space-x-1 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full">
              <Check className="h-3 w-3" />
              <span>SIM Verified</span>
            </span>
          )}
          {user.profile?.email_verified && (
            <span className="flex items-center space-x-1 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full">
              <Check className="h-3 w-3" />
              <span>Gmail Verified</span>
            </span>
          )}
          {user.profile?.nid_verified && (
            <span className="flex items-center space-x-1 text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full" title={user.profile.nid_name}>
              <Check className="h-3 w-3" />
              <span>NID: {user.profile.nid} ({user.profile.nid_name})</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Bookings List */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 space-y-4 print:hidden">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-3">
            Travel History ({bookings.length})
          </h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No bookings found. Start by searching routes on the home page!</p>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {bookings.map((b) => {
                const isSelected = selectedTicket?.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedTicket(b)}
                    className={`w-full rounded-xl p-3.5 text-left border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-850 bg-slate-900/20 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-mono bg-slate-800 text-slate-350 px-1.5 py-0.5 rounded font-bold uppercase">{b.pnr_number}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        b.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1 flex items-center space-x-1.5">
                      <span>{b.trip.source.name.split(' ')[0]}</span>
                      <span className="text-slate-500">→</span>
                      <span>{b.trip.destination.name.split(' ')[0]}</span>
                    </h4>
                    
                    <p className="text-[10px] text-slate-550 flex items-center space-x-1.5">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      <span>{b.travel_date}</span>
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Ticket detailed view (e-Ticket print) */}
        <div className="lg:col-span-2 space-y-4 print:col-span-3">
          
          {selectedTicket ? (
            <div className="space-y-4">
              
              {/* Ticket stub controls */}
              <div className="flex justify-between items-center print:hidden">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Official Ticket Stub</span>
                <div className="flex items-center space-x-2">
                  {selectedTicket.status === 'PAID' && (
                    <button
                      onClick={() => {
                        setCancelError('');
                        setCancelSuccess('');
                        setCancelPassword('');
                        setCancelRefundWallet(user.profile?.phone || '');
                        setIsCancelModalOpen(true);
                      }}
                      className="rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 flex items-center space-x-2 transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4 text-red-400" />
                      <span>Cancel & Refund Ticket</span>
                    </button>
                  )}
                  <button
                    onClick={handlePrint}
                    className="rounded-xl border border-slate-850 bg-slate-900 hover:bg-slate-850 px-4 py-2 text-xs font-bold text-slate-300 flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-emerald-400" />
                    <span>Print / Save PDF</span>
                  </button>
                </div>
              </div>

              {/* High-Fidelity e-Ticket design */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl print:border-2 print:border-black print:text-black print:bg-white print:rounded-none">
                
                {/* Security background glow effect */}
                <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none print:hidden" />
                
                {/* Border punched-out stub ticket effects */}
                <div className="absolute top-1/2 -left-3 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-950 border-r border-slate-800 print:hidden" />
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 h-6 w-6 rounded-full bg-slate-950 border-l border-slate-800 print:hidden" />

                {/* Ticket Header */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-5 print:border-black">
                  <div>
                    <h3 className="text-emerald-450 font-black text-xl italic tracking-tight print:text-black">BD GoTicket</h3>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold block mt-0.5 print:text-slate-650">{t("Ministry of Transport & ICT", "যাতায়াত ও আইসিটি মন্ত্রণালয়")}</span>
                  </div>
                  
                  <div className="text-right">
                    <span className={`text-xs border font-extrabold px-3 py-1 rounded-full uppercase tracking-wider print:border-black print:text-black ${
                      selectedTicket.status === 'PAID' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : selectedTicket.status === 'CANCELLED'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}>
                      {selectedTicket.status === 'PAID' 
                        ? t('CONFIRMED', 'নিশ্চিতকৃত') 
                        : selectedTicket.status === 'CANCELLED' 
                          ? t('CANCELLED', 'বাতিল ও ফেরতকৃত') 
                          : t('PENDING', 'পেন্ডিং')}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-2 print:text-slate-650">PNR: <span className="font-mono font-bold text-white print:text-black">{selectedTicket.pnr_number}</span></span>
                  </div>
                </div>

                {/* Routing info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center sm:text-left">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t("Departure Station", "যাত্রার স্টেশন")}</span>
                    <h4 className="font-extrabold text-white text-lg mt-1 print:text-black">{selectedTicket.trip.source.name}</h4>
                    <span className="text-xs text-slate-400">Code: {selectedTicket.trip.source.code}</span>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center space-y-1 print:text-black">
                    <span className="text-[10px] font-mono text-slate-400">{selectedTicket.trip.duration_hours} {t("Hrs Journey", "ঘণ্টার যাত্রা")}</span>
                    <div className="relative flex items-center justify-center w-24">
                      <div className="h-[1px] w-full bg-slate-800 print:bg-black" />
                      <div className="absolute h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[9px] text-slate-550 font-bold uppercase">{selectedTicket.trip.transport_type} {t("Class", "শ্রেণী")}</span>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">{t("Arrival Station", "গন্তব্য স্টেশন")}</span>
                    <h4 className="font-extrabold text-white text-lg mt-1 print:text-black">{selectedTicket.trip.destination.name}</h4>
                    <span className="text-xs text-slate-400">Code: {selectedTicket.trip.destination.code}</span>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-slate-950/40 p-5 rounded-2xl border border-slate-850 print:bg-slate-100 print:border-black print:text-black">
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">{t("Travel Date", "ভ্রমণের তারিখ")}</span>
                    <span className="font-bold text-slate-200 text-xs mt-1 block print:text-black">{selectedTicket.travel_date}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Departure Time</span>
                    <span className="font-bold text-slate-200 text-xs mt-1 block print:text-black">{formatTime(selectedTicket.trip.departure_time)}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Operator / Coach</span>
                    <span className="font-bold text-slate-200 text-xs mt-1 block print:text-black truncate">{selectedTicket.trip.operator_name}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-bold">Seat Numbers</span>
                    <span className="font-extrabold text-emerald-400 text-xs mt-1 block print:text-black">
                      {selectedTicket.passengers.map((p: any) => p.seat_number).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Passenger list details */}
                <div className="space-y-3">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 print:border-black print:text-black">
                    Passenger Breakdown
                  </h5>
                  <div className="space-y-2">
                    {selectedTicket.passengers.map((p: any, index: number) => (
                      <div key={p.id} className="flex justify-between items-center text-xs">
                        <div className="flex space-x-2 text-slate-350 print:text-black">
                          <span>{index + 1}.</span>
                          <span className="font-bold text-white print:text-black">{p.name}</span>
                          <span className="text-slate-500">({p.gender}, {p.age} yrs)</span>
                        </div>
                        <span className="font-semibold text-slate-400 print:text-black">Seat {p.seat_number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security details & QR Code */}
                <div className="border-t border-dashed border-slate-850 pt-6 flex flex-col sm:flex-row justify-between items-center gap-6 print:border-black">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] text-slate-500 block print:text-slate-650">Verification Security Hash</span>
                    <span className="font-mono text-[9px] text-slate-400 block print:text-slate-650">TRX: {selectedTicket.trx_id || 'DEMO-TXID'}</span>
                    <span className="text-[10px] text-emerald-450 block font-semibold print:text-black">Verified against NID Registry</span>
                  </div>
                  
                  {/* Mock Barcode & QR Code styling using HTML */}
                  <div className="flex items-center space-x-4">
                    {/* Barcode representation */}
                    <div className="hidden sm:flex flex-col space-y-0.5 w-24">
                      <div className="h-8 bg-slate-200 border-x border-slate-900 flex space-x-0.5 print:bg-black">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div key={i} className={`h-full bg-slate-950 ${i % 3 === 0 ? 'w-1.5' : i % 2 === 0 ? 'w-0.5' : 'w-1'}`} />
                        ))}
                      </div>
                      <span className="text-[8px] font-mono text-center text-slate-500">PNR-{selectedTicket.pnr_number}</span>
                    </div>

                    {/* QR Code representation */}
                    <div className="h-16 w-16 bg-white border border-slate-200 p-1 flex flex-wrap items-center justify-center shrink-0">
                      {/* Generates a simple mock matrix representation */}
                      <div className="grid grid-cols-4 gap-1 w-full h-full bg-slate-950">
                        <div className="bg-white m-0.5" />
                        <div className="bg-slate-950" />
                        <div className="bg-white m-0.5" />
                        <div className="bg-white m-0.5" />
                        <div className="bg-slate-950" />
                        <div className="bg-white m-0.5" />
                        <div className="bg-slate-950" />
                        <div className="bg-white m-0.5" />
                        <div className="bg-white m-0.5" />
                        <div className="bg-slate-950" />
                        <div className="bg-white m-0.5" />
                        <div className="bg-slate-950" />
                        <div className="bg-white m-0.5" />
                        <div className="bg-white m-0.5" />
                        <div className="bg-slate-950" />
                        <div className="bg-white m-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 text-center text-slate-500 border border-dashed border-slate-800">
              Select a travel record from the history list to generate your e-Ticket.
            </div>
          )}

        </div>

      </div>

      {/* Cancellation & Refund Verification Modal */}
      {isCancelModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white">Verify Ticket Refund</h3>
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {cancelSuccess ? (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center text-xs text-emerald-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
                <p className="font-bold">{cancelSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleCancelSubmit} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  To securely process your refund of <span className="text-emerald-450 font-bold font-mono">৳{selectedTicket.total_fare} BDT</span> for PNR <span className="font-mono font-bold text-white">{selectedTicket.pnr_number}</span>, please verify your credentials.
                </p>

                {cancelError && (
                  <div className="rounded-xl bg-red-500/15 border border-red-500/30 p-3 text-[11px] text-red-400 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{cancelError}</span>
                  </div>
                )}

                {/* Refund Wallet Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Refund Mobile Wallet (bKash/Nagad)</label>
                  <input
                    type="text"
                    required
                    value={cancelRefundWallet}
                    onChange={(e) => setCancelRefundWallet(e.target.value)}
                    placeholder="e.g. 01712345678"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Account Password Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Account Password (for verification)</label>
                  <input
                    type="password"
                    required
                    value={cancelPassword}
                    onChange={(e) => setCancelPassword(e.target.value)}
                    placeholder="Enter your login password"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Reason Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reason for Cancellation</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Change of Travel Plans">Change of Travel Plans</option>
                    <option value="Booked Wrong Date/Transport">Booked Wrong Date/Transport</option>
                    <option value="Flight/Trip Schedule Delay">Flight/Trip Schedule Delay</option>
                    <option value="Personal Emergency">Personal Emergency</option>
                  </select>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCancelModalOpen(false)}
                    className="w-1/2 rounded-xl border border-slate-800 hover:bg-slate-800 py-3 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={isCancelling}
                    className="w-1/2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 py-3 text-xs font-extrabold text-white transition-all hover:scale-[1.01] flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isCancelling ? (
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    ) : (
                      <span>Confirm Refund</span>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Helper: format datetime to HH:MM AM/PM
function formatTime(dtStr: string) {
  try {
    const d = new Date(dtStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return dtStr;
  }
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-medium">Loading passenger dashboard...</span>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
