'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, X, Ticket, Sparkles, Flame, Zap } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const { user, logout, language, toggleLanguage } = useAuth();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > 100 && latest > previous) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const isActive = (path: string) => pathname === path;

  // 5-Accent Color Rotation Tokens
  const accentColors = [
    { bg: 'bg-[#FF3AF2]', border: 'border-[#FFE600]', text: 'text-white', shadow: 'shadow-[4px_4px_0_#FFE600]' }, // 1. Magenta
    { bg: 'bg-[#00F5D4]', border: 'border-[#FF3AF2]', text: 'text-[#0D0D1A]', shadow: 'shadow-[4px_4px_0_#FF3AF2]' }, // 2. Cyan
    { bg: 'bg-[#FFE600]', border: 'border-[#7B2FFF]', text: 'text-[#0D0D1A]', shadow: 'shadow-[4px_4px_0_#7B2FFF]' }, // 3. Yellow
    { bg: 'bg-[#FF6B35]', border: 'border-[#00F5D4]', text: 'text-white', shadow: 'shadow-[4px_4px_0_#00F5D4]' }, // 4. Orange
    { bg: 'bg-[#7B2FFF]', border: 'border-[#FFE600]', text: 'text-white', shadow: 'shadow-[4px_4px_0_#FFE600]' }  // 5. Purple
  ];

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full bg-[#0D0D1A]/90 backdrop-blur-md border-b-4 border-[#FF3AF2] shadow-[0_6px_20px_rgba(255,58,242,0.4)]"
    >
      <div className="mx-auto flex h-22 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        
        {/* Floating Decorative Elements */}
        <div className="absolute -top-1 left-12 animate-bounce-subtle pointer-events-none select-none text-xl">✨</div>
        <div className="absolute top-2 right-1/3 animate-wiggle pointer-events-none select-none text-xl">⚡</div>

        {/* Hyperpop Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
          <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#FF3AF2] via-[#7B2FFF] to-[#00F5D4] border-4 border-[#FFE600] shadow-[4px_4px_0_#FF3AF2] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            <Ticket className="h-6 w-6 text-white animate-pulse" />
          </div>

          <div className="flex flex-col">
            <span className="text-2xl font-black uppercase tracking-tighter gradient-text-dopamine text-shadow-triple" style={{ fontFamily: 'var(--font-display), sans-serif' }}>
              BD GOTICKET 🔥
            </span>
            <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#00F5D4] -mt-1 font-mono">
              ⚡ MAXIMALIST DOPAMINE MATRIX
            </span>
          </div>
        </Link>

        {/* Desktop 5-Accent Navigation */}
        <nav className="hidden md:flex items-center space-x-3">
          {[
            { path: '/', label: 'Home', idx: 0 },
            { path: '/search', label: 'Search Matrix', idx: 1 },
            { path: '/seat-selection', label: 'Seat Layouts', idx: 2 },
          ].map(nav => {
            const acc = accentColors[nav.idx % accentColors.length];
            const active = isActive(nav.path);
            return (
              <Link
                key={nav.path}
                href={nav.path}
                className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-full border-4 transition-all duration-300 ${acc.border} ${
                  active 
                    ? `${acc.bg} ${acc.text} ${acc.shadow} scale-105 rotate-1` 
                    : 'bg-[#2D1B4E]/80 text-white hover:scale-105 hover:-rotate-1 hover:bg-[#FF3AF2] hover:text-white shadow-[3px_3px_0_#00F5D4]'
                }`}
              >
                {nav.label}
              </Link>
            );
          })}

          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-full border-4 border-[#FF6B35] transition-all duration-300 ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'bg-[#FF6B35] text-white shadow-[4px_4px_0_#FFE600] scale-105'
                  : 'bg-[#2D1B4E]/80 text-white hover:bg-[#FF6B35] hover:scale-105 shadow-[3px_3px_0_#00F5D4]'
              }`}
            >
              {user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? 'Admin Dashboard' : 'My Dashboard'}
            </Link>
          )}
        </nav>

        {/* Right Actions & Language Toggle */}
        <div className="flex items-center space-x-3">
          
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 border-4 border-[#FFE600] bg-[#FF3AF2] px-3.5 py-2 rounded-full text-xs font-black text-white shadow-[4px_4px_0_#00F5D4] hover:scale-105 hover:rotate-2 cursor-pointer transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#FFE600]" />
            <span className={language === 'en' ? 'text-[#FFE600] font-black' : 'text-white/80'}>EN</span>
            <span>|</span>
            <span className={language === 'bn' ? 'text-[#00F5D4] font-black' : 'text-white/80'}>বাংলা</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-2 border-4 border-[#00F5D4] bg-[#7B2FFF] py-1.5 px-3.5 rounded-full text-xs text-white font-black uppercase tracking-wider shadow-[4px_4px_0_#FF3AF2] hover:scale-105"
              >
                <div className="h-6 w-6 rounded-full bg-[#FFE600] text-[#0D0D1A] flex items-center justify-center font-black text-[10px]">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.first_name || user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2.5 border-4 border-[#FFE600] bg-[#FF6B35] text-white rounded-full hover:bg-red-600 shadow-[4px_4px_0_#FF3AF2] hover:scale-110 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:text-[#00F5D4]"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="dopamine-btn-primary text-xs py-2.5 px-5 shadow-[4px_4px_0_#FFE600]"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 bg-[#FF3AF2] border-4 border-[#FFE600] rounded-2xl shadow-[4px_4px_0_#00F5D4] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t-4 border-[#FF3AF2] bg-[#0D0D1A] px-4 pt-3 pb-6 space-y-3 pattern-stripes"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 font-black text-xs uppercase tracking-wider text-white bg-[#FF3AF2] border-4 border-[#FFE600] rounded-2xl shadow-[4px_4px_0_#00F5D4]"
            >
              Home
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 font-black text-xs uppercase tracking-wider text-[#0D0D1A] bg-[#00F5D4] border-4 border-[#FF3AF2] rounded-2xl shadow-[4px_4px_0_#FFE600]"
            >
              Search Matrix
            </Link>
            <Link
              href="/seat-selection"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 font-black text-xs uppercase tracking-wider text-[#0D0D1A] bg-[#FFE600] border-4 border-[#7B2FFF] rounded-2xl shadow-[4px_4px_0_#FF3AF2]"
            >
              Seat Layouts & Gmail OTP
            </Link>

            {!user && (
              <div className="pt-3 flex flex-col space-y-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 border-4 border-[#00F5D4] bg-[#2D1B4E] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-[4px_4px_0_#FF3AF2]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 dopamine-btn-primary text-xs uppercase tracking-wider shadow-[4px_4px_0_#FFE600]"
                >
                  Register Account
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};


