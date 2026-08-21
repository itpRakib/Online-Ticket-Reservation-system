'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, X, Ticket, Sparkles, Globe } from 'lucide-react';
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
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full bg-[#E0E5EC] border-none shadow-[9px_9px_16px_rgba(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Soft UI Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
          <div className="flex items-center justify-center h-11 w-11 rounded-2xl bg-[#E0E5EC] shadow-[inset_6px_6px_10px_rgba(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)] text-[#6C63FF] group-hover:scale-105 transition-transform duration-300">
            <Ticket className="h-6 w-6" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-[#3D4852]" style={{ fontFamily: 'var(--font-display), sans-serif' }}>
              BD GOTICKET
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#6C63FF] -mt-0.5">
              SOFT UI TRANSIT HUB
            </span>
          </div>
        </Link>

        {/* Desktop Neumorphic Navigation */}
        <nav className="hidden md:flex items-center space-x-3">
          <Link
            href="/"
            className={`px-5 py-2.5 text-xs font-bold rounded-2xl transition-all duration-300 ${
              isActive('/') 
                ? 'bg-[#6C63FF] text-white shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)]' 
                : 'bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5'
            }`}
          >
            Home
          </Link>
          <Link
            href="/search"
            className={`px-5 py-2.5 text-xs font-bold rounded-2xl transition-all duration-300 ${
              isActive('/search') 
                ? 'bg-[#6C63FF] text-white shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)]' 
                : 'bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5'
            }`}
          >
            Search Routes
          </Link>
          <Link
            href="/seat-selection"
            className={`px-5 py-2.5 text-xs font-bold rounded-2xl transition-all duration-300 ${
              isActive('/seat-selection') 
                ? 'bg-[#6C63FF] text-white shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)]' 
                : 'bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5'
            }`}
          >
            Seat Selector
          </Link>
          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-5 py-2.5 text-xs font-bold rounded-2xl transition-all duration-300 ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'bg-[#6C63FF] text-white shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)]'
                  : 'bg-[#E0E5EC] text-[#3D4852] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] hover:-translate-y-0.5'
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
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-[#E0E5EC] shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] text-xs font-bold text-[#3D4852] cursor-pointer hover:opacity-90 transition-opacity"
          >
            <Globe className="h-3.5 w-3.5 text-[#6C63FF]" />
            <span className={language === 'en' ? 'text-[#6C63FF] font-extrabold' : 'text-[#6B7280]'}>EN</span>
            <span className="text-[#6B7280]">|</span>
            <span className={language === 'bn' ? 'text-[#6C63FF] font-extrabold' : 'text-[#6B7280]'}>বাংলা</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] text-xs text-[#3D4852] font-bold transition-all duration-300"
              >
                <div className="h-7 w-7 rounded-xl bg-[#6C63FF] text-white flex items-center justify-center font-extrabold text-[11px] shadow-sm">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.first_name || user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2.5 rounded-2xl bg-[#E0E5EC] text-red-500 shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="px-4 py-2.5 text-xs font-bold text-[#3D4852] rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.7),-12px_-12px_20px_rgba(255,255,255,0.6)] transition-all duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2.5 text-xs font-bold text-white rounded-2xl bg-[#6C63FF] shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)] hover:bg-[#8B84FF] transition-all duration-300"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-2xl bg-[#E0E5EC] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.5)] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-[#3D4852]" /> : <Menu className="h-5 w-5 text-[#3D4852]" />}
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
            className="md:hidden bg-[#E0E5EC] px-4 pt-3 pb-6 space-y-3 shadow-[inset_6px_6px_10px_rgba(163,177,198,0.6),inset_-6px_-6px_10px_rgba(255,255,255,0.5)]"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-2xl font-bold text-xs text-[#3D4852] bg-[#E0E5EC] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
            >
              Home
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-2xl font-bold text-xs text-[#3D4852] bg-[#E0E5EC] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
            >
              Search Routes
            </Link>
            <Link
              href="/seat-selection"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-2xl font-bold text-xs text-[#3D4852] bg-[#E0E5EC] shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
            >
              Seat Layouts & OTP Verification
            </Link>

            {!user && (
              <div className="pt-3 flex flex-col space-y-2.5">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-2xl bg-[#E0E5EC] text-[#3D4852] font-bold text-xs shadow-[5px_5px_10px_rgba(163,177,198,0.6),-5px_-5px_10px_rgba(255,255,255,0.5)]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-2xl bg-[#6C63FF] text-white font-bold text-xs shadow-[6px_6px_14px_rgba(108,99,255,0.4),-6px_-6px_14px_rgba(255,255,255,0.4)]"
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

