import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InitialPreloader } from "@/components/InitialPreloader";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "root@bdgoticket:~# ./init_matrix",
  description: "Terminal CLI Cyber-Industrial Multi-Modal Transit Reservation Mainframe for Bangladesh. Bus, Train, and Flight Node booking with Gmail OTP authorization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetBrainsMono.variable} h-full antialiased dark`}>
      <body className="font-mono min-h-full flex flex-col bg-[#0a0a0a] text-[#33ff00] relative overflow-x-hidden selection:bg-[#33ff00] selection:text-[#0a0a0a]">
        {/* CRT Scanline Overlay */}
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


