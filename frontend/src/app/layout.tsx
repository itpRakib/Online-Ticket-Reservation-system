import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InitialPreloader } from "@/components/InitialPreloader";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "700", "800", "900"],
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
  title: "BD GoTicket — Maximalist Dopamine Transit Matrix",
  description: "Sensory overload multi-modal ticket reservation for Bangladesh. Bus, Train, and Flight tickets with Gmail OTP verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="font-body min-h-full flex flex-col bg-[#0D0D1A] text-white relative overflow-x-hidden selection:bg-[#FF3AF2] selection:text-white pattern-dots">
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
