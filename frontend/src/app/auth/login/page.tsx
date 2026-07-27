'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isValidBDPhone, isValidGmail } from '@/utils/api';
import Link from 'next/link';
import { Ticket, User as UserIcon, Lock, AlertCircle, RefreshCw, Eye, EyeOff, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowCard } from '@/components/GlowCard';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpActual, setOtpActual] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [timer, setTimer] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  const redirectUrl = searchParams.get('redirect') || '/';

  // Gmail Countdown effect
  React.useEffect(() => {
    let interval: any = null;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setOtpActual(''); // Invalidate OTP code
      setError('Gmail verification code has expired. Please try logging in again.');
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timer]);

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 15000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const input = username.trim();

    // Validation checks for Email & Phone login attempts
    if (input.includes('@')) {
      if (!isValidGmail(input)) {
        setError('Login requires a valid Gmail address (ending in @gmail.com).');
        return;
      }
    }

    if (/^\+?\d+$/.test(input.replace(/[- ]/g, ''))) {
      if (!isValidBDPhone(input)) {
        setError('Login requires a valid 11-digit Bangladesh phone number starting with 01 (e.g. 017XXXXXXXX).');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      if (!otpSent) {
        // Step 1: Send credentials and check if OTP is required
        const res = await login(input, password);
        if (res && res.requires_otp) {
          setOtpSent(true);
          setEmailAddress(res.email);
          if (res.simulated_otp) {
            setOtpActual(res.simulated_otp);
            showToast(`[Gmail Server Delivery] Verification OTP sent to ${res.email}: Code = ${res.simulated_otp}`);
          } else {
            showToast(`[Gmail Server Delivery] Verification OTP sent to your registered Gmail address: ${res.email}`);
          }
          setTimer(120);
          setTimerActive(true);
        } else {
          // Direct login fallback if backend didn't require OTP
          const userObj = res?.user;
          if (userObj && (userObj.profile?.role === 'admin' || userObj.is_staff)) {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      } else {
        // Step 2: Validate credentials with OTP
        const res = await login(input, password, otpInput);
        setTimerActive(false);
        const userObj = res?.user;
        if (userObj && (userObj.profile?.role === 'admin' || userObj.is_staff)) {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await login(username.trim(), password);
      if (res && res.requires_otp) {
        setEmailAddress(res.email);
        if (res.simulated_otp) {
          setOtpActual(res.simulated_otp);
          showToast(`[Gmail Server Delivery] Verification OTP resent to ${res.email}: Code = ${res.simulated_otp}`);
        } else {
          showToast(`[Gmail Server Delivery] Verification OTP resent to your registered Gmail address.`);
        }
        setTimer(120);
        setTimerActive(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative w-full">
      {/* Simulated OTP Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl transition-all duration-300 text-slate-100 flex items-start space-x-3">
          <Mail className="h-6 w-6 text-cyan-400 shrink-0 animate-bounce" />
          <div>
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              Gmail Server Delivery
            </h4>
            <p className="text-xs font-mono mt-1 text-slate-200">{toastMessage}</p>
            <p className="text-xs text-slate-400 mt-2">This simulates a live Google Mail delivery.</p>
          </div>
          <button onClick={() => setToastMessage('')} className="text-xs text-slate-500 hover:text-white font-bold ml-auto cursor-pointer">✕</button>
        </div>
      )}

      <GlowCard glowColor="cyan" intensity="low">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl shadow-2xl relative"
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-400 to-fuchsia-600 text-white shadow-lg">
              <Ticket className="h-6 w-6 rotate-12" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
              {otpSent ? "ENTER SECURITY KEY" : "AUTHORIZE IDENTITY"}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {otpSent ? (
                <span>Verify your identity nodes.</span>
              ) : (
                <>
                  Authenticate using your registered credentials.<br/>
                  Or{' '}
                  <Link href="/auth/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                    create a new account
                  </Link>
                </>
              )}
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-start space-x-2 overflow-hidden"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {!otpSent ? (
              <div className="space-y-4 rounded-md shadow-sm">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username / Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                      placeholder="Enter user node identity"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                      placeholder="Enter secure access code"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-slate-300 bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
                  We have dispatched a 6-digit security code to your verified Gmail: <span className="font-bold text-cyan-400 font-mono">{emailAddress}</span>.
                </div>

                {otpActual && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-fuchsia-950/60 border border-fuchsia-500/40 space-y-2 shadow-lg shadow-fuchsia-500/10"
                  >
                    <div className="flex items-center space-x-2 text-fuchsia-400 text-xs font-bold uppercase tracking-wider">
                      <Mail className="h-4 w-4 animate-bounce" />
                      <span>Gmail Server Delivery</span>
                    </div>
                    <div className="text-xl font-black text-fuchsia-400 font-mono tracking-widest text-center mt-1">
                      {otpActual}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpInput(otpActual);
                        setError('');
                      }}
                      className="w-full mt-2 py-2 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                    >
                      Auto-Fill Code ({otpActual})
                    </button>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gmail Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="block w-full py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 tracking-widest text-center font-bold placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors"
                    placeholder="XXXXXX"
                  />
                  <div className="flex justify-between items-center text-xs mt-2 text-slate-400">
                    <span>Expires in: <span className={`font-bold ${timer < 30 ? 'text-red-400' : 'text-cyan-400'}`}>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span></span>
                    <button
                      type="button"
                      disabled={loading || timer > 90}
                      onClick={handleResendOtp}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                      {timer > 90 ? `Resend in ${timer - 90}s` : 'Resend Code'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-fuchsia-600 hover:from-cyan-300 hover:to-fuchsia-500 py-3.5 font-bold text-slate-950 flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>{otpSent ? 'Verifying OTP...' : 'Requesting Access...'}</span>
                  </>
                ) : (
                  <span>{otpSent ? 'Verify & Authenticate' : 'Login'}</span>
                )}
              </motion.button>
              
              {otpSent && (
                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtpInput('');
                      setOtpActual('');
                      setTimerActive(false);
                      setError('');
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Back to Login Credentials
                  </button>
                </div>
              )}
            </div>
          </form>
        </motion.div>
      </GlowCard>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
