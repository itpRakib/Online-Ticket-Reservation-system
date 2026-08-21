import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InitialPreloader } from "@/components/InitialPreloader";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-heading",
  display: "swap",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BD GOTICKET // VAPORWAVE TRANSIT MATRIX",
  description: "80s Retro-Futuristic Outrun ticket reservation platform for Bangladesh. Bus, Train, and Air travel with Gmail OTP verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${shareTechMono.variable} h-full antialiased dark`}>
      <body className="font-body min-h-full flex flex-col bg-[#090014] text-[#E0E0E0] relative overflow-x-hidden selection:bg-[#FF00FF] selection:text-black">
        {/* Global CRT Scanlines & Chromatic Overlay */}
        <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true" />
        
        <ThemeProvider>
          <AuthProvider>
            <InitialPreloader />
            <Header />
            <main className="flex-grow flex flex-col relative z-10">
              {children}
            </main>
            <ChatbotWidget />
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

