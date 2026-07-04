'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Ticket, Train, Bus, Plane, LogOut, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout, language, toggleLanguage } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg transition-transform group-hover:scale-105">
            <Ticket className="h-5 w-5 rotate-12 transition-transform group-hover:rotate-0" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-slate-950" />
          </div>
          <span className="hidden text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent sm:block">
            BD GoTicket
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
              isActive('/') ? 'text-emerald-400' : 'text-slate-300'
            }`}
          >
            Home
          </Link>
          <Link
            href="/search?source=DAC-BUS-G&destination=CGP-BUS-D&date=2026-06-29"
            className="text-sm font-medium transition-colors text-slate-300 hover:text-emerald-400"
          >
            Explore Routes
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-emerald-400 ${
                isActive('/dashboard') ? 'text-emerald-400' : 'text-slate-300'
              }`}
            >
              My Bookings
            </Link>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-850 bg-slate-900 px-3 py-1.5 text-xs font-bold transition-all text-slate-350 hover:text-white hover:border-slate-700 cursor-pointer print:hidden"
          >
            <span>🌐</span>
            <span className={language === 'en' ? 'text-emerald-400 font-extrabold' : ''}>EN</span>
            <span className="text-slate-600 font-normal">|</span>
            <span className={language === 'bn' ? 'text-emerald-400 font-extrabold' : ''}>বাংলা</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 rounded-full bg-slate-900 border border-slate-800 py-1.5 px-3.5 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs uppercase">
                  {user.username.substring(0, 2)}
                </div>
                <span className="hidden sm:inline font-medium max-w-[120px] truncate">{user.first_name || user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-emerald-500/10 transition-all hover:scale-[1.02]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
