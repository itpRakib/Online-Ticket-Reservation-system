'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  CreditCard, Smartphone, CheckCircle, RefreshCw, AlertCircle, 
  ArrowRight, ShieldCheck, Sparkles, Building2, KeyRound 
} from 'lucide-react';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const bookingId = params.bookingId as string;

  // State
  const [booking, setBooking] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Selected payment method category: mobile, card, netbanking
  const [paymentCategory, setPaymentCategory] = useState<'mobile' | 'card' | 'netbanking'>('mobile');
  // Specific method: BKASH, NAGAD, ROCKET, CARD, DBBL, CITY
  const [paymentMethod, setPaymentMethod] = useState<'BKASH' | 'NAGAD' | 'ROCKET' | 'CARD' | ''>('');

  // Simulators overlays
  const [showSimulator, setShowSimulator] = useState(false);
  const [simStep, setSimStep] = useState(1); // 1: Number entry, 2: OTP verify, 3: PIN entry
  const [simPhoneNumber, setSimPhoneNumber] = useState('');
  const [simOtpSent, setSimOtpSent] = useState('');
  const [simOtpInput, setSimOtpInput] = useState('');
  const [simPinInput, setSimPinInput] = useState('');

  // Fetch booking details
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError('');
      try {
        const bookingsList = await api.getMyBookings();
        const found = bookingsList.find(b => b.id.toString() === bookingId);
        if (found) {
          setBooking(found);
          if (found.status === 'PAID') {
            router.push(`/dashboard?confirm=true&pnr=${found.pnr_number}`);
          }
        } else {
          setError('Booking not found in your travel record.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  // Open simulated Mobile Gateway
  const handleSelectMobileMethod = (method: 'BKASH' | 'NAGAD' | 'ROCKET') => {
    setPaymentMethod(method);
    setSimPhoneNumber(user?.profile?.phone || '');
    setSimStep(1);
    setSimOtpInput('');
    setSimPinInput('');
    setShowSimulator(true);
  };

  // Mobile Simulator actions
  const handleSimNumberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPhoneNumber || simPhoneNumber.length < 11) {
      alert('Please enter a valid mobile number.');
      return;
    }
    // Generate simulated OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimOtpSent(mockOtp);
    setSimStep(2);
  };

  const handleSimOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (simOtpInput === simOtpSent) {
      setSimStep(3);
    } else {
      alert('Invalid OTP code. Please enter the code shown in the simulated screen banner.');
    }
  };

  const handleSimPinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPinInput || simPinInput.length < 4) {
      alert('Please enter a valid PIN.');
      return;
    }
    
    // Close simulator and submit payment
    setShowSimulator(false);
    await executePayment();
  };

  // Direct card/net banking payment
  const handleDirectPayment = async (method: 'CARD' | 'BANK') => {
    setPaymentMethod(method as any);
    await executePayment();
  };

  // Call pay API
  const executePayment = async () => {
    setSubmitting(true);
    setError('');
    
    // Generate mock TrxID
    const prefix = paymentMethod || 'PAY';
    const num = Math.random().toString(36).substring(2, 10).toUpperCase();
    const mockTrxId = `${prefix}-${num}`;

    try {
      await api.payBooking(bookingId, paymentMethod || 'BKASH', mockTrxId);
      router.push(`/dashboard?confirm=true&pnr=${booking.pnr_number}`);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
        <span className="text-slate-400">Opening secure payment gateway...</span>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Payment Checkout Error</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 relative">
      
      {/* Mobile Gateway Simulators (Modal popups overlays) */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          
          {/* Simulated SMS Alert Banner */}
          {simStep === 2 && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full rounded-2xl bg-slate-900 border-2 border-emerald-500/20 p-4 shadow-2xl animate-bounce flex items-center space-x-3 text-slate-100">
              <Smartphone className="h-6 w-6 text-emerald-400 shrink-0" />
              <div>
                <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Simulated SMS Received</h5>
                <p className="text-xs font-mono mt-0.5 text-slate-200">
                  Your OTP code for {paymentMethod} is: <span className="text-emerald-400 font-extrabold">{simOtpSent}</span>
                </p>
              </div>
            </div>
          )}

          {/* bKash Simulator UI */}
          {paymentMethod === 'BKASH' && (
            <div className="w-full max-w-[360px] bg-[#E2125D] text-white rounded-3xl shadow-2xl overflow-hidden border border-pink-400/20 flex flex-col font-sans">
              <div className="bg-white p-6 flex justify-between items-center border-b-4 border-pink-700">
                <span className="text-pink-600 font-black text-xl italic tracking-tighter">bKash Checkout</span>
                <button onClick={() => setShowSimulator(false)} className="text-pink-600 hover:text-pink-900 text-lg font-bold cursor-pointer">✕</button>
              </div>

              <div className="p-6 space-y-6 flex-grow">
                <div className="text-center space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-pink-100">Merchant Payment</span>
                  <div className="text-2xl font-black">৳{parseFloat(booking.total_fare).toLocaleString()}</div>
                  <span className="text-[10px] text-pink-200 block">PNR: {booking.pnr_number}</span>
                </div>

                {simStep === 1 && (
                  <form onSubmit={handleSimNumberSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-pink-100">Enter Your bKash Number</label>
                      <input 
                        type="text"
                        required
                        value={simPhoneNumber}
                        onChange={(e) => setSimPhoneNumber(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-bold text-lg focus:outline-none placeholder-slate-350"
                        placeholder="e.g. 017XXXXXXXX"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-[#c10a4e] hover:bg-[#a0083e] p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      PROCEED
                    </button>
                  </form>
                )}

                {simStep === 2 && (
                  <form onSubmit={handleSimOtpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-pink-100">Enter 6-Digit SMS Verification Code</label>
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        value={simOtpInput}
                        onChange={(e) => setSimOtpInput(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-mono tracking-widest font-extrabold text-lg focus:outline-none"
                        placeholder="XXXXXX"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-[#c10a4e] hover:bg-[#a0083e] p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      PROCEED
                    </button>
                  </form>
                )}

                {simStep === 3 && (
                  <form onSubmit={handleSimPinSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-pink-100">Enter Your 5-Digit bKash PIN</label>
                      <input 
                        type="password"
                        required
                        maxLength={5}
                        value={simPinInput}
                        onChange={(e) => setSimPinInput(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-mono tracking-widest font-extrabold text-lg focus:outline-none"
                        placeholder="•••••"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-[#c10a4e] hover:bg-[#a0083e] p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      CONFIRM PAYMENT
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-[#b10c48] p-3 text-center text-[10px] text-pink-200">
                Secure simulated transaction via bKash Checkout
              </div>
            </div>
          )}

          {/* Nagad Simulator UI */}
          {paymentMethod === 'NAGAD' && (
            <div className="w-full max-w-[360px] bg-gradient-to-b from-[#F23B26] to-[#d92211] text-white rounded-3xl shadow-2xl overflow-hidden border border-red-400/20 flex flex-col font-sans">
              <div className="bg-white p-5 flex justify-between items-center border-b-4 border-red-700">
                <span className="text-[#F23B26] font-black text-2xl italic tracking-tighter">NAGAD</span>
                <button onClick={() => setShowSimulator(false)} className="text-slate-500 hover:text-slate-800 text-lg font-bold cursor-pointer">✕</button>
              </div>

              <div className="p-6 space-y-6 flex-grow">
                <div className="text-center space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-red-100">Merchant Payment</span>
                  <div className="text-2xl font-black">৳{parseFloat(booking.total_fare).toLocaleString()}</div>
                  <span className="text-[10px] text-red-200 block">PNR: {booking.pnr_number}</span>
                </div>

                {simStep === 1 && (
                  <form onSubmit={handleSimNumberSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-red-100">Enter Nagad Account Number</label>
                      <input 
                        type="text"
                        required
                        value={simPhoneNumber}
                        onChange={(e) => setSimPhoneNumber(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-bold text-lg focus:outline-none"
                        placeholder="e.g. 017XXXXXXXX"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-slate-950 hover:bg-black p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      PROCEED
                    </button>
                  </form>
                )}

                {simStep === 2 && (
                  <form onSubmit={handleSimOtpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-red-100">Enter Nagad Verification OTP</label>
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        value={simOtpInput}
                        onChange={(e) => setSimOtpInput(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-mono tracking-widest font-extrabold text-lg focus:outline-none"
                        placeholder="XXXXXX"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-slate-950 hover:bg-black p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      PROCEED
                    </button>
                  </form>
                )}

                {simStep === 3 && (
                  <form onSubmit={handleSimPinSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-red-100">Enter Nagad Account PIN</label>
                      <input 
                        type="password"
                        required
                        maxLength={4}
                        value={simPinInput}
                        onChange={(e) => setSimPinInput(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-mono tracking-widest font-extrabold text-lg focus:outline-none"
                        placeholder="••••"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-slate-950 hover:bg-black p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      SUBMIT PIN
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-[#ba2211] p-3 text-center text-[10px] text-red-200">
                Secure transaction simulation by Nagad Ltd
              </div>
            </div>
          )}

          {/* Rocket Simulator UI */}
          {paymentMethod === 'ROCKET' && (
            <div className="w-full max-w-[360px] bg-[#8C3494] text-white rounded-3xl shadow-2xl overflow-hidden border border-purple-400/20 flex flex-col font-sans">
              <div className="bg-white p-5 flex justify-between items-center border-b-4 border-purple-900">
                <span className="text-purple-650 font-black text-2xl tracking-tight">ROCKET</span>
                <button onClick={() => setShowSimulator(false)} className="text-slate-500 hover:text-slate-800 text-lg font-bold cursor-pointer">✕</button>
              </div>

              <div className="p-6 space-y-6 flex-grow">
                <div className="text-center space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-purple-100">Merchant Payment</span>
                  <div className="text-2xl font-black">৳{parseFloat(booking.total_fare).toLocaleString()}</div>
                  <span className="text-[10px] text-purple-200 block">PNR: {booking.pnr_number}</span>
                </div>

                {simStep === 1 && (
                  <form onSubmit={handleSimNumberSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-purple-100">Enter Rocket 12-Digit Wallet Number</label>
                      <input 
                        type="text"
                        required
                        value={simPhoneNumber}
                        onChange={(e) => setSimPhoneNumber(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-bold text-lg focus:outline-none"
                        placeholder="e.g. 017XXXXXXXXX"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-[#612067] hover:bg-[#4d1652] p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      PROCEED
                    </button>
                  </form>
                )}

                {simStep === 2 && (
                  <form onSubmit={handleSimOtpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-purple-100">Enter Rocket Verification Code</label>
                      <input 
                        type="text"
                        required
                        maxLength={6}
                        value={simOtpInput}
                        onChange={(e) => setSimOtpInput(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-mono tracking-widest font-extrabold text-lg focus:outline-none"
                        placeholder="XXXXXX"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-[#612067] hover:bg-[#4d1652] p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      PROCEED
                    </button>
                  </form>
                )}

                {simStep === 3 && (
                  <form onSubmit={handleSimPinSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-purple-100">Enter Rocket 4-Digit PIN</label>
                      <input 
                        type="password"
                        required
                        maxLength={4}
                        value={simPinInput}
                        onChange={(e) => setSimPinInput(e.target.value)}
                        className="w-full rounded-xl bg-white text-slate-900 p-3.5 text-center font-mono tracking-widest font-extrabold text-lg focus:outline-none"
                        placeholder="••••"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full rounded-xl bg-[#612067] hover:bg-[#4d1652] p-3 text-sm font-bold text-white shadow-lg cursor-pointer transition-all"
                    >
                      CONFIRM PAYMENT
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-[#6b2571] p-3 text-center text-[10px] text-purple-200">
                DBBL Rocket Wallet Simulation
              </div>
            </div>
          )}

        </div>
      )}

      {/* Main Payment UI Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Choose Payment Method */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-bold text-white text-base border-b border-slate-800 pb-3 flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-emerald-400" />
              <span>Select Payment Gateway</span>
            </h3>

            {/* Gateway Category tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-850">
              <button
                onClick={() => setPaymentCategory('mobile')}
                className={`text-xs font-semibold py-2.5 rounded-lg transition-all cursor-pointer ${
                  paymentCategory === 'mobile' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mobile Banking
              </button>
              <button
                onClick={() => setPaymentCategory('card')}
                className={`text-xs font-semibold py-2.5 rounded-lg transition-all cursor-pointer ${
                  paymentCategory === 'card' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cards (Visa/Master)
              </button>
              <button
                onClick={() => setPaymentCategory('netbanking')}
                className={`text-xs font-semibold py-2.5 rounded-lg transition-all cursor-pointer ${
                  paymentCategory === 'netbanking' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Net Banking
              </button>
            </div>

            {/* Render Category Items */}
            {paymentCategory === 'mobile' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { id: 'BKASH', label: 'bKash Wallet', sub: 'Instant Checkout', color: 'border-pink-500/20 hover:border-pink-500' },
                  { id: 'NAGAD', label: 'Nagad Wallet', sub: 'Instant Checkout', color: 'border-red-500/20 hover:border-red-500' },
                  { id: 'ROCKET', label: 'Rocket Wallet', sub: 'DBBL Mobile Bank', color: 'border-purple-500/20 hover:border-purple-500' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMobileMethod(item.id as any)}
                    className={`glass-card p-5 rounded-2xl border text-left cursor-pointer transition-all hover:scale-[1.03] space-y-2 group ${item.color}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-350">
                      <Smartphone className="h-5 w-5 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.label}</h4>
                      <p className="text-[10px] text-slate-500">{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {paymentCategory === 'card' && (
              <div className="space-y-4 pt-2">
                <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-2xl space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cardholder Name</label>
                      <input type="text" className="w-full rounded-lg border border-slate-850 bg-slate-900 p-2.5 text-xs text-slate-200" placeholder="Karim Uddin" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Card Number</label>
                      <input type="text" className="w-full rounded-lg border border-slate-850 bg-slate-900 p-2.5 text-xs text-slate-200" placeholder="4321 •••• •••• 9012" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiration Date</label>
                      <input type="text" className="w-full rounded-lg border border-slate-850 bg-slate-900 p-2.5 text-xs text-slate-200" placeholder="MM/YY" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CVV Code</label>
                      <input type="password" maxLength={3} className="w-full rounded-lg border border-slate-850 bg-slate-900 p-2.5 text-xs text-slate-200" placeholder="•••" />
                    </div>
                  </div>

                  <button
                    onClick={() => handleDirectPayment('CARD')}
                    className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 font-bold text-slate-950 text-xs shadow-md shadow-emerald-500/10 transition-all cursor-pointer"
                  >
                    Pay via Visa / MasterCard / Nexus Card
                  </button>
                </div>
              </div>
            )}

            {paymentCategory === 'netbanking' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                {[
                  { name: 'Dutch-Bangla Bank', code: 'DBBL' },
                  { name: 'City Bank (Citytouch)', code: 'CITY' }
                ].map(bank => (
                  <button
                    key={bank.code}
                    onClick={() => handleDirectPayment('CARD')} // Mocked via standard payment payload
                    className="glass-card p-4 rounded-xl border border-slate-900 hover:border-emerald-500/20 text-left transition-all hover:scale-[1.02] flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400">
                        <Building2 className="h-4 w-4 group-hover:text-emerald-400 transition-colors" />
                      </div>
                      <span className="text-xs font-bold text-white">{bank.name}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-slate-650" />
                  </button>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Bill Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Billing Summary</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Passenger PNR:</span> <span className="font-mono font-bold text-white">{booking.pnr_number}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Journey Route:</span> <span className="font-semibold text-slate-200">{booking.trip.source.name.split(' ')[0]} to {booking.trip.destination.name.split(' ')[0]}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Transport:</span> <span className="text-slate-200">{booking.trip.operator_name}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Travel Date:</span> <span className="text-slate-200">{booking.travel_date}</span></div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px]"><span className="text-slate-400">Subtotal:</span> <span className="text-slate-200 font-semibold">৳{parseFloat(booking.total_fare).toLocaleString()}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-400">Service Fee:</span> <span className="text-emerald-400 font-semibold">৳0 (Free Demo)</span></div>
                <div className="border-t border-slate-900 pt-3 mt-3 flex justify-between text-sm">
                  <span className="font-bold text-white">Amount Due:</span>
                  <span className="font-extrabold text-emerald-400 text-base">৳{parseFloat(booking.total_fare).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {submitting && (
              <div className="flex items-center justify-center space-x-2 text-xs text-emerald-400 font-semibold">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing secure transaction...</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
