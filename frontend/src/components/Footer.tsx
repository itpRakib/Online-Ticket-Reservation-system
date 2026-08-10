import React from 'react';
import { Ticket, Mail, Phone, MapPin, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md py-12 mt-auto text-slate-700 dark:text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md">
                <Ticket className="h-5 w-5" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
                BD GoTicket
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Bangladesh's next-gen multi-modal transit matrix reservation hub. Book your Bus, Train, and Plane tickets seamlessly with instant Bangladeshi mobile banking and NID verification.
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span>All Systems Operational</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider mb-4 text-cyan-600 dark:text-cyan-400">Supported Gateways</h3>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="hover:text-cyan-500 transition-colors">bKash Checkout</li>
              <li className="hover:text-cyan-500 transition-colors">Nagad Payment</li>
              <li className="hover:text-cyan-500 transition-colors">Rocket Wallet</li>
              <li className="hover:text-cyan-500 transition-colors">Local Debit/Credit Cards</li>
              <li className="hover:text-cyan-500 transition-colors">Internet Banking (DBBL, City Bank)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider mb-4 text-cyan-600 dark:text-cyan-400">Contact & Support</h3>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-cyan-500" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-cyan-500" />
                <span>sysadmin@matrix-transit.bd</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-cyan-500" />
                <span>Karwan Bazar, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} BD GoTicket. All rights reserved.</p>
          <div className="flex space-x-5 mt-4 sm:mt-0">
            <a href="#" className="hover:text-cyan-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-cyan-500 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
