import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InitialPreloader } from "@/components/InitialPreloader";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BD GoTicket — Soft UI Transit Reservation System",
  description: "Tactile Neumorphic ticket reservation for Bangladesh. Bus, Train, and Flight tickets with Gmail OTP verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="font-body min-h-full flex flex-col bg-[#E0E5EC] text-[#3D4852] relative overflow-x-hidden selection:bg-[#6C63FF] selection:text-white">
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
