from django.urls import path
from .views import (
    RegisterView, MyTokenObtainPairView, UserProfileView, NIDVerificationView,
    OTPSendView, StationListView, TripSearchView, TripDetailView,
    BookingCreateView, BookingPaymentView, MyBookingsView, TicketDetailView,
    BookingCancelView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/nid-verify/', NIDVerificationView.as_view(), name='nid_verify'),
    path('auth/send-otp/', OTPSendView.as_view(), name='send_otp'),
    
    path('stations/', StationListView.as_view(), name='stations'),
    
    path('trips/search/', TripSearchView.as_view(), name='trip_search'),
    path('trips/<int:pk>/', TripDetailView.as_view(), name='trip_detail'),
    
    path('bookings/create/', BookingCreateView.as_view(), name='booking_create'),
    path('bookings/<int:pk>/pay/', BookingPaymentView.as_view(), name='booking_pay'),
    path('bookings/<int:pk>/cancel/', BookingCancelView.as_view(), name='booking_cancel'),
    path('bookings/my-bookings/', MyBookingsView.as_view(), name='my_bookings'),
    path('tickets/<str:pnr>/', TicketDetailView.as_view(), name='ticket_detail'),
]
