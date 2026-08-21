'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, X, Sparkles, Ticket } from 'lucide-react';
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
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full border-b-2 border-[#D4AF37]/40 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_4px_25px_rgba(0,0,0,0.9)]"
    >
      {/* Top Metallic Gold Accent Bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Art Deco Brand Logo */}
        <Link href="/" className="flex items-center space-x-3.5 group cursor-pointer">
          {/* Rotated 45-Degree Gold Diamond Emblem */}
          <div className="h-9 w-9 art-deco-diamond border-2 border-[#D4AF37] bg-[#141414] shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform duration-500 group-hover:rotate-[225deg]">
            <Ticket className="h-4 w-4 text-[#D4AF37]" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-black uppercase tracking-[0.25em] text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              BD GOTICKET
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-mono -mt-1">
              EST. 1925 • IMPERIAL TRANSIT MATRIX
            </span>
          </div>
        </Link>

        {/* Desktop Art Deco Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          <Link
            href="/"
            className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-bold transition-all border-b-2 ${
              isActive('/') 
                ? 'text-[#D4AF37] border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'text-[#F2F0E4]/80 border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
            }`}
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            I. Home
          </Link>
          <Link
            href="/search"
            className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-bold transition-all border-b-2 ${
              isActive('/search') 
                ? 'text-[#D4AF37] border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'text-[#F2F0E4]/80 border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
            }`}
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            II. Transit Matrix
          </Link>
          <Link
            href="/seat-selection"
            className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-bold transition-all border-b-2 ${
              isActive('/seat-selection') 
                ? 'text-[#D4AF37] border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'text-[#F2F0E4]/80 border-transparent hover:text-[#D4AF37] hover:border-[#D4AF37]/50'
            }`}
            style={{ fontFamily: 'var(--font-heading), serif' }}
          >
            III. Seat Layouts
          </Link>
          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] font-bold transition-all border-b-2 ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'text-[#F2E8C4] border-[#D4AF37] bg-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                  : 'text-[#F2F0E4]/80 border-transparent hover:text-[#D4AF37]'
              }`}
              style={{ fontFamily: 'var(--font-heading), serif' }}
            >
              {user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? 'IV. 🛡️ Admin Terminal' : 'IV. My Terminal'}
            </Link>
          )}
        </nav>

        {/* Right Actions & Language Toggle */}
        <div className="flex items-center space-x-4">
          
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 border border-[#D4AF37]/40 bg-[#141414] px-3 py-1.5 text-xs font-bold transition-all text-[#F2F0E4] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 cursor-pointer shadow-sm"
          >
            <span className="text-[#D4AF37]">🌐</span>
            <span className={language === 'en' ? 'text-[#D4AF37] font-black' : 'text-[#888888]'}>EN</span>
            <span className="text-[#D4AF37]/40">|</span>
            <span className={language === 'bn' ? 'text-[#D4AF37] font-black' : 'text-[#888888]'}>বাংলা</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-2 border border-[#D4AF37]/50 bg-[#141414] py-1.5 px-3 text-xs text-[#F2F0E4] hover:border-[#D4AF37] transition-all shadow-[0_0_10px_rgba(212,175,55,0.15)]"
              >
                <div className="h-6 w-6 border border-[#D4AF37] bg-[#0A0A0A] flex items-center justify-center font-black text-[10px] uppercase text-[#D4AF37]">
                  {user.username.substring(0, 2)}
                </div>
                <span className="hidden sm:inline font-bold uppercase tracking-wider max-w-[110px] truncate">{user.first_name || user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 border border-red-500/30 text-slate-400 hover:text-red-400 hover:border-red-500/60 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#F2F0E4] hover:text-[#D4AF37] transition-colors"
                style={{ fontFamily: 'var(--font-heading), serif' }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="art-deco-button-solid text-xs py-2 px-4 shadow-lg"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#D4AF37] bg-[#141414] border border-[#D4AF37]/40 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
            className="md:hidden border-t border-[#D4AF37]/30 bg-[#0A0A0A] px-4 pt-3 pb-6 space-y-3"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 font-bold text-xs uppercase tracking-[0.2em] text-[#F2F0E4] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border-l-2 border-transparent hover:border-[#D4AF37]"
            >
              I. Home
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 font-bold text-xs uppercase tracking-[0.2em] text-[#F2F0E4] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border-l-2 border-transparent hover:border-[#D4AF37]"
            >
              II. Transit Matrix
            </Link>
            <Link
              href="/seat-selection"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 font-bold text-xs uppercase tracking-[0.2em] text-[#F2F0E4] hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] border-l-2 border-transparent hover:border-[#D4AF37]"
            >
              III. Seat Layouts & Gmail OTP
            </Link>

            {!user && (
              <div className="pt-3 flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-[#D4AF37]/40 text-[#F2F0E4] font-bold text-xs uppercase tracking-[0.2em]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 art-deco-button-solid text-xs uppercase tracking-[0.2em]"
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
