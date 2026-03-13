import apiClient, { apiClient as clientWrapper } from './client';
import axios from 'axios';
import { AUTH_LOGOUT_EVENT } from '../store/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  role: string;
  refresh_token?: string;
}

export const authApi = {
  requestOtp: async (phone: string) => {
    const res = await apiClient.post('/auth/request-otp', { phone });
    return res.data as { message: string; otp?: string; expires_in_minutes: number };
  },

  verifyOtp: async (phone: string, otp: string) => {
    const res = await apiClient.post('/auth/verify-otp', { phone, otp });
    const data = res.data as TokenResponse;

    if (!data.access_token) {
      throw new Error('OTP verification succeeded but no access token received');
    }

    clientWrapper.setToken(data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', String(data.user_id));

    return data;
  },

  requestEmailOtp: async (email: string) => {
    const res = await apiClient.post('/auth/request-email-otp', { email });
    return res.data as { message: string; otp?: string; expires_in_minutes: number };
  },

  verifyEmailOtp: async (email: string, otp: string) => {
    const res = await apiClient.post('/auth/verify-email-otp', { email, otp });
    const data = res.data as TokenResponse;
    if (!data.access_token) {
      throw new Error('Email OTP verification succeeded but no access token received');
    }
    clientWrapper.setToken(data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', String(data.user_id));
    return data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get('/users/me');
    return res.data;
  },

  login: async (phone: string, password: string) => {
    const res = await apiClient.post('/auth/login', {
      phone,
      password,
      portal_type: 'officer'  // Admin users login via officer portal
    });
    const data = res.data as TokenResponse;

    if (!data.access_token) {
      throw new Error('Login succeeded but no access token received');
    }

    // IMPORTANT: Do NOT persist tokens yet.
    // Tokens are held in memory and only committed after MFA is complete.
    // We set the token on the API client temporarily so the next call
    // (getCurrentUser) works, but we do NOT write to localStorage.
    clientWrapper.setToken(data.access_token);

    return data;
  },

  /**
   * Persist auth tokens to localStorage. Call this ONLY after MFA
   * verification succeeds (or when MFA is skipped for super_admin).
   */
  commitAuthTokens: (data: TokenResponse) => {
    clientWrapper.setToken(data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    localStorage.setItem('user_role', data.role);
    localStorage.setItem('user_id', String(data.user_id));
  },

  /**
   * Revoke the temporary session created by password login.
   * Called after email OTP verification creates a new session to avoid
   * orphaned sessions in the database.
   */
  revokeTemporaryToken: async (tempToken: string) => {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
    } catch {
      // Best-effort — if it fails the session will expire naturally
    }
  },

  refresh: async () => {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    const res = await apiClient.post('/auth/refresh', { refresh_token });
    const data = res.data as TokenResponse;

    if (!data.access_token) {
      throw new Error('Refresh succeeded but no access token received');
    }

    clientWrapper.setToken(data.access_token);
    // Note: refresh endpoint does NOT return a new refresh_token
    // The existing refresh_token remains valid until session expires

    return data;
  },

  logout: async () => {
    // Use a raw axios call that bypasses the apiClient response interceptor.
    // This prevents the 401-handler from firing during logout (which would
    // cause error toasts, double-clears, and a hard window.location reload).
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    try {
      if (token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );
      }
    } catch (e) {
      // Swallow all errors — we always proceed to local cleanup
      console.warn('Logout backend call failed (non-critical):', e);
    }

    // Clear all auth data from localStorage
    clientWrapper.removeToken();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    // Dispatch global event so AuthProvider React state is also cleared
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }
  },

  logoutAll: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    try {
      if (token) {
        await axios.post(
          `${API_BASE_URL}/auth/logout-all`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5000,
          }
        );
      }
    } catch (e) {
      console.warn('Logout-all backend call failed (non-critical):', e);
    }

    // Clear all auth data from localStorage
    clientWrapper.removeToken();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    // Dispatch global event so AuthProvider React state is also cleared
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }
  },

  logoutOthers: async () => {
    await apiClient.post('/auth/logout-others');
  },

  requestPasswordReset: async (phone: string) => {
    const res = await apiClient.post('/auth/request-password-reset', { phone });
    return res.data as { message: string; reset_token?: string; expires_in_minutes: number };
  },

  resetPassword: async (phone: string, reset_token: string, new_password: string) => {
    const res = await apiClient.post('/auth/reset-password', { phone, reset_token, new_password });
    return res.data as { message: string };
  },

  changePassword: async (old_password: string, new_password: string) => {
    const res = await apiClient.post('/auth/change-password', { old_password, new_password });
    return res.data as { message: string };
  },

  getSessions: async (): Promise<{ sessions: any[]; total: number }> => {
    const res = await apiClient.get('/auth/sessions');
    return res.data as { sessions: any[]; total: number };
  },

  revokeSession: async (session_id: number) => {
    const res = await apiClient.delete(`/auth/sessions/${session_id}`);
    return res.data as { message: string };
  },

  verifyPassword: async (password: string): Promise<{ verified: boolean; message: string }> => {
    const res = await apiClient.post('/auth/verify-password', { password });
    return res.data as { verified: boolean; message: string };
  },

  // Two-Factor Authentication (2FA)
  setup2FA: async (): Promise<{ secret: string; qr_code: string; issuer: string }> => {
    const res = await apiClient.post('/auth/2fa/setup');
    return res.data;
  },

  enable2FA: async (code: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/auth/2fa/enable', { code });
    return res.data;
  },

  disable2FA: async (code: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/auth/2fa/disable', { code });
    return res.data;
  },

  verify2FA: async (code: string): Promise<{ message: string; verified: boolean }> => {
    const res = await apiClient.post('/auth/2fa/verify', { code });
    return res.data;
  },

  get2FAStatus: async (): Promise<{ enabled: boolean; required: boolean }> => {
    const res = await apiClient.get('/auth/2fa/status');
    return res.data;
  },
};
