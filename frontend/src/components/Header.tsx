'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Ticket, LogOut, Sun, Moon } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export const Header: React.FC = () => {
  const { user, logout, language, toggleLanguage } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);
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

  // Dynamic date for Explore Routes link
  const today = new Date().toISOString().split('T')[0];

  return (
    <motion.header
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" }
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[var(--bg-deep)]/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center mr-1 transform scale-110">
            <div className="boxes">
              <div className="box">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div className="box">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div className="box">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div className="box">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
          <span className="hidden text-lg font-bold text-[#2A5B60] dark:text-[#F3F3F3] tracking-tight sm:block" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            BD GoTicket
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') ? 'text-[#6F9526] bg-[#6F9526]/15 font-extrabold' : 'text-[#444E29] dark:text-slate-300 hover:text-[#2A5B60] hover:bg-[#C5D050]/20'
            }`}
          >
            Home
          </Link>
          <Link
            href="/search"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive('/search') ? 'text-[#6F9526] bg-[#6F9526]/15 font-extrabold' : 'text-[#444E29] dark:text-slate-300 hover:text-[#2A5B60] hover:bg-[#C5D050]/20'
            }`}
          >
            Transit Matrix
          </Link>
          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'text-[#2A5B60] bg-[#C5D050]/30 font-extrabold border border-[#C5D050]/60'
                  : 'text-[#444E29] dark:text-slate-300 hover:text-[#2A5B60] hover:bg-[#C5D050]/20'
              }`}
            >
              {user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '🛡️ Admin Terminal' : 'My Dashboard'}
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 rounded-lg border border-[#2A5B60]/20 bg-[#F3F3F3] dark:bg-[#1C2E31] px-3 py-1.5 text-xs font-semibold transition-all text-[#444E29] dark:text-slate-300 hover:border-[#6F9526] cursor-pointer print:hidden shadow-sm"
          >
            <span>🌐</span>
            <span className={language === 'en' ? 'text-[#6F9526] font-bold' : ''}>EN</span>
            <span className="text-[#444E29]/40">|</span>
            <span className={language === 'bn' ? 'text-[#6F9526] font-bold' : ''}>বাংলা</span>
          </button>

          {/* Theme Toggler Button */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-[#444E29] dark:text-slate-300 hover:bg-[#C5D050]/20 border border-[#2A5B60]/20 bg-[#F3F3F3] dark:bg-[#1C2E31] transition-all cursor-pointer flex items-center justify-center print:hidden h-8 w-8 shadow-sm"
            title={theme === 'dark' ? 'Activate Light Mode' : 'Activate Dark Mode'}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex items-center justify-center"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-[#C5D050]" />
              ) : (
                <Moon className="h-4 w-4 text-[#2A5B60]" />
              )}
            </motion.div>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-2 rounded-full bg-[#F3F3F3] dark:bg-[#1C2E31] border border-[#2A5B60]/20 py-1.5 px-3 text-sm text-[#2A5B60] dark:text-slate-200 hover:bg-[#C5D050]/20 transition-colors shadow-sm"
              >
                <div className="h-6 w-6 rounded-full flex items-center justify-center font-bold text-[11px] uppercase text-white" style={{ backgroundColor: '#2A5B60' }}>
                  {user.username.substring(0, 2)}
                </div>
                <span className="hidden sm:inline font-bold max-w-[120px] truncate">{user.first_name || user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-[#444E29] hover:text-red-600 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="px-3 py-2 text-sm font-bold text-[#2A5B60] dark:text-slate-300 hover:text-[#6F9526] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl px-4 py-2 text-sm font-bold text-[#2A5B60] transition-all hover:opacity-90 hover:scale-[1.02] shadow-md border border-[#C5D050]"
                style={{ backgroundColor: '#C5D050' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6F9526]/30 to-transparent" />
    </motion.header>
  );
};
