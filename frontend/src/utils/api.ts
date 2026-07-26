const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

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

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  },

  setAuthToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  setRefreshToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refresh_token', token);
    }
  },

  clearAuthToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
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
      const message = errorData.error || errorData.detail || errorData.message || 'Something went wrong';
      throw new Error(message);
    }

    return response.json() as Promise<T>;
  },

  // Attempt to refresh the access token using the stored refresh token
  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        this.clearAuthToken();
        return null;
      }

      const data = await response.json();
      this.setAuthToken(data.access);
      return data.access;
    } catch {
      this.clearAuthToken();
      return null;
    }
  },

  // Auth APIs
  async login(username: string, password: string): Promise<{ access: string; refresh: string; user: User }> {
    try {
      return await this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        const mockUser: User = {
          id: 101,
          username,
          email: `${username}@gmail.com`,
          first_name: username,
          last_name: 'User',
          profile: {
            phone: '01817860068',
            nid: '1998269271829',
            email_verified: true,
            phone_verified: true,
            nid_verified: true,
            nid_name: username,
            nid_dob: '2000-01-01',
            nid_address: 'Dhaka, Bangladesh',
          },
        };
        const access = 'mock-access-token-' + Date.now();
        const refresh = 'mock-refresh-token-' + Date.now();
        this.setAuthToken(access);
        this.setRefreshToken(refresh);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(mockUser));
        }
        return { access, refresh, user: mockUser };
      }
      throw err;
    }
  },

  async register(data: any): Promise<{ message: string; user: User }> {
    try {
      return await this.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        const mockUser: User = {
          id: Math.floor(Math.random() * 9000) + 1000,
          username: data.username,
          email: data.email,
          first_name: data.first_name || data.username,
          last_name: data.last_name || '',
          profile: {
            phone: data.phone || '',
            nid: data.nid || '',
            email_verified: true,
            phone_verified: true,
            nid_verified: true,
            nid_name: data.nid_name || data.first_name || data.username,
            nid_dob: data.nid_dob || '',
            nid_address: data.nid_address || 'Dhaka, Bangladesh',
          },
        };
        this.setAuthToken('mock-access-token-' + Date.now());
        this.setRefreshToken('mock-refresh-token-' + Date.now());
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(mockUser));
        }
        return {
          message: 'User registered successfully',
          user: mockUser,
        };
      }
      throw err;
    }
  },

  async getProfile(): Promise<User> {
    try {
      return await this.request('/auth/profile/');
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('user');
          if (saved) return JSON.parse(saved);
        }
        return {
          id: 101,
          username: 'Rakib',
          email: 'rakib@gmail.com',
          first_name: 'Rakibul',
          last_name: 'Islam',
          profile: {
            phone: '01817860068',
            nid: '1998269271829',
            email_verified: true,
            phone_verified: true,
            nid_verified: true,
            nid_name: 'Rakibul Islam',
            nid_dob: '2000-01-01',
            nid_address: 'Dhaka, Bangladesh',
          },
        };
      }
      throw err;
    }
  },

  async verifyNID(nid_number: string, dob: string): Promise<{ verified: boolean; nid_data: any }> {
    try {
      return await this.request('/auth/nid-verify/', {
        method: 'POST',
        body: JSON.stringify({ nid_number, dob }),
      });
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        return {
          verified: true,
          nid_data: {
            full_name: 'Rakibul Islam',
            father_name: 'Md. Abdur Rahim',
            mother_name: 'Rokeya Begum',
            address: 'Dhaka, Bangladesh',
            dob: dob || '2000-01-01',
          },
        };
      }
      throw err;
    }
  },

  async sendOTP(target: string, channel: 'sim' | 'email'): Promise<{ success: boolean; message: string; simulated_otp: string }> {
    try {
      return await this.request('/auth/send-otp/', {
        method: 'POST',
        body: JSON.stringify({ target, channel }),
      });
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        const simulated_otp = Math.floor(100000 + Math.random() * 900000).toString();
        return {
          success: true,
          message: `[SMS Gateway Simulated] Verification OTP sent to ${target}: Code = ${simulated_otp}`,
          simulated_otp,
        };
      }
      throw err;
    }
  },

  // Station APIs
  async getStations(): Promise<any[]> {
    try {
      return await this.request('/stations/');
    } catch (err: any) {
      return [];
    }
  },

  // Trip APIs
  async searchTrips(params: { source: string; destination: string; date: string; transport_type?: string; priority?: string }): Promise<any> {
    const query = new URLSearchParams(params as any).toString();
    try {
      return await this.request(`/trips/search/?${query}`);
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        return [];
      }
      throw err;
    }
  },

  async getTripDetails(tripId: string | number): Promise<any> {
    try {
      return await this.request(`/trips/${tripId}/`);
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        return null;
      }
      throw err;
    }
  },

  // Booking APIs
  async createBooking(data: { trip_id: number; travel_date: string; passengers: any[]; class_type: string }): Promise<any> {
    try {
      return await this.request('/bookings/create/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        const pnr = 'PNR-' + Math.floor(100000 + Math.random() * 900000);
        return {
          id: Date.now(),
          pnr_number: pnr,
          status: 'PENDING',
          total_price: 1200,
        };
      }
      throw err;
    }
  },

  async payBooking(bookingId: number | string, payment_method: string, trx_id: string): Promise<any> {
    try {
      return await this.request(`/bookings/${bookingId}/pay/`, {
        method: 'POST',
        body: JSON.stringify({ payment_method, trx_id }),
      });
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        return {
          status: 'CONFIRMED',
          pnr_number: 'PNR-' + Math.floor(100000 + Math.random() * 900000),
          message: 'Payment completed successfully (Simulated)',
        };
      }
      throw err;
    }
  },

  async getMyBookings(): Promise<any[]> {
    try {
      return await this.request('/bookings/my-bookings/');
    } catch (err: any) {
      return [];
    }
  },

  async getTicketDetails(pnr: string): Promise<any> {
    try {
      return await this.request(`/tickets/${pnr}/`);
    } catch (err: any) {
      return null;
    }
  },

  async cancelBooking(bookingId: number | string, data: { password: string; refund_wallet: string; reason?: string }): Promise<any> {
    try {
      return await this.request(`/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message?.includes('fetch')) {
        return {
          status: 'CANCELLED',
          refund_amount: '1200.00',
          message: 'Booking cancelled and refund initiated (Simulated)',
        };
      }
      throw err;
    }
  },
};
