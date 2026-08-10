import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PlexusBackground } from "@/components/PlexusBackground";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BD GoTicket — Bus, Train & Flight Tickets Bangladesh",
  description: "Compare and book transport tickets across Bangladesh with verified identity. Bus, train, and flight — all in one platform.",
};

import { InitialPreloader } from "@/components/InitialPreloader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${spaceGrotesk.variable} ${inter.variable} font-sans min-h-full flex flex-col bg-[var(--bg-deep)] text-[var(--text-primary)] relative overflow-x-hidden`}>
        <ThemeProvider>
          <AuthProvider>
            <InitialPreloader />
            <PlexusBackground />
            <Header />
            <main className="flex-grow flex flex-col">
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
