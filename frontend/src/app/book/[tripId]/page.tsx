'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { RefreshCw, AlertCircle, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin" />
        <span className="text-slate-400 font-medium">Loading seat layout & vehicle details...</span>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>Error Loading Seating Plan</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  const rawLayout = trip?.seat_layout || {};
  const tType = getNormalizedTransportType(trip);

  // Aggregate all booked seats across API and local storage
  const getBookedSeatsList = (): string[] => {
    const booked = new Set<string>();
    
    // Check API seat_layout
    Object.entries(rawLayout).forEach(([seatKey, val]) => {
      if (val === false) booked.add(seatKey);
    });

    // Check persistent global booked seats in localStorage
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <button 
        onClick={() => router.back()}
        className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
      >
        <span>← Back to Search Results</span>
      </button>

      {/* Trip Brief Details */}
      <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090717]/90 border border-purple-500/20 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{tType}</span>
            <span className="text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Mail className="h-3 w-3 text-cyan-400" />
              <span>Gmail Verification Required</span>
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-2 flex items-center space-x-2" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            <span>{trip.source?.name || 'Dhaka'}</span>
            <ArrowRight className="h-4 w-4 text-slate-500" />
            <span>{trip.destination?.name || 'Chittagong'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Operator: <span className="text-slate-200 font-semibold">{trip.operator_name} ({trip.transport_identifier})</span> • Date: <span className="text-slate-200 font-semibold">{travelDate}</span>
          </p>
        </div>

        <div className="text-right">
          <span className="block text-xs text-slate-400 uppercase tracking-widest font-mono">Economy Base Fare</span>
          <span className="text-2xl font-extrabold text-emerald-400">৳{parseFloat(trip.fare_economy || 850).toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-xs font-semibold text-red-400 flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-medium">Loading trip details...</span>
      </div>
    }>
      <BookTripContent />
    </Suspense>
  );
}
