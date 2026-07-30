import React from 'react';
import { Ticket, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#2A5B60]/20 py-12 mt-auto" style={{ backgroundColor: '#2A5B60', color: '#F3F3F3' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ backgroundColor: '#6F9526' }}>
                <Ticket className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>BD GoTicket</span>
            </div>
            <p className="text-sm opacity-90 max-w-sm leading-relaxed">
              Bangladesh's next-gen multi-modal transit matrix reservation hub. Book your Bus, Train, and Plane tickets seamlessly with instant Bangladeshi mobile banking and NID verification.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4 text-[#C5D050]">Supported Gateways</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>bKash Checkout</li>
              <li>Nagad Payment</li>
              <li>Rocket Wallet</li>
              <li>Local Debit/Credit Cards</li>
              <li>Internet Banking (DBBL, City Bank)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-4 text-[#C5D050]">Contact & Support</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-[#C5D050]" />
                <span>+880 1234 567890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-[#C5D050]" />
                <span>sysadmin@matrix-transit.bd</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-[#C5D050]" />
                <span>Karwan Bazar, Dhaka, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs opacity-80">
          <p>&copy; {new Date().getFullYear()} BD GoTicket. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-[#C5D050] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#C5D050] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#C5D050] transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
