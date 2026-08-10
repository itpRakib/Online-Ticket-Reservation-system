'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bot, MessageSquare, X, Send, Sparkles, Ticket, 
  CreditCard, ShieldCheck, ChevronRight, HelpCircle, User, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  actionUrl?: string;
  actionText?: string;
}

export function ChatbotWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Hello! 👋 I am your BD GoTicket AI Assistant. How can I help you navigate the system, book tickets, or verify your account today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // Simulate AI thinking and generate smart contextual responses
    setTimeout(() => {
      let botResponse = '';
      let actionUrl = undefined;
      let actionText = undefined;

      const q = query.toLowerCase();

      if (q.includes('book') || q.includes('ticket') || q.includes('search') || q.includes('bus') || q.includes('train') || q.includes('plane')) {
        botResponse = 'You can search and book Train, Bus, or Flight tickets across Bangladesh. Simply enter your departure and arrival stations on the home or search page!';
        actionUrl = '/search';
        actionText = 'Go to Trip Search 🚌✈️';
      } else if (q.includes('register') || q.includes('signup') || q.includes('account') || q.includes('nid')) {
        botResponse = 'Registration requires a valid @gmail.com address, 11-digit BD mobile SIM (01XXXXXXXXX), and National ID (NID) verification with the Election Commission database.';
        actionUrl = '/auth/register';
        actionText = 'Start Registration 🆔';
      } else if (q.includes('pay') || q.includes('bkash') || q.includes('nagad') || q.includes('rocket') || q.includes('card')) {
        botResponse = 'We support Instant Mobile Banking (bKash, Nagad, Rocket) and Debit/Credit cards. Payment verification generates an instant official PDF E-Ticket & PNR code!';
        actionUrl = '/dashboard';
        actionText = 'View My Bookings 💳';
      } else if (q.includes('admin') || q.includes('manage') || q.includes('analytics')) {
        botResponse = 'The Central Management Terminal allows authorized admins to view real-time user activity logs, onboarding metrics, and payment transactions.';
        actionUrl = '/admin/dashboard';
        actionText = 'Admin Dashboard Terminal 🔒';
      } else if (q.includes('help') || q.includes('contact') || q.includes('support')) {
        botResponse = 'Need human support? You can reach our 24/7 passenger hotline at 16374 or email support@bdgoticket.gov.bd.';
      } else {
        botResponse = `I processed your inquiry regarding "${query}". You can easily manage bookings, verify NID credentials, or search for upcoming inter-district trips!`;
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionUrl,
        actionText
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 750);
  };

  const quickPrompts = [
    'How to book a ticket?',
    'Registration & NID steps',
    'Payment options (bKash/Nagad)',
    'Admin Portal access'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2.5 rounded-full px-4 py-3.5 shadow-2xl text-white font-extrabold text-sm cursor-pointer transition-all border border-cyan-400/40 bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:scale-105"
          >
            <div className="relative">
              <Bot className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="font-extrabold tracking-wide hidden sm:inline">AI Helper</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Chatbot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ duration: 0.25 }}
            className="w-[92vw] sm:w-[380px] h-[520px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between shadow-md bg-gradient-to-r from-cyan-600 via-indigo-600 to-slate-900 text-white">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl flex items-center justify-center border border-white/20 bg-white/10 backdrop-blur-md">
                  <Bot className="h-6 w-6 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5 text-white">
                    <span>BD GoTicket Assistant</span>
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  </h3>
                  <p className="text-[10px] opacity-90 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Always Online • Intelligent Guide</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 opacity-80 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Suggestions Bar */}
            <div className="p-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-x-auto flex gap-1.5 no-scrollbar">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="shrink-0 text-[11px] font-bold px-3 py-1 rounded-xl border border-cyan-500/20 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-cyan-500 hover:text-cyan-500 transition-all cursor-pointer shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl space-y-2 shadow-sm ${
                      msg.sender === 'user'
                        ? 'rounded-tr-none bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-medium'
                        : 'rounded-tl-none text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.actionUrl && (
                      <button
                        onClick={() => { router.push(msg.actionUrl!); setIsOpen(false); }}
                        className="inline-flex items-center space-x-1.5 text-[11px] font-extrabold px-3 py-1.5 rounded-xl text-white shadow-sm hover:opacity-90 transition-all cursor-pointer mt-1 bg-gradient-to-r from-cyan-500 to-emerald-500"
                      >
                        <span>{msg.actionText}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-2xl w-24">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-500" />
                  <span className="text-[11px] font-bold">Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask assistant anything..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 text-xs transition-colors"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl text-white disabled:opacity-40 transition-all cursor-pointer bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:opacity-90"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
