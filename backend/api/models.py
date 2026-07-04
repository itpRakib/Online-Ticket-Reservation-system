from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True)
    nid = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    email_verified = models.BooleanField(default=False)
    phone_verified = models.BooleanField(default=False)
    nid_verified = models.BooleanField(default=False)
    
    nid_name = models.CharField(max_length=150, null=True, blank=True)
    nid_dob = models.DateField(null=True, blank=True)
    nid_address = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    instance.profile.save()


class MockNIDDatabase(models.Model):
    """
    Mock National ID database to verify NID credentials for Bangladeshi citizens.
    """
    nid_number = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=150)
    father_name = models.CharField(max_length=150)
    mother_name = models.CharField(max_length=150)
    dob = models.DateField()
    address = models.TextField()

    def __str__(self):
        return f"{self.nid_number} - {self.full_name}"


class Station(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    district = models.CharField(max_length=100)
    is_airport = models.BooleanField(default=False)
    is_railway = models.BooleanField(default=False)
    is_bus_terminal = models.BooleanField(default=False)

    def __str__(self):
        types = []
        if self.is_airport: types.append("Airport")
        if self.is_railway: types.append("Railway")
        if self.is_bus_terminal: types.append("Bus")
        return f"{self.name} ({self.code}) - {', '.join(types)}"


class Trip(models.Model):
    TRANSPORT_CHOICES = (
        ('BUS', 'Bus'),
        ('TRAIN', 'Train'),
        ('PLANE', 'Plane'),
    )

    transport_type = models.CharField(max_length=10, choices=TRANSPORT_CHOICES)
    operator_name = models.CharField(max_length=100)  # E.g. Green Line, Hanif, US-Bangla, Subarna Express
    transport_identifier = models.CharField(max_length=50)  # E.g., Coach No, Flight No, Train No
    
    source = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='departures')
    destination = models.ForeignKey(Station, on_delete=models.CASCADE, related_name='arrivals')
    
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    
    fare_economy = models.DecimalField(max_digits=10, decimal_places=2)
    fare_business = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    total_seats = models.IntegerField(default=40)
    available_seats = models.IntegerField(default=40)
    
    # Store seat availability mapping e.g. {"A1": true, "A2": false} or similar JSON
    seat_layout = models.JSONField(default=dict)

    @property
    def duration_hours(self):
        delta = self.arrival_time - self.departure_time
        return round(delta.total_seconds() / 3600, 2)

    def __str__(self):
        return f"[{self.transport_type}] {self.operator_name} ({self.transport_identifier}) : {self.source.name} -> {self.destination.name}"


class Booking(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('CANCELLED', 'Cancelled'),
    )

    pnr_number = models.CharField(max_length=12, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    booking_date = models.DateTimeField(auto_now_add=True)
    travel_date = models.DateField()
    
    total_fare = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='PENDING')
    
    payment_method = models.CharField(max_length=50, null=True, blank=True)
    trx_id = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"{self.pnr_number} - {self.user.username} - {self.status}"


class Passenger(models.Model):
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='passengers')
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    seat_number = models.CharField(max_length=10)
    nid = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.name} - Seat {self.seat_number} (PNR: {self.booking.pnr_number})"


class Payment(models.Model):
    STATUS_CHOICES = (
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=30)  # BKASH, NAGAD, ROCKET, CARD, BANK
    trx_id = models.CharField(max_length=100, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='SUCCESS')
    payment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.payment_method} - {self.trx_id} ({self.status})"
