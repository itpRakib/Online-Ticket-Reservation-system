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
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 text-[#121212]">
        <RefreshCw className="h-10 w-10 text-[#D02020] animate-spin" />
        <span className="text-[#121212] font-black uppercase tracking-wider text-xs">Loading Bauhaus Seat Matrix & Vehicle Details...</span>
      </div>
    );
  }

  if (!loading && !trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-[#D02020] mx-auto" />
        <h2 className="text-xl font-black text-[#121212] uppercase tracking-wider">Trip Details Unavailable</h2>
        <p className="text-[#666666] text-xs font-bold">{error || 'The requested trip could not be loaded.'}</p>
        <button
          onClick={() => router.push('/search')}
          className="bauhaus-button-yellow text-xs py-2 px-4 shadow-[4px_4px_0px_0px_#121212]"
        >
          Return to Transit Matrix
        </button>
      </div>
    );
  }

  const tType = getNormalizedTransportType(trip);
  const rawLayout = (trip && trip.seat_layout) ? trip.seat_layout : {};

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
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] py-8 px-4 sm:px-6 lg:px-8 space-y-8 relative">
      {/* Back button */}
      <div>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#121212] bg-white border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] px-4 py-2 hover:bg-[#F0C020] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Transit Matrix</span>
        </button>
      </div>

      {/* Trip Brief Details Panel */}
      <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-[#D02020] text-white font-black px-3 py-0.5 border-2 border-[#121212] uppercase tracking-wider">{tType}</span>
            <span className="text-xs bg-[#F0C020] text-[#121212] border-2 border-[#121212] font-black px-3 py-0.5 flex items-center space-x-1 uppercase tracking-wider">
              <Mail className="h-3 w-3 text-[#121212]" />
              <span>Gmail Verification Required</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#121212] mt-2 flex items-center space-x-3 uppercase tracking-tighter">
            <span>{typeof trip.source === 'object' ? (trip.source?.name || 'Dhaka') : (trip.source || 'Dhaka')}</span>
            <ArrowRight className="h-5 w-5 text-[#D02020]" />
            <span>{typeof trip.destination === 'object' ? (trip.destination?.name || 'Chittagong') : (trip.destination || 'Chittagong')}</span>
          </h2>
          <p className="text-xs text-[#666666] mt-1 font-bold tracking-wide uppercase font-mono">
            Operator: <span className="text-[#121212] font-black">{trip.operator_name} ({trip.transport_identifier})</span> • Date: <span className="text-[#1040C0] font-black">{travelDate}</span>
          </p>
        </div>

        <div className="text-right">
          <span className="block text-[10px] text-[#666666] uppercase tracking-widest font-black">Economy Base Fare</span>
          <span className="text-3xl font-black text-[#D02020]">৳{parseFloat(trip.fare_economy || 850).toLocaleString()}</span>
        </div>
      </div>

      {error && (
        <div className="border-4 border-[#121212] bg-[#D02020] text-white p-4 text-xs font-black flex items-center space-x-2 shadow-[4px_4px_0px_0px_#121212]">
          <AlertCircle className="h-4 w-4 shrink-0 text-white" />
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4 bg-[#F0F0F0] text-[#121212]">
        <RefreshCw className="h-10 w-10 text-[#D02020] animate-spin" />
        <span className="text-[#121212] font-black text-xs uppercase tracking-wider">Loading Trip Details...</span>
      </div>
    }>
      <BookTripContent />
    </Suspense>
  );
}
