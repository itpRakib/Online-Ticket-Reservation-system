import React from 'react';
import { Ticket, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-white/5 text-slate-400 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
                <Ticket className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white">BD GoTicket</span>
            </div>
            <p className="text-sm max-w-sm">
              Bangladesh's leading multi-modal online ticketing platform. Book your Bus, Train, and Plane tickets seamlessly with instant Bangladeshi mobile banking and NID verification.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Supported Gateways</h3>
            <ul className="space-y-2 text-sm">
              <li>bKash Checkout</li>
              <li>Nagad Payment</li>
              <li>Rocket Wallet</li>
              <li>Local Debit/Credit Cards</li>
              <li>Internet Banking (DBBL, City Bank)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact & Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>support@bdgoticket.com.bd</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>Karwan Bazar, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>&copy; {new Date().getFullYear()} BD GoTicket. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
