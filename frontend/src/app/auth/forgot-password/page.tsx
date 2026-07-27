'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { 
  Mail, Key, Lock, RefreshCw, AlertCircle, 
  ArrowLeft, CheckCircle2, Eye, EyeOff 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlowCard } from '@/components/GlowCard';

export default function ForgotPassword() {
  const router = useRouter();

  // Step 1 or Step 2
  const [step, setStep] = useState<1 | 2>(1);

  // Form inputs
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Simulated OTP (if SMTP is offline)
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setToastMessage('');

    try {
      const res = await api.forgotPassword(email);
      setStep(2);
      setSuccessMessage(res.message || 'OTP sent successfully.');
      if (res.simulated_otp) {
        setSimulatedOtp(res.simulated_otp);
        setToastMessage(`[Gmail Reset OTP] Verification Code: ${res.simulated_otp}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request reset OTP. Verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !newPassword) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.resetPassword({
        email,
        otp,
        new_password: newPassword
      });
      setSuccessMessage(res.message || 'Password reset successful!');
      setStep(2); // Keep step 2 but show success screen
      setToastMessage('');
      
      // Redirect to login after delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Incorrect code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative w-full">
      {/* Toast Notification for offline testing */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl transition-all duration-300 text-slate-100 flex items-start space-x-3">
          <Mail className="h-6 w-6 text-fuchsia-400 shrink-0 animate-bounce" />
          <div>
            <h4 className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">
              Gmail Server Delivery
            </h4>
            <p className="text-xs font-mono mt-1 text-slate-200">{toastMessage}</p>
            <p className="text-xs text-slate-400 mt-2">This simulates a live Google Mail delivery.</p>
          </div>
          <button onClick={() => setToastMessage('')} className="text-xs text-slate-500 hover:text-white font-bold ml-auto cursor-pointer">✕</button>
        </div>
      )}

      <GlowCard glowColor="purple" intensity="low">
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8 glass-panel p-8 rounded-3xl shadow-2xl relative bg-[var(--bg-raised)]/20"
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-400 to-fuchsia-600 text-white shadow-lg">
              <Key className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
              RESET PASSWORD
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {step === 1 ? 'Enter your Gmail to receive a password reset key.' : 'Enter your reset key and new password.'}
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

            {successMessage && !error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-400 flex items-start space-x-2 overflow-hidden"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 ? (
            <form className="mt-8 space-y-6" onSubmit={handleStep1Submit}>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Gmail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors text-sm"
                    placeholder="name@gmail.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:opacity-95 focus:outline-none disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>Send Reset OTP</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleStep2Submit}>
              <div className="space-y-4">
                {simulatedOtp && (
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
                      {simulatedOtp}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setOtp(simulatedOtp);
                        setError('');
                      }}
                      className="w-full mt-2 py-2 rounded-lg bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                    >
                      Auto-Fill Reset Code
                    </button>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">6-Digit Reset OTP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Key className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors text-sm font-mono tracking-widest text-center"
                      placeholder="XXXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none transition-colors text-sm"
                      placeholder="Enter new secure password"
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

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full justify-center rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white transition-all duration-300 hover:opacity-95 focus:outline-none disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-500/20"
                >
                  {loading ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-2">
            <Link 
              href="/auth/login" 
              className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Login</span>
            </Link>
          </div>
        </motion.div>
      </GlowCard>
    </div>
  );
}
