'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, X, Terminal, Sparkles, User, Shield } from 'lucide-react';
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

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.2, ease: "linear" }}
      className="sticky top-0 z-50 w-full bg-[#090014]/90 backdrop-blur-md border-b-2 border-[#00FFFF] shadow-[0_4px_25px_rgba(0,255,255,0.25)]"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        
        {/* Outrun Terminal Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
          <div className="flex items-center justify-center h-10 w-10 border-2 border-[#FF00FF] bg-[#1a103c] text-[#00FFFF] shadow-[0_0_15px_#FF00FF] group-hover:scale-105 group-hover:border-[#00FFFF] transition-all duration-200">
            <Terminal className="h-5 w-5 text-[#00FFFF] animate-pulse" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black uppercase tracking-wider font-heading gradient-text-sunset drop-shadow-neon-magenta">
              &gt; BD GOTICKET_
            </span>
            <span className="text-[10px] uppercase tracking-widest font-mono text-[#00FFFF] -mt-1 drop-shadow-[0_0_5px_#00FFFF]">
              SYSTEM VER 2088 // MULTI-TRANSIT
            </span>
          </div>
        </Link>

        {/* Desktop Monospace Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-2 font-mono text-sm tracking-wider uppercase">
          {[
            { path: '/', label: '> HOME' },
            { path: '/search', label: '> SEARCH MATRIX' },
            { path: '/seat-selection', label: '> SEATS & OTP' },
          ].map(nav => {
            const active = isActive(nav.path);
            return (
              <Link
                key={nav.path}
                href={nav.path}
                className={`px-4 py-2 border transition-all duration-200 ${
                  active 
                    ? 'border-[#FF00FF] bg-[#FF00FF]/20 text-[#00FFFF] drop-shadow-[0_0_8px_#00FFFF] shadow-[0_0_15px_rgba(255,0,255,0.4)]' 
                    : 'border-transparent text-[#E0E0E0]/80 hover:border-[#00FFFF]/50 hover:text-[#00FFFF] hover:bg-[rgba(0,255,255,0.08)]'
                }`}
              >
                {nav.label}
              </Link>
            );
          })}

          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-4 py-2 border transition-all duration-200 ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'border-[#FF9900] bg-[#FF9900]/20 text-[#FF9900] drop-shadow-[0_0_8px_#FF9900]'
                  : 'border-transparent text-[#FF9900]/90 hover:border-[#FF9900] hover:bg-[#FF9900]/10'
              }`}
            >
              {user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '> ADMIN CONSOLE' : '> DASHBOARD'}
            </Link>
          )}
        </nav>

        {/* Right Actions & Language Toggle */}
        <div className="flex items-center space-x-3">
          
          {/* Outrun Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 border border-[#FF00FF] bg-[#1a103c] px-3 py-1.5 text-xs font-mono text-[#00FFFF] hover:border-[#00FFFF] hover:shadow-[0_0_12px_#00FFFF] cursor-pointer transition-all duration-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#FF9900]" />
            <span className={language === 'en' ? 'text-[#00FFFF] font-bold' : 'text-[#E0E0E0]/60'}>EN</span>
            <span className="text-[#FF00FF]">|</span>
            <span className={language === 'bn' ? 'text-[#FF00FF] font-bold' : 'text-[#E0E0E0]/60'}>BN</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-2 border border-[#00FFFF] bg-[#1a103c] py-1 px-3 text-xs font-mono text-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.3)] hover:border-[#FF00FF] transition-all"
              >
                <User className="h-3.5 w-3.5 text-[#FF00FF]" />
                <span className="hidden sm:inline max-w-[100px] truncate">{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 border border-[#FF00FF] bg-transparent text-[#FF00FF] hover:bg-[#FF00FF] hover:text-white shadow-[0_0_10px_rgba(255,0,255,0.4)] transition-all cursor-pointer"
                title="Logout System"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="vapor-btn-outline text-xs h-10 px-4"
              >
                <span className="unskew">&gt; SIGN IN</span>
              </Link>
              <Link
                href="/auth/register"
                className="vapor-btn-primary text-xs h-10 px-4"
              >
                <span className="unskew">&gt; REGISTER</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-[#1a103c] border border-[#00FFFF] text-[#00FFFF] shadow-[0_0_10px_#00FFFF] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Terminal Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#00FFFF] bg-[#090014] px-4 pt-3 pb-6 space-y-2 font-mono text-sm uppercase"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-[#00FFFF] border border-[#FF00FF] bg-[#1a103c]"
            >
              &gt; HOME
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-[#E0E0E0] border border-[#2D1B4E] hover:border-[#00FFFF]"
            >
              &gt; SEARCH MATRIX
            </Link>
            <Link
              href="/seat-selection"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-[#E0E0E0] border border-[#2D1B4E] hover:border-[#00FFFF]"
            >
              &gt; SEATS & GMAIL OTP
            </Link>

            {!user && (
              <div className="pt-3 flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-[#FF00FF] text-[#FF00FF]"
                >
                  &gt; SIGN IN
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-[#00FFFF] bg-[#00FFFF] text-black font-bold"
                >
                  &gt; REGISTER ACCOUNT
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};



