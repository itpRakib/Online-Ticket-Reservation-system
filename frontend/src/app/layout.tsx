import type { Metadata } from "next";
import { Kalam, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InitialPreloader } from "@/components/InitialPreloader";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-heading",
  display: "swap",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "✏️ BD GoTicket — Hand-Drawn Transit Sketchbook",
  description: "Playful hand-drawn multi-modal ticket reservation platform for Bangladesh. Bus, Train, and Flight tickets with Gmail OTP verification.",
  verification: {
    google: "zQvv6qAEdvYYRS7TzMpBjC7mcFEfDAap2NvvAiBkMa0",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kalam.variable} ${patrickHand.variable} h-full antialiased`}>
      <body className="font-body min-h-full flex flex-col bg-[#fdfbf7] text-[#2d2d2d] relative overflow-x-hidden selection:bg-[#ff4d4d] selection:text-white pattern-paper-dots">
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



