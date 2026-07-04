import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BD GoTicket - Bus, Train & Flight Tickets Bangladesh",
  description: "Compare and book transport tickets in Bangladesh instantly using SIM, NID & Gmail verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className={`${plusJakartaSans.className} min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden`}>
        {/* Animated Background Mesh Blobs */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden print:hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[65%] h-[65%] rounded-full bg-blob-emerald filter blur-[80px]" />
          <div className="absolute top-[30%] right-[-10%] w-[75%] h-[75%] rounded-full bg-blob-teal filter blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[15%] w-[65%] h-[65%] rounded-full bg-blob-indigo filter blur-[90px]" />
        </div>
        <AuthProvider>
          <Header />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
