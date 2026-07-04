const BASE_URL = 'http://127.0.0.1:8000/api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile?: {
    phone: string;
    nid: string;
    email_verified: boolean;
    phone_verified: boolean;
    nid_verified: boolean;
    nid_name: string;
    nid_dob: string;
    nid_address: string;
  };
}

export const api = {
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const mergedOptions = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {}),
      },
    };

    const response = await fetch(url, mergedOptions);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || 'Something went wrong');
    }

    return response.json() as Promise<T>;
  },

  // Auth APIs
  async login(username: string, password: string): Promise<{ access: string; refresh: string; user: User }> {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async register(data: any): Promise<{ message: string; user: User }> {
    return this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getProfile(): Promise<User> {
    return this.request('/auth/profile/');
  },

  async verifyNID(nid_number: string, dob: string): Promise<{ verified: boolean; nid_data: any }> {
    return this.request('/auth/nid-verify/', {
      method: 'POST',
      body: JSON.stringify({ nid_number, dob }),
    });
  },

  async sendOTP(target: string, channel: 'sim' | 'email'): Promise<{ success: boolean; message: string; simulated_otp: string }> {
    return this.request('/auth/send-otp/', {
      method: 'POST',
      body: JSON.stringify({ target, channel }),
    });
  },

  // Station APIs
  async getStations(): Promise<any[]> {
    return this.request('/stations/');
  },

  // Trip APIs
  async searchTrips(params: { source: string; destination: string; date: string; transport_type?: string; priority?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/trips/search/?${query}`);
  },

  async getTripDetails(tripId: string | number): Promise<any> {
    return this.request(`/trips/${tripId}/`);
  },

  // Booking APIs
  async createBooking(data: { trip_id: number; travel_date: string; passengers: any[]; class_type: string }): Promise<any> {
    return this.request('/bookings/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async payBooking(bookingId: number | string, payment_method: string, trx_id: string): Promise<any> {
    return this.request(`/bookings/${bookingId}/pay/`, {
      method: 'POST',
      body: JSON.stringify({ payment_method, trx_id }),
    });
  },

  async getMyBookings(): Promise<any[]> {
    return this.request('/bookings/my-bookings/');
  },

  async getTicketDetails(pnr: string): Promise<any> {
    return this.request(`/tickets/${pnr}/`);
  },

  async cancelBooking(bookingId: number | string, data: { password: string; refund_wallet: string; reason?: string }): Promise<any> {
    return this.request(`/bookings/${bookingId}/cancel/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
