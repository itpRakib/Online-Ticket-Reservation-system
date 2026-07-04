from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, MockNIDDatabase, Station, Trip, Booking, Passenger, Payment

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone', 'nid', 'email_verified', 'phone_verified', 'nid_verified', 'nid_name', 'nid_dob', 'nid_address']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']

class RegisterSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(write_only=True, required=True)
    nid = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    
    # NID Verification mock data passed from client (validated in view, but stored here)
    nid_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    nid_dob = serializers.DateField(write_only=True, required=False)
    nid_address = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'nid', 'nid_name', 'nid_dob', 'nid_address']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_phone(self, value):
        # Format input phone if not formatted to match database entries
        formatted = value.trim() if hasattr(value, 'trim') else value.strip()
        if formatted.startswith('0'):
            formatted = '+88' + formatted
        elif not formatted.startswith('+88'):
            formatted = '+880' + formatted

        if UserProfile.objects.filter(phone=formatted).exists():
            raise serializers.ValidationError("Phone number already registered.")
        return value

    def validate_nid(self, value):
        if UserProfile.objects.filter(nid=value).exists():
            raise serializers.ValidationError("This NID is already registered with another account.")
        return value

    def create(self, validated_data):
        phone = validated_data.pop('phone')
        nid = validated_data.pop('nid')
        password = validated_data.pop('password')
        
        nid_name = validated_data.get('nid_name', '')
        nid_dob = validated_data.get('nid_dob', None)
        nid_address = validated_data.get('nid_address', '')

        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Profile is created by signal. Let's update it.
        profile = user.profile
        profile.phone = phone
        profile.nid = nid
        profile.phone_verified = True  # Verified via SIM OTP simulation in frontend
        profile.email_verified = True  # Verified via Gmail OTP simulation in frontend
        profile.nid_verified = True    # Verified via NID simulation in frontend
        profile.nid_name = nid_name
        profile.nid_dob = nid_dob
        profile.nid_address = nid_address
        profile.save()

        return user


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = '__all__'


class TripSerializer(serializers.ModelSerializer):
    source = StationSerializer(read_only=True)
    destination = StationSerializer(read_only=True)
    duration_hours = serializers.ReadOnlyField()

    class Meta:
        model = Trip
        fields = [
            'id', 'transport_type', 'operator_name', 'transport_identifier',
            'source', 'destination', 'departure_time', 'arrival_time',
            'fare_economy', 'fare_business', 'total_seats', 'available_seats',
            'seat_layout', 'duration_hours'
        ]


class PassengerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Passenger
        fields = ['id', 'name', 'age', 'gender', 'seat_number', 'nid']


class BookingSerializer(serializers.ModelSerializer):
    passengers = PassengerSerializer(many=True, read_only=True)
    trip = TripSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'pnr_number', 'user', 'trip', 'booking_date',
            'travel_date', 'total_fare', 'status', 'payment_method',
            'trx_id', 'passengers'
        ]


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class MockNIDDatabaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MockNIDDatabase
        fields = '__all__'
