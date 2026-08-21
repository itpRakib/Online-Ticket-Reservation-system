'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, X, Terminal, Sparkles, User } from 'lucide-react';
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
      transition={{ duration: 0.15, ease: "linear" }}
      className="sticky top-0 z-50 w-full bg-[#0a0a0a] border-b border-[#1f521f] font-mono text-[#33ff00]"
    >
      {/* Shell Title Bar Header */}
      <div className="bg-[#1f521f] text-[#33ff00] px-4 py-1 text-[11px] flex justify-between items-center tracking-wider">
        <span>root@bdgoticket:~# ./init_nav_matrix.sh</span>
        <span className="text-[#ffb000]">[ STATUS: 200 OK ]</span>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        
        {/* Terminal Shell Logo */}
        <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
          <div className="flex items-center justify-center h-8 w-8 border border-[#33ff00] bg-[#0a0a0a] text-[#33ff00] group-hover:bg-[#33ff00] group-hover:text-[#0a0a0a] transition-all duration-150">
            <Terminal className="h-4 w-4" />
          </div>

          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-wider text-phosphor-green">
              [BD-GOTICKET:~$]
            </span>
            <span className="text-[9px] text-[#ffb000] tracking-widest -mt-1 font-mono">
              MAINFRAME v2088
            </span>
          </div>
        </Link>

        {/* Desktop Monospace Navigation Tabs (Cleaned: NO seat-selection link) */}
        <nav className="hidden md:flex items-center space-x-2 text-xs font-mono tracking-wider uppercase">
          {[
            { path: '/', label: '[ 01: HOME ]' },
            { path: '/search', label: '[ 02: SEARCH MATRIX ]' },
          ].map(nav => {
            const active = isActive(nav.path);
            return (
              <Link
                key={nav.path}
                href={nav.path}
                className={`px-3 py-1.5 border transition-all duration-150 ${
                  active 
                    ? 'border-[#33ff00] bg-[#33ff00] text-[#0a0a0a] font-bold shadow-[0_0_10px_rgba(51,255,0,0.5)]' 
                    : 'border-transparent text-[#33ff00]/80 hover:border-[#33ff00] hover:bg-[#1f521f]/30'
                }`}
              >
                {nav.label}
              </Link>
            );
          })}

          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-3 py-1.5 border transition-all duration-150 ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'border-[#ffb000] bg-[#ffb000] text-[#0a0a0a] font-bold'
                  : 'border-transparent text-[#ffb000] hover:border-[#ffb000] hover:bg-[#ffb000]/10'
              }`}
            >
              {user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '[ 03: ADMIN CONSOLE ]' : '[ 03: DASHBOARD ]'}
            </Link>
          )}
        </nav>

        {/* Right Actions & Language Toggle */}
        <div className="flex items-center space-x-3 text-xs">
          
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1 border border-[#1f521f] bg-[#0a0a0a] px-2.5 py-1 text-xs font-mono text-[#33ff00] hover:border-[#33ff00] cursor-pointer transition-all"
          >
            <Sparkles className="h-3 w-3 text-[#ffb000]" />
            <span className={language === 'en' ? 'text-[#33ff00] font-bold' : 'text-[#33ff00]/50'}>EN</span>
            <span className="text-[#1f521f]">|</span>
            <span className={language === 'bn' ? 'text-[#ffb000] font-bold' : 'text-[#33ff00]/50'}>BN</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-1.5 border border-[#33ff00] bg-[#0a0a0a] py-1 px-2.5 text-xs text-[#33ff00] hover:bg-[#33ff00] hover:text-[#0a0a0a] transition-all"
              >
                <User className="h-3 w-3" />
                <span className="hidden sm:inline max-w-[90px] truncate">{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-1.5 border border-[#ff3333] text-[#ff3333] hover:bg-[#ff3333] hover:text-white transition-all cursor-pointer"
                title="Logout System"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                href="/auth/login"
                className="cli-btn-outline text-xs h-8 px-3"
              >
                [ LOGIN ]
              </Link>
              <Link
                href="/auth/register"
                className="cli-btn-primary text-xs h-8 px-3"
              >
                [ REGISTER ]
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 border border-[#33ff00] text-[#33ff00] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu (Cleaned: NO seat-selection link) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#1f521f] bg-[#0a0a0a] px-4 pt-3 pb-5 space-y-2 font-mono text-xs uppercase"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-[#0a0a0a] bg-[#33ff00] font-bold border border-[#33ff00]"
            >
              &gt; 01: HOME
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-[#33ff00] border border-[#1f521f] hover:border-[#33ff00]"
            >
              &gt; 02: SEARCH MATRIX
            </Link>

            {!user && (
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 border border-[#ffb000] text-[#ffb000]"
                >
                  [ LOGIN ]
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 border border-[#33ff00] bg-[#33ff00] text-[#0a0a0a] font-bold"
                >
                  [ REGISTER ]
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};




