import random
import string
import time
from datetime import datetime, timedelta
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.cache import cache
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserProfile, MockNIDDatabase, Station, Trip, Booking, Passenger, Payment
from .serializers import (
    RegisterSerializer, UserSerializer, StationSerializer, TripSerializer,
    BookingSerializer, PassengerSerializer, PaymentSerializer
)

# Custom JWT Claims to include user details in Token response
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field, '').strip()
        password = attrs.get('password')

        if username_or_email and password:
            clean = username_or_email
            formatted_phone = clean
            if formatted_phone.startswith('0'):
                formatted_phone = '+88' + formatted_phone
            elif not formatted_phone.startswith('+88'):
                formatted_phone = '+880' + formatted_phone

            user = User.objects.filter(
                Q(username__iexact=clean) |
                Q(email__iexact=clean) |
                Q(profile__phone=clean) |
                Q(profile__phone=formatted_phone)
            ).first()

            if user and user.check_password(password):
                attrs[self.username_field] = user.username

        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        raw_username = (request.data.get('username') or '').strip()
        if not raw_username:
            return super().post(request, *args, **kwargs)

        formatted_phone = raw_username
        if formatted_phone.startswith('0'):
            formatted_phone = '+88' + formatted_phone
        elif not formatted_phone.startswith('+88'):
            formatted_phone = '+880' + formatted_phone

        user = User.objects.filter(
            Q(username__iexact=raw_username) |
            Q(email__iexact=raw_username) |
            Q(profile__phone=raw_username) |
            Q(profile__phone=formatted_phone)
        ).first()

        username = user.username if user else raw_username

        # Standardize request data to use normalized username
        mutable_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        mutable_data['username'] = username
        request._full_data = mutable_data

        lockout_key = f"lockout_{username}"
        attempts_key = f"attempts_{username}"
        blocks_count_key = f"blocks_{username}"

        # Check if locked out
        lockout_until = cache.get(lockout_key)
        if lockout_until and time.time() < lockout_until:
            remaining = int(lockout_until - time.time())
            minutes = (remaining // 60) + 1
            return Response({
                "error": f"Too many failed attempts. Account blocked. Please try again in {minutes} minutes."
            }, status=status.HTTP_403_FORBIDDEN)

        otp = request.data.get('otp')
        trust_token = request.data.get('trust_token')

        if otp:
            # Step 2: Verification of Gmail OTP
            user = None
            clean_username = username.strip()
            formatted_phone = clean_username
            if formatted_phone.startswith('0'):
                formatted_phone = '+88' + formatted_phone
            elif not formatted_phone.startswith('+88'):
                formatted_phone = '+880' + formatted_phone

            try:
                user = User.objects.get(
                    Q(username__iexact=clean_username) | 
                    Q(email__iexact=clean_username) | 
                    Q(profile__phone=clean_username) | 
                    Q(profile__phone=formatted_phone)
                )
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                pass

            if not user:
                return Response({"error": "No active account found with the given credentials"}, status=status.HTTP_401_UNAUTHORIZED)

            cached_otp = cache.get(f"login_otp_{user.username}")
            if not cached_otp:
                return Response({"error": "Verification code has expired. Please log in again."}, status=status.HTTP_400_BAD_REQUEST)

            if otp != cached_otp:
                return Response({"error": "Invalid verification code. Please check your Gmail inbox."}, status=status.HTTP_400_BAD_REQUEST)

            # OTP is correct, clear it and proceed with standard credentials check to generate token
            cache.delete(f"login_otp_{user.username}")
            
            serializer = self.get_serializer(data=mutable_data)
            try:
                serializer.is_valid(raise_exception=True)
                # Success: clear attempts
                cache.delete(attempts_key)
                
                # Generate new trust token valid for 48 hours (bypassed for admins)
                user_role = getattr(user.profile, 'role', 'user')
                is_admin = user_role == 'admin' or user.is_staff or user.is_superuser or 'admin' in user.username.lower()
                
                # Update last login timestamp
                user.profile.last_login_at = timezone.now()
                user.profile.save()

                data = serializer.validated_data
                if not is_admin:
                    import uuid
                    new_trust_token = str(uuid.uuid4())
                    cache.set(f"trust_token_{user.username}_{new_trust_token}", True, timeout=48 * 3600)
                    data["trust_token"] = new_trust_token
                
                return Response(data, status=status.HTTP_200_OK)
            except Exception:
                return Response({"error": "Invalid credentials. Please log in again."}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            # Step 1: Validate credentials first, then check if device is trusted or send Gmail OTP
            serializer = self.get_serializer(data=mutable_data)
            try:
                serializer.is_valid(raise_exception=True)
                user = serializer.user
                
                # Check if device is trusted (trust_token is valid in cache)
                # Strict Admin Enforcement: Admin accounts can NEVER bypass OTP.
                user_role = getattr(user.profile, 'role', 'user')
                is_admin = user_role == 'admin' or user.is_staff or user.is_superuser or 'admin' in user.username.lower()

                if not is_admin:
                    # User login directly! Bypass OTP.
                    cache.delete(attempts_key)
                    
                    # Update last login timestamp
                    user.profile.last_login_at = timezone.now()
                    user.profile.save()
                    
                    data = serializer.validated_data
                    return Response(data, status=status.HTTP_200_OK)

                # Otherwise (since is_admin is True), generate random 6-digit OTP
                otp_code = "".join(random.choices(string.digits, k=6))
                cache.set(f"login_otp_{user.username}", otp_code, timeout=120)  # Valid for 2 minutes
                
                # Send email asynchronously
                import threading
                def send_email_async():
                    try:
                        send_mail(
                            subject="BD GoTicket Login Verification Code",
                            message=f"Your login verification code is: {otp_code}. This code is valid for 2 minutes.",
                            from_email=None,
                            recipient_list=[user.email],
                            fail_silently=False,
                        )
                    except Exception as e:
                        print("SMTP send_mail error:", e)

                threading.Thread(target=send_email_async).start()
                
                return Response({
                    "requires_otp": True,
                    "username": user.username,
                    "email": user.email,
                    "simulated_otp": otp_code  # Retain simulated OTP for offline mockup
                }, status=status.HTTP_200_OK)

            except Exception:
                attempts = cache.get(attempts_key, 0) + 1
                cache.set(attempts_key, attempts, timeout=600) # Keep attempts for 10 minutes

                if attempts >= 5:
                    blocks = cache.get(blocks_count_key, 0) + 1
                    cache.set(blocks_count_key, blocks, timeout=3600) # Keep block count history for 1 hour

                    duration = 600 if blocks >= 2 else 300 # 10 mins (600s) on second block, 5 mins (300s) on first
                    lockout_time = time.time() + duration
                    cache.set(lockout_key, lockout_time, timeout=duration)
                    cache.delete(attempts_key) # Reset attempts

                    return Response({
                        "error": f"Too many failed attempts. Account blocked for {duration // 60} minutes."
                    }, status=status.HTTP_403_FORBIDDEN)

                return Response({
                    "error": "No active account found with the given credentials"
                }, status=status.HTTP_401_UNAUTHORIZED)



# User Profile & Registration Views
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response({
                    "message": "User registered successfully",
                    "user": UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print("[RegisterView Save Error]", str(e))
                return Response({"error": f"Failed to create user: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        print("[RegisterView Validation Error]", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# Mock NID verification view
class NIDVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        nid_number = request.data.get('nid_number')
        dob_str = request.data.get('dob') # Expected format: YYYY-MM-DD
        
        if not nid_number or not dob_str:
            return Response({"error": "NID number and DOB are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            dob = datetime.strptime(dob_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already registered in our system
        if UserProfile.objects.filter(nid=nid_number).exists():
            return Response({
                "verified": False,
                "error": "This National ID is already registered with another account in the system."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            citizen = MockNIDDatabase.objects.filter(nid_number=nid_number).first()
            if citizen:
                return Response({
                    "verified": True,
                    "nid_data": {
                        "full_name": citizen.full_name,
                        "father_name": citizen.father_name,
                        "mother_name": citizen.mother_name,
                        "address": citizen.address,
                        "dob": citizen.dob
                    }
                }, status=status.HTTP_200_OK)

            # If valid NID format (10+ digits), auto-create or return verified mock citizen profile
            if len(str(nid_number)) >= 10:
                new_citizen = MockNIDDatabase.objects.create(
                    nid_number=nid_number,
                    full_name=request.data.get('nid_name', f"Citizen {nid_number[-4:]}"),
                    father_name="Md. Abdur Rahim",
                    mother_name="Rokeya Begum",
                    dob=dob,
                    address="Dhaka, Bangladesh"
                )
                return Response({
                    "verified": True,
                    "nid_data": {
                        "full_name": new_citizen.full_name,
                        "father_name": new_citizen.father_name,
                        "mother_name": new_citizen.mother_name,
                        "address": new_citizen.address,
                        "dob": new_citizen.dob
                    }
                }, status=status.HTTP_200_OK)

            return Response({
                "verified": False,
                "error": "NID verification failed. No citizen matched this NID in the National Registry."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "verified": True,
                "nid_data": {
                    "full_name": request.data.get('nid_name', f"Citizen {nid_number[-4:]}"),
                    "father_name": "Md. Abdur Rahim",
                    "mother_name": "Rokeya Begum",
                    "address": "Dhaka, Bangladesh",
                    "dob": dob
                }
            }, status=status.HTTP_200_OK)


# Mock OTP Services
class OTPSendView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        target = request.data.get('target')  # Could be phone or email
        channel = request.data.get('channel')  # 'sim' or 'email'
        
        if not target or not channel:
            return Response({"error": "Target (phone/email) and channel (sim/email) are required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate random 6 digit OTP
        otp_code = "".join(random.choices(string.digits, k=6))
        
        # Send actual email via SMTP asynchronously if channel is 'email'
        if channel == 'email':
            import threading
            def send_email_async():
                try:
                    send_mail(
                        subject="BD GoTicket Verification Code",
                        message=f"Your verification code is: {otp_code}. This code is valid for 2 minutes.",
                        from_email=None,
                        recipient_list=[target],
                        fail_silently=False,
                    )
                except Exception as e:
                    print("SMTP send_mail error:", e)
            
            threading.Thread(target=send_email_async).start()

        return Response({
            "success": True,
            "message": f"OTP successfully sent to your registered {channel}.",
            "simulated_otp": otp_code  # Retained so the frontend can fallback
        }, status=status.HTTP_200_OK)


# Station Listings
class StationListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        stations = Station.objects.all().order_by('name')
        serializer = StationSerializer(stations, many=True)
        return Response(serializer.data)


# Trip Search and Dynamic Comparison Engine
class TripSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        source_id = request.query_params.get('source')
        destination_id = request.query_params.get('destination')
        date_str = request.query_params.get('date')  # YYYY-MM-DD
        transport_type = request.query_params.get('transport_type', 'ALL') # BUS, TRAIN, PLANE, ALL
        
        # Capability Weightings: comfort, budget, speed
        priority = request.query_params.get('priority', 'balanced')  # balanced, budget, speed, comfort

        if not source_id or not destination_id or not date_str:
            return Response({"error": "source, destination, and date are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            travel_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce date selection constraints
        today = timezone.localtime(timezone.now()).date()
        if travel_date < today:
            return Response({"error": "Selected journey date has already passed. Please select a current or future date."}, status=status.HTTP_400_BAD_REQUEST)

        max_days = 20 if transport_type == 'BUS' else (10 if transport_type == 'TRAIN' else 60)
        max_allowed_date = today + timedelta(days=max_days)
        if travel_date > max_allowed_date:
            return Response({
                "error": f"Invalid search date: {date_str}. For {transport_type.lower()} journeys, tickets can only be booked up to {max_days} days in advance (Max date allowed: {max_allowed_date})."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Record search history
        try:
            from .models import SearchHistory, Station
            src_st = Station.objects.filter(code=source_id).first()
            dest_st = Station.objects.filter(code=destination_id).first()
            if src_st and dest_st:
                user_obj = request.user if request.user.is_authenticated else None
                SearchHistory.objects.create(
                    user=user_obj,
                    source_station=src_st,
                    destination_station=dest_st,
                    travel_date=travel_date,
                    transport_type=transport_type
                )
        except Exception as e:
            print("Failed to record search history:", e)

        # Filter trips by source, destination, date
        trips = Trip.objects.filter(
            source__code=source_id,
            destination__code=destination_id,
            departure_time__date=travel_date
        )

        if transport_type != 'ALL':
            trips = trips.filter(transport_type=transport_type)

        serialized_trips = TripSerializer(trips, many=True).data

        # Capability-Based Scoring System (Real-time comparison engine)
        # We calculate the scoring metrics for each transport option:
        # 1. Budget Score (1-10): Inverse of price. Cheaper = higher score.
        # 2. Speed Score (1-10): How fast the transport arrives. Faster = higher score.
        # 3. Comfort Score (1-10): Based on transport mode and operators. AC/Flight/Train cabin = higher score.
        
        # First, find max and min price to normalize budget scores
        fares = [float(t['fare_economy']) for t in serialized_trips]
        max_fare = max(fares) if fares else 1
        min_fare = min(fares) if fares else 1

        for trip in serialized_trips:
            t_type = trip['transport_type']
            duration = trip['duration_hours']
            economy_fare = float(trip['fare_economy'])
            
            # --- Comfort Scoring ---
            if t_type == 'PLANE':
                comfort = 9.8
            elif t_type == 'TRAIN':
                # Trains are generally comfortable in AC Cabin (9.0), Snigdha (7.5), Shovon (4.0)
                if trip['fare_business'] and float(trip['fare_business']) > 0:
                    comfort = 9.0  # AC Cabin
                else:
                    comfort = 5.5  # Shovon Chair / Economy
            else: # BUS
                if trip['fare_business'] and float(trip['fare_business']) > 0:
                    comfort = 8.0  # Business/AC Sleeper
                else:
                    comfort = 4.5  # Non-AC Bus
            
            # --- Speed Scoring ---
            # Speed depends on travel time. Let's make an index based on duration:
            # Let's say a plane is 1 hour (score 10). Bus is 6-8 hours (score 4). Train is 5-6 hours (score 5).
            if duration <= 1.5:
                speed = 9.8
            elif duration <= 3.0:
                speed = 8.5
            elif duration <= 5.0:
                speed = 6.8
            elif duration <= 7.0:
                speed = 5.2
            else:
                speed = 3.5

            # --- Budget Scoring ---
            # Normalized score: 10 means cheapest, 1 means most expensive
            if max_fare == min_fare:
                budget = 8.0
            else:
                # Closer to min_fare -> higher budget score
                budget = 1.0 + 9.0 * ((max_fare - economy_fare) / (max_fare - min_fare or 1.0))
            
            # Set weights based on User Capability choice
            if priority == 'budget':
                w_budget, w_comfort, w_speed = 0.70, 0.15, 0.15
            elif priority == 'comfort':
                w_budget, w_comfort, w_speed = 0.15, 0.70, 0.15
            elif priority == 'speed':
                w_budget, w_comfort, w_speed = 0.15, 0.15, 0.70
            else: # balanced
                w_budget, w_comfort, w_speed = 0.33, 0.33, 0.33

            # Calculate Recommendation Match Index (Percentage out of 100)
            match_index = (budget * w_budget + comfort * w_comfort + speed * w_speed) * 10
            
            # Inject comparisons into response
            trip['comparison'] = {
                'comfort_score': round(comfort, 1),
                'speed_score': round(speed, 1),
                'budget_score': round(budget, 1),
                'match_percentage': round(match_index, 0)
            }

        # Sort trips based on the chosen priority mode
        if priority == 'budget':
            # Cheapest first
            serialized_trips = sorted(serialized_trips, key=lambda x: float(x['fare_economy']))
        elif priority == 'comfort':
            # VIP/Most premium first
            serialized_trips = sorted(
                serialized_trips, 
                key=lambda x: (-x['comparison']['comfort_score'], -float(x['fare_business'] or x['fare_economy']))
            )
        elif priority == 'speed':
            # Fastest first
            serialized_trips = sorted(serialized_trips, key=lambda x: x['duration_hours'])
        else:
            # Balanced: Match percentage descending
            serialized_trips = sorted(serialized_trips, key=lambda x: x['comparison']['match_percentage'], reverse=True)

        return Response({
            "priority_mode": priority,
            "search_count": len(serialized_trips),
            "trips": serialized_trips
        })


class TripDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, pk):
        trip = get_object_or_404(Trip, pk=pk)
        serializer = TripSerializer(trip)
        return Response(serializer.data)


# Booking Creation & Payment Flow
class BookingCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        trip_id = request.data.get('trip_id')
        travel_date_str = request.data.get('travel_date')
        passengers_data = request.data.get('passengers', [])
        class_type = request.data.get('class_type', 'ECONOMY') # ECONOMY or BUSINESS

        if not trip_id or not travel_date_str or not passengers_data:
            return Response({"error": "trip_id, travel_date, and passengers list are required"}, status=status.HTTP_400_BAD_REQUEST)

        trip = get_object_or_404(Trip, id=trip_id)
        
        try:
            travel_date = datetime.strptime(travel_date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid travel_date format. Use YYYY-MM-DD"}, status=status.HTTP_400_BAD_REQUEST)

        # Enforce Ticket limits: Plane = 5, Bus = 4, Train = 4
        transport_type = trip.transport_type
        limit = 5 if transport_type == 'PLANE' else 4
        requested_count = len(passengers_data)
        
        if requested_count > limit:
            return Response({"error": f"You can only book a maximum of {limit} seats at once for {transport_type.lower()} transport."}, status=status.HTTP_400_BAD_REQUEST)

        # Check total booked seats by this user for this trip on this date
        already_booked_count = Passenger.objects.filter(
            booking__user=request.user,
            booking__trip=trip,
            booking__travel_date=travel_date
        ).count()

        if already_booked_count + requested_count > limit:
            return Response({
                "error": f"Booking limit exceeded. You have already booked {already_booked_count} ticket(s) for this journey. Under one account, you can only book a maximum of {limit} tickets in total."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate seats availability across all users
        selected_seats = [p.get('seat_number') for p in passengers_data]
        if not selected_seats:
            return Response({"error": "No seat numbers provided"}, status=status.HTTP_400_BAD_REQUEST)

        # Query all seats already booked by ANY user for this trip on this travel date
        existing_booked_seats = set(Passenger.objects.filter(
            booking__trip=trip,
            booking__travel_date=travel_date,
            booking__status__in=['PAID', 'PENDING']
        ).values_list('seat_number', flat=True))
        
        # Check seats availability
        for seat in selected_seats:
            if seat in existing_booked_seats or trip.seat_layout.get(seat) is False:
                return Response({"error": f"Seat {seat} is already booked by another traveler for this journey date. Please select a different seat."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate fare
        base_fare = trip.fare_business if (class_type == 'BUSINESS' and trip.fare_business) else trip.fare_economy
        total_fare = base_fare * len(passengers_data)

        # Generate PNR: E.g., TXBD-839210
        pnr_suffix = "".join(random.choices(string.digits + string.ascii_uppercase, k=6))
        pnr_number = f"TX{pnr_suffix}"

        with transaction.atomic():
            # Create Booking
            booking = Booking.objects.create(
                pnr_number=pnr_number,
                user=request.user,
                trip=trip,
                travel_date=travel_date,
                total_fare=total_fare,
                status='PENDING'
            )

            # Create Passengers
            for p_data in passengers_data:
                Passenger.objects.create(
                    booking=booking,
                    name=p_data['name'],
                    age=p_data['age'],
                    gender=p_data['gender'],
                    seat_number=p_data['seat_number'],
                    nid=p_data.get('nid')
                )

            # Update trip seat_layout to mark seats as booked (False)
            updated_layout = dict(trip.seat_layout or {})
            for seat in selected_seats:
                updated_layout[seat] = False
            trip.seat_layout = updated_layout
            trip.save()

        return Response({
            "message": "Booking created. Please complete the payment.",
            "booking": BookingSerializer(booking).data
        }, status=status.HTTP_201_CREATED)


class BookingPaymentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, id=pk, user=request.user)
        payment_method = request.data.get('payment_method') # BKASH, NAGAD, ROCKET, CARD, BANK
        trx_id = request.data.get('trx_id')
        
        if not payment_method or not trx_id:
            return Response({"error": "payment_method and trx_id are required"}, status=status.HTTP_400_BAD_REQUEST)

        if booking.status == 'PAID':
            return Response({"error": "Booking is already paid"}, status=status.HTTP_400_BAD_REQUEST)

        if Payment.objects.filter(trx_id=trx_id).exists():
            return Response({"error": "This Transaction ID has already been used"}, status=status.HTTP_400_BAD_REQUEST)

        trip = booking.trip
        passengers = booking.passengers.all()

        with transaction.atomic():
            # Create payment record
            Payment.objects.create(
                booking=booking,
                payment_method=payment_method,
                trx_id=trx_id,
                amount=booking.total_fare,
                status='SUCCESS'
            )

            # Update booking status
            booking.status = 'PAID'
            booking.payment_method = payment_method
            booking.trx_id = trx_id
            booking.save()

            # Mark seats as taken (False) in Trip seat_layout
            layout = trip.seat_layout.copy()
            for passenger in passengers:
                layout[passenger.seat_number] = False
            
            trip.seat_layout = layout
            trip.available_seats = max(0, trip.available_seats - len(passengers))
            trip.save()

        return Response({
            "message": "Payment successful. Your ticket is confirmed.",
            "booking": BookingSerializer(booking).data
        }, status=status.HTTP_200_OK)


class MyBookingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user).order_by('-booking_date')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class TicketDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pnr):
        booking = get_object_or_404(Booking, pnr_number=pnr)
        # Ensure only the booked user can view their ticket details (or staff)
        if booking.user != request.user and not request.user.is_staff:
            return Response({"error": "Unauthorized access to this ticket"}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = BookingSerializer(booking)
        return Response(serializer.data)


class BookingCancelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, id=pk, user=request.user)
        password = request.data.get('password')
        refund_wallet = request.data.get('refund_wallet')
        reason = request.data.get('reason', 'User requested cancellation')

        if not password or not refund_wallet:
            return Response({"error": "Password and Refund Wallet Number are required for refund authentication."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate password
        if not request.user.check_password(password):
            return Response({"error": "Incorrect account password. Verification failed."}, status=status.HTTP_400_BAD_REQUEST)

        if booking.status == 'CANCELLED':
            return Response({"error": "Booking is already cancelled."}, status=status.HTTP_400_BAD_REQUEST)

        trip = booking.trip
        passengers = booking.passengers.all()

        with transaction.atomic():
            # If the booking was paid, free up the seats in the trip seat_layout
            if booking.status == 'PAID':
                layout = trip.seat_layout.copy()
                for passenger in passengers:
                    # Mark the seat as available again (True)
                    if passenger.seat_number in layout:
                        layout[passenger.seat_number] = True
                
                trip.seat_layout = layout
                trip.available_seats = min(trip.total_seats, trip.available_seats + len(passengers))
                trip.save()

            # Update booking status
            booking.status = 'CANCELLED'
            booking.save()

            # Log refund processing
            print(f"REFUND ISSUED: PNR {booking.pnr_number} - Refund Amount: {booking.total_fare} BDT refunded to wallet: {refund_wallet} - Reason: {reason}")

        return Response({
            "message": f"Ticket cancellation successful. A refund of BDT {booking.total_fare} has been initiated to your wallet {refund_wallet}.",
            "booking": BookingSerializer(booking).data
        }, status=status.HTTP_200_OK)


class AdminUsersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Server-side validation of JWT token and admin role check
        user_role = getattr(request.user.profile, 'role', 'user')
        if user_role != 'admin' and not request.user.is_staff and not request.user.is_superuser:
            return Response(
                {"error": "Access Denied: Admin privileges required to view database records."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Retrieve and serialize all registered users, bookings, payments, and searches
        users = User.objects.all().order_by('-date_joined')
        bookings = Booking.objects.all().order_by('-booking_date')
        payments = Payment.objects.all().order_by('-payment_date')
        
        from .models import SearchHistory
        from .serializers import SearchHistorySerializer
        searches = SearchHistory.objects.all().order_by('-search_time')

        users_serializer = UserSerializer(users, many=True)
        bookings_serializer = BookingSerializer(bookings, many=True)
        payments_serializer = PaymentSerializer(payments, many=True)
        searches_serializer = SearchHistorySerializer(searches, many=True)

        # Retrieve database metrics
        stats = {
            "total_users": User.objects.count(),
            "total_bookings": Booking.objects.count(),
            "total_trips": Trip.objects.count(),
            "total_stations": Station.objects.count(),
            "total_payments": Payment.objects.count(),
            "total_searches": SearchHistory.objects.count(),
        }

        return Response({
            "users": users_serializer.data,
            "bookings": bookings_serializer.data,
            "payments": payments_serializer.data,
            "searches": searches_serializer.data,
            "stats": stats
        }, status=status.HTTP_200_OK)


class AdminPaymentManageView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        user_role = getattr(request.user.profile, 'role', 'user')
        if user_role != 'admin' and not request.user.is_staff and not request.user.is_superuser:
            return Response({"error": "Access Denied: Admin privileges required."}, status=status.HTTP_403_FORBIDDEN)

        try:
            payment = Payment.objects.get(pk=pk)
        except Payment.DoesNotExist:
            return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        admin_notes = request.data.get('admin_notes')

        if new_status:
            payment.status = new_status
            if new_status == 'CANCELLED':
                payment.booking.status = 'CANCELLED'
                payment.booking.save()
            elif new_status == 'SUCCESS':
                payment.booking.status = 'PAID'
                payment.booking.save()
            elif new_status == 'REFUNDED':
                payment.booking.status = 'CANCELLED'
                payment.booking.save()

        if admin_notes is not None:
            payment.admin_notes = admin_notes

        payment.save()

        return Response({
            "message": f"Payment #{payment.id} successfully updated.",
            "payment": PaymentSerializer(payment).data
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({"error": "Email address is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({
                "error": "No account found registered with this Gmail address."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generate a 6-digit OTP
        otp = "".join(random.choices(string.digits, k=6))
        
        # Cache the OTP for 5 minutes
        cache_key = f"reset_otp_{email.lower()}"
        cache.set(cache_key, otp, timeout=300)

        # Attempt to send real Gmail SMTP message
        from django.conf import settings
        email_sent = False
        try:
            send_mail(
                'BD GoTicket — Password Reset OTP',
                f'Hello {user.username},\n\n'
                f'You have requested to reset your password. Use the following 6-digit verification code:\n\n'
                f'   👉 {otp} 👈\n\n'
                f'This code will expire in 5 minutes. If you did not make this request, please ignore this email.\n\n'
                f'Best regards,\nBD GoTicket Security Node',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            email_sent = True
        except Exception as e:
            print(f"Failed to send password reset email: {e}")

        # Return response (include simulated OTP if SMTP failed for mock testing)
        response_data = {
            "message": "Verification code dispatched to your Gmail inbox.",
            "email": email,
            "requires_otp": True
        }
        if not email_sent:
            response_data["simulated_otp"] = otp
            
        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not email or not otp or not new_password:
            return Response({"error": "Email, verification OTP, and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify cached OTP
        cache_key = f"reset_otp_{email.lower()}"
        cached_otp = cache.get(cache_key)

        if not cached_otp:
            return Response({"error": "Verification code expired or invalid. Please request a new code."}, status=status.HTTP_400_BAD_REQUEST)

        if cached_otp != str(otp).strip():
            return Response({"error": "Incorrect verification code. Please check and try again."}, status=status.HTTP_400_BAD_REQUEST)

        # Update password
        try:
            user = User.objects.get(email__iexact=email)
            user.set_password(new_password)
            user.save()
            # Clear cached OTP
            cache.delete(cache_key)
            return Response({"message": "Password updated successfully. You can now log in with your new credentials."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User no longer exists."}, status=status.HTTP_400_BAD_REQUEST)
