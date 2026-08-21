'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Menu, X, Ticket } from 'lucide-react';
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
      className="sticky top-0 z-50 w-full border-b-4 border-[#121212] bg-[#F0F0F0] shadow-[0_4px_0px_0px_#121212]"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Bauhaus Geometric Brand Logo (Circle 🔴, Square 🟦, Triangle 🔺) */}
        <Link href="/" className="flex items-center space-x-3.5 group cursor-pointer">
          {/* Constructivist Geometric Emblem */}
          <div className="flex items-center space-x-1 p-1.5 bg-[#FFFFFF] border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-transform">
            {/* Red Circle */}
            <div className="h-4 w-4 rounded-full bg-[#D02020] border-2 border-[#121212]" />
            {/* Blue Square */}
            <div className="h-4 w-4 bg-[#1040C0] border-2 border-[#121212]" />
            {/* Yellow Triangle */}
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#F0C020]" />
          </div>

          <div className="flex flex-col">
            <span className="text-2xl font-black uppercase tracking-tighter text-[#121212]" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              BD GOTICKET
            </span>
            <span className="text-[9px] uppercase tracking-widest font-black text-[#D02020] -mt-1">
              CONSTRUCTIVIST TRANSIT MATRIX
            </span>
          </div>
        </Link>

        {/* Desktop Bauhaus Navigation */}
        <nav className="hidden md:flex items-center space-x-3">
          <Link
            href="/"
            className={`px-4 py-2 text-xs uppercase tracking-wider font-black transition-all border-3 border-[#121212] ${
              isActive('/') 
                ? 'bg-[#D02020] text-white shadow-[4px_4px_0px_0px_#121212]' 
                : 'bg-white text-[#121212] hover:bg-[#F0C020] shadow-[3px_3px_0px_0px_#121212]'
            }`}
          >
            I. Home
          </Link>
          <Link
            href="/search"
            className={`px-4 py-2 text-xs uppercase tracking-wider font-black transition-all border-3 border-[#121212] ${
              isActive('/search') 
                ? 'bg-[#1040C0] text-white shadow-[4px_4px_0px_0px_#121212]' 
                : 'bg-white text-[#121212] hover:bg-[#F0C020] shadow-[3px_3px_0px_0px_#121212]'
            }`}
          >
            II. Search Matrix
          </Link>
          <Link
            href="/seat-selection"
            className={`px-4 py-2 text-xs uppercase tracking-wider font-black transition-all border-3 border-[#121212] ${
              isActive('/seat-selection') 
                ? 'bg-[#F0C020] text-[#121212] shadow-[4px_4px_0px_0px_#121212]' 
                : 'bg-white text-[#121212] hover:bg-[#F0C020] shadow-[3px_3px_0px_0px_#121212]'
            }`}
          >
            III. Seat Layouts
          </Link>
          {user && (
            <Link
              href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-black transition-all border-3 border-[#121212] ${
                isActive(user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard')
                  ? 'bg-[#D02020] text-white shadow-[4px_4px_0px_0px_#121212]'
                  : 'bg-white text-[#121212] hover:bg-[#F0C020] shadow-[3px_3px_0px_0px_#121212]'
              }`}
            >
              {user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? 'IV. Admin' : 'IV. Terminal'}
            </Link>
          )}
        </nav>

        {/* Right Actions & Language Toggle */}
        <div className="flex items-center space-x-3">
          
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center space-x-1.5 border-3 border-[#121212] bg-[#FFFFFF] px-3 py-1.5 text-xs font-black transition-all text-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:bg-[#F0C020] cursor-pointer"
          >
            <span>🌐</span>
            <span className={language === 'en' ? 'text-[#D02020] font-black' : 'text-[#666666]'}>EN</span>
            <span className="text-[#121212]">|</span>
            <span className={language === 'bn' ? 'text-[#1040C0] font-black' : 'text-[#666666]'}>বাংলা</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                href={user && (user.profile?.role === 'admin' || user.username.toLowerCase().includes('admin')) ? '/admin/dashboard' : '/dashboard'}
                className="flex items-center space-x-2 border-3 border-[#121212] bg-white py-1.5 px-3 text-xs text-[#121212] font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#121212] hover:bg-[#F0C020]"
              >
                <div className="h-6 w-6 rounded-full border-2 border-[#121212] bg-[#D02020] text-white flex items-center justify-center font-black text-[10px]">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.first_name || user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="p-2 border-3 border-[#121212] bg-[#D02020] text-white hover:bg-[#B01818] shadow-[3px_3px_0px_0px_#121212] transition-all cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-[#121212] hover:text-[#D02020]"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bauhaus-button-yellow text-xs py-2 px-4 shadow-[4px_4px_0px_0px_#121212]"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 bg-[#FFFFFF] border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-[#121212]" /> : <Menu className="h-5 w-5 text-[#121212]" />}
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
            className="md:hidden border-t-4 border-[#121212] bg-[#F0F0F0] px-4 pt-3 pb-6 space-y-3"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#121212] bg-white border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212]"
            >
              I. Home
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#121212] bg-white border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212]"
            >
              II. Search Matrix
            </Link>
            <Link
              href="/seat-selection"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 font-black text-xs uppercase tracking-wider text-[#121212] bg-white border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212]"
            >
              III. Seat Layouts & Gmail OTP
            </Link>

            {!user && (
              <div className="pt-3 flex flex-col space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border-3 border-[#121212] bg-white text-[#121212] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#121212]"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bauhaus-button-yellow text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_#121212]"
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
