'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, X, Sparkles, User, Edit3 } from 'lucide-react';
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
      className="sticky top-0 z-50 w-full bg-[#fdfbf7] border-b-[3px] border-[#2d2d2d] font-body text-[#2d2d2d]"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative">
        
        {/* Hand-Drawn Brand Logo */}
        <Link href="/" className="flex items-center space-x-2.5 group cursor-pointer">
          <div className="flex items-center justify-center h-10 w-10 border-[3px] border-[#2d2d2d] bg-[#fff9c4] text-[#2d2d2d] wobbly-box shadow-[3px_3px_0px_#2d2d2d] group-hover:rotate-6 transition-transform">
            <Edit3 className="h-5 w-5 text-[#ff4d4d]" />
          </div>

          <div className="flex flex-col">
            <span className="text-2xl font-bold font-heading text-[#2d2d2d] group-hover:text-[#ff4d4d] transition-colors">
              BD GOTICKET<span className="text-[#ff4d4d]">.</span>
            </span>
            <span className="text-xs font-body text-[#2d5da1] -mt-1 font-bold tracking-wide">
              ✏️ Hand-Drawn Transit Sketchbook
            </span>
          </div>
        </Link>

        {/* Navigation Links in Handwritten Style */}
        <nav className="hidden md:flex items-center space-x-4 font-body text-xl font-bold">
          {[
            { path: '/', label: 'Home' },
            { path: '/search', label: 'Search Matrix' },
          ].map(nav => {
            const active = isActive(nav.path);
            return (
              <Link
                key={nav.path}
                href={nav.path}
                className={`px-3 py-1 border-[2.5px] wobbly-btn transition-all duration-150 ${
                  active 
                    ? 'border-[#2d2d2d] bg-[#ff4d4d] text-white shadow-[3px_3px_0px_#2d2d2d] -rotate-1' 
                    : 'border-transparent text-[#2d2d2d] hover:border-[#2d2d2d] hover:bg-[#fff9c4] hover:shadow-[2px_2px_0px_#2d2d2d] hover:rotate-1'
                }`}
              >
                {nav.label}
              </Link>
            );
          })}

          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-3 py-1 border-[2.5px] wobbly-btn transition-all duration-150 ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'border-[#2d2d2d] bg-[#2d5da1] text-white shadow-[3px_3px_0px_#2d2d2d]'
                  : 'border-transparent text-[#2d5da1] hover:border-[#2d2d2d] hover:bg-[#e5e0d8]'
              }`}
            >
              {user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? 'Admin Console' : 'Dashboard'}
            </Link>
          )}
        </nav>

        {/* Right Actions & Language Toggle */}
        <div className="flex items-center space-x-3 text-base">
          
          {/* Language Switcher Badge */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 border-[2.5px] border-[#2d2d2d] bg-[#fff9c4] px-3 py-1 font-body font-bold text-[#2d2d2d] wobbly-badge shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#e5e0d8] cursor-pointer transition-all"
          >
            <Sparkles className="h-4 w-4 text-[#ff4d4d]" />
            <span className={language === 'en' ? 'text-[#ff4d4d] font-bold underline' : 'text-[#2d2d2d]'}>EN</span>
            <span className="text-[#2d2d2d]/40">|</span>
            <span className={language === 'bn' ? 'text-[#2d5da1] font-bold underline' : 'text-[#2d2d2d]'}>BN</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-2">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-1.5 border-[2.5px] border-[#2d2d2d] bg-white py-1 px-3 text-base font-bold text-[#2d2d2d] wobbly-btn shadow-[3px_3px_0px_#2d2d2d] hover:bg-[#ff4d4d] hover:text-white transition-all"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[100px] truncate">{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 border-[2.5px] border-[#2d2d2d] bg-[#ff4d4d] text-white wobbly-btn shadow-[3px_3px_0px_#2d2d2d] hover:bg-[#2d2d2d] transition-all cursor-pointer"
                title="Logout System"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="hand-btn-secondary text-base h-10 px-4"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="hand-btn-primary text-base h-10 px-4"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 border-[2.5px] border-[#2d2d2d] bg-[#fff9c4] text-[#2d2d2d] wobbly-box shadow-[2px_2px_0px_#2d2d2d] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t-[3px] border-[#2d2d2d] bg-[#fdfbf7] px-4 pt-3 pb-5 space-y-3 font-body text-xl font-bold"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-[#2d2d2d] bg-[#fff9c4] border-[2.5px] border-[#2d2d2d] wobbly-box shadow-[3px_3px_0px_#2d2d2d]"
            >
              ✏️ Home
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 text-[#2d2d2d] border-[2.5px] border-[#2d2d2d] wobbly-box hover:bg-[#e5e0d8]"
            >
              🔍 Search Matrix
            </Link>

            {!user && (
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 border-[2.5px] border-[#2d2d2d] bg-[#e5e0d8] text-[#2d2d2d] wobbly-btn shadow-[3px_3px_0px_#2d2d2d]"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 border-[2.5px] border-[#2d2d2d] bg-[#ff4d4d] text-white font-bold wobbly-btn shadow-[3px_3px_0px_#2d2d2d]"
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





