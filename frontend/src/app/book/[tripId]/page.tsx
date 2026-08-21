'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, AlertCircle, ArrowRight, ShieldCheck, Mail, ArrowLeft } from 'lucide-react';
import { VehicleSeatSelector, TransportType, Passenger } from '@/components/VehicleSeatSelector';

function BookTripContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const tripId = params.tripId as string;
  const travelDate = searchParams.get('date') || '2026-08-21';

  // State
  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch trip details
  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getTripDetails(tripId);
        setTrip(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  // Helper to accurately resolve vehicle mode (PLANE, TRAIN, BUS)
  const getNormalizedTransportType = (t: any): TransportType => {
    if (!t) return 'BUS';
    const rawType = (t.transport_type || t.trip_details?.transport_type || t.type || '').toString().toUpperCase();
    if (rawType.includes('PLANE') || rawType.includes('FLIGHT') || rawType.includes('AIR')) return 'PLANE';
    if (rawType.includes('TRAIN') || rawType.includes('RAIL')) return 'TRAIN';
    if (rawType.includes('BUS')) return 'BUS';

    const name = ((t.operator_name || '') + ' ' + (t.company_name || '') + ' ' + (t.transport_identifier || '')).toUpperCase();
    if (name.includes('AIR') || name.includes('BIMAN') || name.includes('FLIGHT') || name.includes('AERO') || name.includes('AIRLINES') || name.includes('NOVOAIR') || name.includes('ASTRA')) return 'PLANE';
    if (name.includes('EXPRESS') || name.includes('TRAIN') || name.includes('RAIL') || name.includes('BANGLADESH RAILWAY') || name.includes('SONAR BANGLA') || name.includes('SUBARNA')) return 'TRAIN';

    return 'BUS';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-[#F2F0E4]">
        <RefreshCw className="h-10 w-10 text-[#D4AF37] animate-spin" />
        <span className="text-[#888888] font-medium uppercase tracking-widest text-xs" style={{ fontFamily: 'var(--font-heading), serif' }}>Loading Imperial Seat Matrix & Vehicle Details...</span>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-[#F2F0E4] uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading), serif' }}>Error Loading Seating Plan</h2>
        <p className="text-[#888888] text-xs">{error}</p>
      </div>
    );
  }

  const tType = getNormalizedTransportType(trip);
  const rawLayout = trip.seat_layout || {};

  const getBookedSeatsList = (): string[] => {
    const booked = new Set<string>();
    
    Object.entries(rawLayout).forEach(([seatKey, val]) => {
      if (val === false) booked.add(seatKey);
    });

    if (typeof window !== 'undefined') {
      try {
        const key = `all_system_booked_seats_${tripId}_${travelDate}`;
        const savedStr = localStorage.getItem(key);
        if (savedStr) {
          const list: string[] = JSON.parse(savedStr);
          list.forEach(s => booked.add(s));
        }

        const localBookingsStr = localStorage.getItem('local_user_bookings');
        if (localBookingsStr) {
          const bList: any[] = JSON.parse(localBookingsStr);
          bList.forEach(b => {
            const bTripId = b.trip_id || b.trip?.id || b.trip_details?.id;
            const bDate = b.travel_date;
            if (bTripId?.toString() === tripId?.toString() && bDate === travelDate && (b.status === 'PAID' || b.status === 'PENDING')) {
              const seatsStr = b.seats_booked || '';
              seatsStr.split(',').map((s: string) => s.trim()).filter(Boolean).forEach((s: string) => booked.add(s));
              if (Array.isArray(b.passengers)) {
                b.passengers.forEach((p: any) => {
                  if (p.seat_number) booked.add(p.seat_number);
                });
              }
            }
          });
        }
      } catch (e) {}
    }

    return Array.from(booked);
  };

  const bookedSeatsList = getBookedSeatsList();

  const handleBookingConfirm = async (details: {
    transportType: TransportType;
    classType: string;
    selectedSeats: string[];
    passengers: Passenger[];
    totalFare: number;
  }) => {
    if (!user) {
      router.push(`/auth/login?redirect=/book/${tripId}?date=${travelDate}`);
      return;
    }

    if (details.selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }

    for (const p of details.passengers) {
      if (!p.name.trim()) {
        setError(`Please enter full name for passenger on seat ${p.seat_number}.`);
        return;
      }
      if (!p.age || parseInt(p.age) <= 0) {
        setError(`Please enter a valid age for passenger on seat ${p.seat_number}.`);
        return;
      }
      if (!p.isVerified) {
        setError(`Please complete Gmail OTP verification for passenger on seat ${p.seat_number}. NID is not required.`);
        return;
      }
    }

    setError('');
    setSubmitting(true);

    const payload = {
      trip_id: parseInt(tripId),
      travel_date: travelDate,
      class_type: details.classType,
      passengers: details.passengers.map(p => ({
        seat_number: p.seat_number,
        name: p.name,
        age: parseInt(p.age),
        gender: p.gender,
        email: p.gmail,
        gmail_verified: true
      }))
    };

    try {
      const res: any = await api.createBooking(payload);
      const bookingId = res?.id || res?.booking?.id || res?.booking_id || Date.now();

      if (typeof window !== 'undefined') {
        try {
          const key = `all_system_booked_seats_${tripId}_${travelDate}`;
          const existing = localStorage.getItem(key);
          const list: string[] = existing ? JSON.parse(existing) : [];
          const updated = Array.from(new Set([...list, ...details.selectedSeats]));
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {}
      }

      router.push(`/payment/${bookingId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F2F0E4] art-deco-crosshatch py-8 px-4 sm:px-6 lg:px-8 space-y-8 relative">
      {/* Back button */}
      <div>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] hover:text-[#F2E8C4] transition-colors border border-[#D4AF37]/30 bg-[#141414] px-4 py-2 cursor-pointer"
          style={{ fontFamily: 'var(--font-heading), serif' }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Transit Matrix</span>
        </button>
      </div>

      {/* Trip Brief Details Panel */}
      <div className="art-deco-panel art-deco-corner-brackets p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#0A0A0A] border-2 border-[#D4AF37]/50 shadow-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-bold px-3 py-0.5 uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading), serif' }}>{tType}</span>
            <span className="text-xs bg-[#141414] border border-[#D4AF37]/30 text-emerald-400 font-bold px-3 py-0.5 flex items-center space-x-1 uppercase tracking-wider">
              <Mail className="h-3 w-3 text-emerald-400" />
              <span>Gmail Verification Required</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#F2F0E4] mt-2 flex items-center space-x-3 uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-heading), serif' }}>
            <span>{trip.source?.name || 'Dhaka'}</span>
            <ArrowRight className="h-5 w-5 text-[#D4AF37]" />
            <span>{trip.destination?.name || 'Chittagong'}</span>
          </h2>
          <p className="text-xs text-[#888888] mt-1 tracking-wide uppercase font-mono">
            Operator: <span className="text-[#F2F0E4] font-semibold">{trip.operator_name} ({trip.transport_identifier})</span> • Date: <span className="text-[#D4AF37] font-semibold">{travelDate}</span>
          </p>
        </div>

        <div className="text-right">
          <span className="block text-[10px] text-[#888888] uppercase tracking-widest font-mono">Economy Base Fare</span>
          <span className="text-3xl font-extrabold text-[#D4AF37]" style={{ fontFamily: 'var(--font-heading), serif' }}>৳{parseFloat(trip.fare_economy || 850).toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <div className="border-2 border-red-500/40 bg-[#141414] p-4 text-xs font-bold text-red-400 flex items-center space-x-2 shadow-lg">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span className="uppercase tracking-wider">{error}</span>
        </div>
      )}

      {/* VEHICLE SEAT SELECTOR */}
      <VehicleSeatSelector
        initialType={tType}
        allowModeSwitching={true}
        bookedSeats={bookedSeatsList}
        baseFareEconomy={parseFloat(trip.fare_economy || 850)}
        baseFareBusiness={parseFloat(trip.fare_business || 1450)}
        onBookingConfirm={handleBookingConfirm}
      />
    </div>
  );
}

export default function BookTrip() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 bg-[#0A0A0A] text-[#F2F0E4]">
        <RefreshCw className="h-10 w-10 text-[#D4AF37] animate-spin" />
        <span className="text-[#888888] font-bold text-xs uppercase tracking-widest" style={{ fontFamily: 'var(--font-heading), serif' }}>Loading Trip Details...</span>
      </div>
    }>
      <BookTripContent />
    </Suspense>
  );
}
