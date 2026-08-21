import type { Metadata } from "next";
import { Marcellus, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlexusBackground } from "@/components/PlexusBackground";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { InitialPreloader } from "@/components/InitialPreloader";

const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const josefinSans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BD GoTicket — Art Deco Transit Matrix Bangladesh",
  description: "Experience the Gatsby aesthetic transport ticket reservation system for Bangladesh. Bus, Train, and Flight tickets with Gmail OTP verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className={`${marcellus.variable} ${josefinSans.variable} font-sans min-h-full flex flex-col bg-[#0A0A0A] text-[#F2F0E4] relative overflow-x-hidden`}>
        <ThemeProvider>
          <AuthProvider>
            <InitialPreloader />
            <PlexusBackground />
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
