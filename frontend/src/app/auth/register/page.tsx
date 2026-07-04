'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import Link from 'next/link';
import { 
  Ticket, User, Mail, Lock, Phone, CreditCard, 
  CheckCircle2, AlertCircle, RefreshCw, Smartphone, KeyRound, Calendar 
} from 'lucide-react';

export default function Register() {
  const router = useRouter();
  
  // Registration Wizard Step: 1, 2, 3, 4, 5
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Account details
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: SIM Verification
  const [phone, setPhone] = useState('');
  const [simOtpSent, setSimOtpSent] = useState(false);
  const [simOtpInput, setSimOtpInput] = useState('');
  const [simOtpActual, setSimOtpActual] = useState('');
  const [simVerified, setSimVerified] = useState(false);

  // Step 3: Gmail Verification
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');
  const [emailOtpActual, setEmailOtpActual] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  // Step 4: NID Verification
  const [nidNumber, setNidNumber] = useState('');
  const [dob, setDob] = useState('');
  const [nidVerified, setNidVerified] = useState(false);
  const [nidData, setNidData] = useState<any>(null);

  // OTP Timer States (2 min limit)
  const [simTimer, setSimTimer] = useState(120);
  const [simTimerActive, setSimTimerActive] = useState(false);
  const [emailTimer, setEmailTimer] = useState(120);
  const [emailTimerActive, setEmailTimerActive] = useState(false);

  // SIM Countdown effect
  React.useEffect(() => {
    let interval: any = null;
    if (simTimerActive && simTimer > 0) {
      interval = setInterval(() => {
        setSimTimer(prev => prev - 1);
      }, 1000);
    } else if (simTimer === 0) {
      setSimOtpActual(''); // Invalidate OTP code
      setError('SIM SMS verification code has expired. Please request a new code.');
      setSimTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [simTimerActive, simTimer]);

  // Gmail Countdown effect
  React.useEffect(() => {
    let interval: any = null;
    if (emailTimerActive && emailTimer > 0) {
      interval = setInterval(() => {
        setEmailTimer(prev => prev - 1);
      }, 1000);
    } else if (emailTimer === 0) {
      setEmailOtpActual(''); // Invalidate OTP code
      setError('Gmail verification code has expired. Please request a new code.');
      setEmailTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [emailTimerActive, emailTimer]);

  // Verification codes/notifications
  const [toastMessage, setToastMessage] = useState('');

  // Trigger Toast Notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 15000); // Leave visible so the user can read the simulated OTP code
  };

  // --- Step 1: Submit Account Info ---
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !firstName || !lastName || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!email.includes('@gmail.com')) {
      setError('A valid Gmail address (@gmail.com) is required.');
      return;
    }
    setError('');
    setStep(2);
  };

  // --- Step 2: SIM OTP Send & Verify ---
  const handleSendSimOtp = async () => {
    if (!phone || phone.length < 11) {
      setError('Please enter a valid Bangladeshi mobile number (e.g., 017XXXXXXXX).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Format phone number to Bangladeshi format (+8801XXXXXXXXX)
      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '+88' + formattedPhone;
      } else if (!formattedPhone.startsWith('+88')) {
        formattedPhone = '+880' + formattedPhone;
      }

      const res = await api.sendOTP(formattedPhone, 'sim');
      setSimOtpActual(res.simulated_otp);
      setSimOtpSent(true);
      setSimTimer(120);
      setSimTimerActive(true);
      showToast(`[SMS Gateway Simulated] Verification OTP sent to ${formattedPhone}: Code = ${res.simulated_otp}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySimOtp = () => {
    if (simOtpInput === simOtpActual && simOtpActual !== '') {
      setSimVerified(true);
      setSimTimerActive(false);
      setError('');
      showToast('Bangladeshi SIM verified successfully!');
      setStep(3); // Go to Gmail OTP step
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  // --- Step 3: Gmail OTP Send & Verify ---
  const handleSendEmailOtp = async () => {
    setLoading(true);
    try {
      const res = await api.sendOTP(email, 'email');
      setEmailOtpActual(res.simulated_otp);
      setEmailOtpSent(true);
      setEmailTimer(120);
      setEmailTimerActive(true);
      showToast(`[Gmail Server Simulated] Verification OTP sent to ${email}: Code = ${res.simulated_otp}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send Gmail OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = () => {
    if (emailOtpInput === emailOtpActual && emailOtpActual !== '') {
      setEmailVerified(true);
      setEmailTimerActive(false);
      setError('');
      showToast('Gmail verified successfully!');
      setStep(4); // Go to NID Verification
    } else {
      setError('Invalid OTP code. Please try again.');
    }
  };

  // --- Step 4: NID Verification ---
  const handleVerifyNID = async () => {
    if (!nidNumber || !dob) {
      setError('Please enter NID number and date of birth.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyNID(nidNumber, dob);
      if (res.verified) {
        setNidVerified(true);
        setNidData(res.nid_data);
        showToast(`EC Database Match: Verified citizen ${res.nid_data.full_name}!`);
      }
    } catch (err: any) {
      setError(err.message || 'NID verification failed. Ensure NID number and DOB match the registry.');
    } finally {
      setLoading(false);
    }
  };

  const handleNIDProceed = () => {
    if (nidVerified) {
      setStep(5);
    }
  };

  // --- Step 5: Final Submission ---
  const handleFinalRegister = async () => {
    setLoading(true);
    setError('');
    
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+88' + formattedPhone;
    } else if (!formattedPhone.startsWith('+88')) {
      formattedPhone = '+880' + formattedPhone;
    }

    const payload = {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      phone: formattedPhone,
      nid: nidNumber,
      nid_name: nidData?.full_name || '',
      nid_dob: dob,
      nid_address: nidData?.address || ''
    };

    try {
      await api.register(payload);
      setStep(6); // Success screen
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[90vh] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-96 w-96 rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* Simulated OTP Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl transition-all duration-300 text-slate-100 flex items-start space-x-3">
          {toastMessage.includes('Gmail') ? (
            <Mail className="h-6 w-6 text-emerald-400 shrink-0 animate-bounce" />
          ) : (
            <Smartphone className="h-6 w-6 text-emerald-400 shrink-0 animate-bounce" />
          )}
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {toastMessage.includes('Gmail') ? 'Gmail Server Delivery' : 'SIM SMS Gateway'}
            </h4>
            <p className="text-xs font-mono mt-1 text-slate-200">{toastMessage}</p>
            <p className="text-[10px] text-slate-400 mt-2">This mocks a real SMS/Email API payload.</p>
          </div>
          <button onClick={() => setToastMessage('')} className="text-xs text-slate-500 hover:text-white font-bold ml-auto cursor-pointer">✕</button>
        </div>
      )}

      <div className="w-full max-w-xl space-y-8 glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg">
            <Ticket className="h-6 w-6 rotate-12" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white tracking-tight">Create an Account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Verify SIM, Gmail, and NID to secure your reservation capability.
          </p>
        </div>

        {/* Multi-step progress bar */}
        {step <= 5 && (
          <div className="flex items-center justify-between px-2 mb-6">
            {[
              { num: 1, label: 'Profile' },
              { num: 2, label: 'SIM OTP' },
              { num: 3, label: 'Gmail OTP' },
              { num: 4, label: 'NID EC' },
              { num: 5, label: 'Finish' }
            ].map(s => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center space-y-1">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s.num 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {s.num}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 tracking-wider hidden sm:inline">{s.label}</span>
                </div>
                {s.num < 5 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-all ${
                    step > s.num ? 'bg-emerald-500' : 'bg-slate-800'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* --- STEP 1: Account details --- */}
        {step === 1 && (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="E.g., John"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="E.g., Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="E.g., johndoe123"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gmail Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="E.g., johndoe@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/10 cursor-pointer hover:scale-[1.01] transition-all"
            >
              Proceed to SIM Verification
            </button>
          </form>
        )}

        {/* --- STEP 2: SIM Verification --- */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bangladeshi SIM Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  disabled={simVerified}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  placeholder="017XXXXXXXX"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Accepts any 11-digit mobile number starting with 013, 014, 015, 016, 017, 018, 019.</p>
            </div>

            {!simOtpSent ? (
              <button
                type="button"
                onClick={handleSendSimOtp}
                disabled={loading}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-3.5 font-bold text-white border border-slate-700 cursor-pointer flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                <span>Send SMS Verification Code</span>
              </button>
            ) : (
              <div className="space-y-4 bg-slate-900/30 border border-slate-900 p-6 rounded-2xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enter 6-Digit SMS OTP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={simOtpInput}
                      onChange={(e) => setSimOtpInput(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 tracking-widest text-center font-bold focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="XXXXXX"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] mt-1.5">
                    <span className="text-slate-500">Code expires in: <span className={`font-bold ${simTimer < 30 ? 'text-red-400' : 'text-emerald-400'}`}>{Math.floor(simTimer / 60)}:{(simTimer % 60).toString().padStart(2, '0')}</span></span>
                    <span className="text-emerald-400">Tip: Check simulated notification.</span>
                  </div>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={loading || (simTimer > 90)}
                      onClick={handleSendSimOtp}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-350 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {simTimer > 90 ? `Resend OTP in ${simTimer - 90}s` : 'Resend SMS Verification Code'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSimOtpSent(false)}
                    className="rounded-xl border border-slate-800 bg-transparent hover:bg-slate-900 py-3 text-sm font-semibold text-slate-300 transition-all cursor-pointer"
                  >
                    Back / Re-enter
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifySimOtp}
                    className="rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/10 hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    Verify SIM
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STEP 3: Gmail Verification --- */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verify Registered Gmail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>

            {!emailOtpSent ? (
              <button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={loading}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-3.5 font-bold text-white border border-slate-700 cursor-pointer flex items-center justify-center space-x-2 transition-all"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                <span>Send Email Verification Code</span>
              </button>
            ) : (
              <div className="space-y-4 bg-slate-900/30 border border-slate-900 p-6 rounded-2xl">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enter 6-Digit Email OTP</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 tracking-widest text-center font-bold focus:border-emerald-500 focus:outline-none transition-colors"
                      placeholder="XXXXXX"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] mt-1.5">
                    <span className="text-slate-500">Code expires in: <span className={`font-bold ${emailTimer < 30 ? 'text-red-400' : 'text-emerald-400'}`}>{Math.floor(emailTimer / 60)}:{(emailTimer % 60).toString().padStart(2, '0')}</span></span>
                    <span className="text-emerald-400">Tip: Check simulated notification.</span>
                  </div>
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={loading || (emailTimer > 90)}
                      onClick={handleSendEmailOtp}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-350 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {emailTimer > 90 ? `Resend OTP in ${emailTimer - 90}s` : 'Resend Email Verification Code'}
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-xl border border-slate-800 bg-transparent hover:bg-slate-900 py-3 text-sm font-semibold text-slate-300 transition-all cursor-pointer"
                  >
                    Back to SIM Step
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    className="rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 shadow-md shadow-emerald-500/10 hover:bg-emerald-400 transition-all cursor-pointer"
                  >
                    Verify Gmail
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- STEP 4: NID Verification --- */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Guide Help block listing mock NID records */}
            <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl text-xs space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center space-x-1">
                <span>Election Commission (EC) Registry Demo Data</span>
              </h4>
              <p className="text-slate-400">Use one of these registered Bangladeshi citizen credentials to verify successfully:</p>
              <ul className="space-y-1.5 text-[10px] text-slate-300">
                {[
                  { nid: "1234567890", dob: "1995-06-15", name: "Rakibul Islam" },
                  { nid: "9876543210", dob: "1998-10-20", name: "Ayesha Siddiqua" },
                  { nid: "1122334455", dob: "1990-12-01", name: "Naimur Rahman" }
                ].map(item => (
                  <li key={item.nid} className="flex justify-between items-center py-1 border-b border-slate-900 last:border-b-0">
                    <span className="font-mono">NID: <span className="text-emerald-400 font-bold">{item.nid}</span> | DOB: <span className="text-teal-400">{item.dob}</span> ({item.name})</span>
                    <button
                      type="button"
                      onClick={() => {
                        setNidNumber(item.nid);
                        setDob(item.dob);
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 transition-colors font-bold text-[9px] cursor-pointer"
                    >
                      Autofill
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">National ID (NID) Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={nidVerified}
                    value={nidNumber}
                    onChange={(e) => setNidNumber(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="E.g., 1234567890"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    required
                    disabled={nidVerified}
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-3 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-200 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {nidVerified && nidData && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Citizen Details Verified Successfully</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <div><span className="text-slate-500">Full Name:</span> <span className="text-slate-200">{nidData.full_name}</span></div>
                  <div><span className="text-slate-500">Father Name:</span> <span className="text-slate-200">{nidData.father_name}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Mother Name:</span> <span className="text-slate-200">{nidData.mother_name}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">Official Address:</span> <span className="text-slate-300">{nidData.address}</span></div>
                </div>
              </div>
            )}

            {!nidVerified ? (
              <button
                type="button"
                onClick={handleVerifyNID}
                disabled={loading}
                className="w-full rounded-xl bg-slate-850 hover:bg-slate-800 py-3.5 font-bold text-emerald-400 border border-emerald-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                <span>Query National EC Database</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNIDProceed}
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <span>Proceed to Finish</span>
              </button>
            )}
          </div>
        )}

        {/* --- STEP 5: Final Review & Finish --- */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest border-b border-slate-800 pb-2">Registration Summary</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Name:</span> <span className="text-slate-200">{firstName} {lastName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Username:</span> <span className="text-slate-200">{username}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Gmail:</span> <span className="text-slate-200">{email} (Verified)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Mobile SIM:</span> <span className="text-slate-200">{phone} (Verified)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">NID:</span> <span className="text-slate-200">{nidNumber} (Verified)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">NID Holder:</span> <span className="text-emerald-400 font-bold">{nidData?.full_name}</span></div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinalRegister}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-4 font-bold text-slate-950 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] shadow-lg shadow-emerald-500/10 cursor-pointer"
            >
              {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : null}
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* --- STEP 6: Success Screen --- */}
        {step === 6 && (
          <div className="text-center space-y-6 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border-2 border-emerald-500/30">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">Registration Complete!</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Your account was created and verified against Bangladeshi SIM & National ID records. You can now login.
              </p>
            </div>
            
            <Link
              href="/auth/login"
              className="inline-block w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 font-bold text-slate-950 shadow-lg shadow-emerald-500/10 hover:from-emerald-400 hover:to-teal-400 transition-all text-center"
            >
              Login Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
