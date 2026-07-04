'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { useAuth } from '@/context/AuthContext';
import { 
  Bus, Train, Plane, RefreshCw, AlertCircle, 
  ArrowRight, UserCheck, Armchair, ShoppingBag, ShieldAlert 
} from 'lucide-react';

function BookTripContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const tripId = params.tripId as string;
  const travelDate = searchParams.get('date') || '2026-06-29';

  // State
  const [trip, setTrip] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [classType, setClassType] = useState('ECONOMY'); // ECONOMY or BUSINESS
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [passengers, setPassengers] = useState<any[]>([]); // Array of { seat_number, name, age, gender, nid }
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

  // Handle seat clicks
  const handleSeatClick = (seat: string, isAvailable: boolean) => {
    if (!isAvailable) return;

    if (selectedSeats.includes(seat)) {
      // Remove seat
      setSelectedSeats(prev => prev.filter(s => s !== seat));
      setPassengers(prev => prev.filter(p => p.seat_number !== seat));
    } else {
      // Limit based on transport mode: 5 for flights, 4 for bus/train
      const limit = trip?.transport_type === 'PLANE' ? 5 : 4;
      if (selectedSeats.length >= limit) {
        alert(`You can book a maximum of ${limit} seats at a time for ${trip?.transport_type?.toLowerCase()} transport.`);
        return;
      }
      // Add seat
      setSelectedSeats(prev => [...prev, seat]);
      setPassengers(prev => [
        ...prev, 
        { seat_number: seat, name: '', age: '', gender: 'MALE', nid: '' }
      ]);
    }
  };

  // Passenger input change handlers
  const handlePassengerChange = (seat: string, field: string, value: any) => {
    setPassengers(prev => prev.map(p => {
      if (p.seat_number === seat) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      // Redirect to login if not authenticated
      router.push(`/auth/login?redirect=/book/${tripId}?date=${travelDate}`);
      return;
    }

    if (selectedSeats.length === 0) {
      setError('Please select at least one seat.');
      return;
    }

    // Validation check on passenger names and ages
    for (const p of passengers) {
      if (!p.name.trim()) {
        setError(`Please enter the name for passenger on seat ${p.seat_number}.`);
        return;
      }
      if (!p.age || parseInt(p.age) <= 0) {
        setError(`Please enter a valid age for passenger on seat ${p.seat_number}.`);
        return;
      }
    }

    setError('');
    setSubmitting(true);

    const payload = {
      trip_id: parseInt(tripId),
      travel_date: travelDate,
      class_type: classType,
      passengers: passengers.map(p => ({
        seat_number: p.seat_number,
        name: p.name,
        age: parseInt(p.age),
        gender: p.gender,
        nid: p.nid || null
      }))
    };

    try {
      const res = await api.createBooking(payload);
      router.push(`/payment/${res.booking.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
      setSubmitting(false);
    }
  };

  // Helpers
  const getFare = () => {
    if (!trip) return 0;
    const base = classType === 'BUSINESS' && trip.fare_business ? trip.fare_business : trip.fare_economy;
    return parseFloat(base);
  };

  const getTotalFare = () => {
    return getFare() * selectedSeats.length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <RefreshCw className="h-10 w-10 text-emerald-500 animate-spin" />
        <span className="text-slate-400">Loading seat layout details...</span>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Error Loading Seating Plan</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  const layout = trip?.seat_layout || {};
  const tType = trip?.transport_type || 'BUS';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <button 
        onClick={() => router.back()}
        className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
      >
        <span>← Back to Results</span>
      </button>

      {/* Trip Brief Details */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{tType}</span>
          <h2 className="text-xl font-extrabold text-white mt-2 flex items-center space-x-2">
            <span>{trip.source.name}</span>
            <ArrowRight className="h-4 w-4 text-slate-500" />
            <span>{trip.destination.name}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Operator: <span className="text-slate-200 font-semibold">{trip.operator_name} ({trip.transport_identifier})</span> • Date: <span className="text-slate-200 font-semibold">{travelDate}</span>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Base Fare</span>
            <span className="text-2xl font-extrabold text-emerald-400">৳{getFare().toLocaleString()}</span>
          </div>
          {trip.fare_business && (
            <div className="space-y-1">
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Class</label>
              <select
                value={classType}
                onChange={(e) => { setClassType(e.target.value); setSelectedSeats([]); setPassengers([]); }}
                className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ECONOMY">Economy Class</option>
                <option value="BUSINESS">Business Class</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Seat Selector */}
        <div className="lg:col-span-1 glass-panel rounded-3xl p-6 sm:p-8 flex flex-col items-center">
          <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-3 w-full text-center mb-6">
            Choose Seating Layout
          </h3>

          {/* Seat Layout Graphics */}
          <div className="bg-slate-950/80 border border-slate-900 p-6 rounded-2xl w-full max-w-[320px] relative">
            
            {/* Bus Layout View */}
            {tType === 'BUS' && (
              <div className="space-y-4">
                {/* Front indicator (Steering wheel mock) */}
                <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Driver</span>
                  <div className="h-6 w-6 rounded-full border-4 border-dashed border-slate-850 animate-spin" style={{ animationDuration: '40s' }} />
                  <span>Gate</span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(row => {
                    return ['1', '2', '3', '4'].map(col => {
                      const seat = `${row}${col}`;
                      const isAvail = layout[seat] !== false;
                      const isSel = selectedSeats.includes(seat);
                      
                      // Inject Aisle space in center (between 2 and 3)
                      const isAisleRight = col === '2';

                      return (
                        <React.Fragment key={seat}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat, isAvail)}
                            disabled={!isAvail}
                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all relative cursor-pointer ${
                              !isAvail 
                                ? 'bg-red-500/10 border border-red-500/20 text-red-500 cursor-not-allowed'
                                : isSel
                                ? 'bg-emerald-500 border border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                            }`}
                            title={isAvail ? `Seat ${seat} (Available)` : `Seat ${seat} (Booked)`}
                          >
                            <Armchair className="h-4.5 w-4.5 absolute opacity-30" />
                            <span className="z-10">{seat}</span>
                          </button>
                          {isAisleRight && <div className="w-4" />}
                        </React.Fragment>
                      );
                    });
                  })}
                </div>
              </div>
            )}

            {/* Train Coach Seating (Shovon/Snigdha 2x2 layout) */}
            {tType === 'TRAIN' && (
              <div className="space-y-4">
                <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-900 pb-2 mb-2">
                  Coach Compartment View
                </div>
                <div className="grid grid-cols-4 gap-2.5 max-h-[450px] overflow-y-auto pr-1">
                  {Array.from({ length: 15 }).map((_, rIdx) => {
                    const rowLetter = String.fromCharCode(65 + rIdx); // A to O
                    return ['1', '2', '3', '4'].map(col => {
                      const seatNum = `S${rIdx * 4 + parseInt(col)}`;
                      const isAvail = layout[seatNum] !== false;
                      const isSel = selectedSeats.includes(seatNum);
                      const isAisleRight = col === '2';

                      return (
                        <React.Fragment key={seatNum}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seatNum, isAvail)}
                            disabled={!isAvail}
                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-[9px] font-bold transition-all relative cursor-pointer ${
                              !isAvail
                                ? 'bg-red-500/10 border border-red-500/20 text-red-500 cursor-not-allowed'
                                : isSel
                                ? 'bg-emerald-500 border border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                            title={seatNum}
                          >
                            <span className="z-10">{seatNum}</span>
                          </button>
                          {isAisleRight && <div className="w-2" />}
                        </React.Fragment>
                      );
                    });
                  })}
                </div>
              </div>
            )}

            {/* Flight Layout View (3x3 grid) */}
            {tType === 'PLANE' && (
              <div className="space-y-4">
                <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider border-b border-slate-900 pb-2 mb-2">
                  Cabin Seating (3 + 3)
                </div>
                <div className="grid grid-cols-6 gap-2 max-h-[450px] overflow-y-auto pr-1">
                  {Array.from({ length: 10 }).map((_, rowNum) => {
                    const r = rowNum + 1;
                    return ['A', 'B', 'C', 'D', 'E', 'F'].map(col => {
                      const seat = `${r}${col}`;
                      const isAvail = layout[seat] !== false;
                      const isSel = selectedSeats.includes(seat);
                      const isAisleRight = col === 'C';

                      return (
                        <React.Fragment key={seat}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat, isAvail)}
                            disabled={!isAvail}
                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-[9px] font-bold transition-all relative cursor-pointer ${
                              !isAvail
                                ? 'bg-red-500/10 border border-red-500/20 text-red-500 cursor-not-allowed'
                                : isSel
                                ? 'bg-emerald-500 border border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="z-10">{seat}</span>
                          </button>
                          {isAisleRight && <div className="w-2" />}
                        </React.Fragment>
                      );
                    });
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Seating color code guide */}
          <div className="flex space-x-6 mt-6 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <div className="h-3 w-3 bg-slate-900 border border-slate-850 rounded" />
              <span className="text-slate-400">Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3 w-3 bg-emerald-500 rounded" />
              <span className="text-emerald-400">Selected</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="h-3 w-3 bg-red-500/10 border border-red-500/20 rounded" />
              <span className="text-red-500">Booked</span>
            </div>
          </div>
        </div>

        {/* Right Column: Passenger details & summary */}
        <div className="lg:col-span-2 space-y-6">
          
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {selectedSeats.length === 0 ? (
            <div className="glass-panel rounded-3xl p-8 text-center space-y-4 border border-dashed border-slate-800 flex flex-col items-center justify-center min-h-[300px]">
              <Armchair className="h-12 w-12 text-slate-500 animate-pulse" />
              <h4 className="text-white font-bold text-lg">No Seats Selected</h4>
              <p className="text-slate-500 text-sm max-w-sm">
                Click on the seat layout chart on the left to select seats. You can book up to 4 tickets at a time.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {/* Passenger Inputs Card */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <span>Passenger Details</span>
                </h3>

                <div className="space-y-6">
                  {passengers.map((p, idx) => (
                    <div key={p.seat_number} className="bg-slate-900/30 border border-slate-900 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Passenger {idx + 1}</span>
                        <span className="text-xs bg-slate-800 text-slate-200 px-2 py-0.5 rounded font-bold">Seat: {p.seat_number}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                          <input
                            type="text"
                            required
                            value={p.name}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'name', e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            placeholder="E.g., Karim Uddin"
                          />
                        </div>

                        {/* Age */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Age</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={p.age}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'age', e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            placeholder="E.g., 28"
                          />
                        </div>

                        {/* Gender */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                          <select
                            value={p.gender}
                            onChange={(e) => handlePassengerChange(p.seat_number, 'gender', e.target.value)}
                            className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none cursor-pointer"
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* NID / Passport (Required for Flights in real life, recommended for train) */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                          <span>NID / Passport Number</span>
                          {tType === 'PLANE' && <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Required for Flights</span>}
                        </label>
                        <input
                          type="text"
                          required={tType === 'PLANE'}
                          value={p.nid}
                          onChange={(e) => handlePassengerChange(p.seat_number, 'nid', e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          placeholder="National ID / Passport"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
                <h3 className="font-bold text-white text-sm uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                  <ShoppingBag className="h-4 w-4 text-emerald-400" />
                  <span>Fare Summary</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Selected Seats:</span>
                    <span className="text-slate-200 font-bold">{selectedSeats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class Rate:</span>
                    <span className="text-slate-200 font-semibold">৳{getFare().toLocaleString()} x {selectedSeats.length}</span>
                  </div>
                  <div className="border-t border-slate-900 pt-3 mt-3 flex justify-between text-sm">
                    <span className="font-bold text-white">Total Ticket Fare:</span>
                    <span className="font-extrabold text-emerald-400 text-base">৳{getTotalFare().toLocaleString()}</span>
                  </div>
                </div>

                {!user && (
                  <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start space-x-2 text-[10px] text-indigo-400">
                    <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>You are not logged in. Confirming will redirect you to the login screen to verify identity.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-3.5 font-bold text-slate-950 flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:scale-[1.01] transition-all disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : null}
                  <span>Confirm and Proceed to Payment</span>
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}

export default function BookTrip() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-slate-400 font-medium">Loading booking details...</span>
      </div>
    }>
      <BookTripContent />
    </Suspense>
  );
}
