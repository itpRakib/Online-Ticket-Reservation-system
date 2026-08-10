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
          <span className="hidden text-xl font-black text-slate-900 dark:text-white tracking-tight sm:block bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            BD GoTicket
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            href="/"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive('/') 
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 font-bold border border-cyan-500/20 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Home
          </Link>
          <Link
            href="/search"
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
              isActive('/search') 
                ? 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 font-bold border border-cyan-500/20 shadow-sm' 
                : 'text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            Transit Matrix
          </Link>
          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 font-bold border border-indigo-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800/60'
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
            className="flex items-center space-x-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-bold transition-all text-slate-700 dark:text-slate-200 hover:border-cyan-500 cursor-pointer print:hidden shadow-sm"
          >
            <span>🌐</span>
            <span className={language === 'en' ? 'text-cyan-500 font-extrabold' : ''}>EN</span>
            <span className="text-slate-400">|</span>
            <span className={language === 'bn' ? 'text-cyan-500 font-extrabold' : ''}>বাংলা</span>
          </button>

          {/* Theme Toggler Button */}
          <button
            onClick={toggleTheme}
            className="rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 transition-all cursor-pointer flex items-center justify-center print:hidden h-9 w-9 shadow-sm"
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
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-indigo-600" />
              )}
            </motion.div>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-2 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 py-1.5 px-3 text-sm text-slate-800 dark:text-slate-200 hover:border-cyan-500 transition-colors shadow-sm"
              >
                <div className="h-6 w-6 rounded-full flex items-center justify-center font-extrabold text-[11px] uppercase text-white bg-gradient-to-tr from-cyan-500 to-indigo-600">
                  {user.username.substring(0, 2)}
                </div>
                <span className="hidden sm:inline font-bold max-w-[120px] truncate">{user.first_name || user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-xl p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-500 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl px-4 py-2 text-sm font-extrabold text-white transition-all hover:scale-[1.03] shadow-md bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:opacity-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
    </motion.header>
  );
};
