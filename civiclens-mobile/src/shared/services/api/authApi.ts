// Authentication API service
import { apiClient } from './apiClient';
import { AuthTokens, User } from '@shared/types/user';
import { SecureStorage } from '@shared/services/storage';

console.log('[AuthApi] Module loading...');

// Helper function to handle API errors
function handleError(error: any): Error {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.detail || error.response.data?.message || 'An error occurred';
    return new Error(message);
  } else if (error.request) {
    // Request made but no response
    return new Error('No response from server. Please check your connection.');
  } else if (error.type === 'NETWORK_ERROR') {
    // Network error from interceptor
    return new Error('No internet connection. Please check your network.');
  } else {
    // Something else happened
    return new Error(error.message || 'An unexpected error occurred');
  }
}

// Helper function to store authentication data
async function storeAuthData(tokens: AuthTokens): Promise<void> {
  // Store tokens in secure storage
  await SecureStorage.setAuthToken(tokens.access_token);
  await SecureStorage.setRefreshToken(tokens.refresh_token);

  // Note: User data will be fetched separately after tokens are stored
  // This avoids circular dependency issues
}

export interface OTPRequest {
  phone: string;
}

export interface OTPResponse {
  message: string;
  otp?: string; // Only in debug mode
  expires_in_minutes: number;
}

export interface OTPVerify {
  phone: string;
  otp: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
  portal_type: 'citizen' | 'officer';
}

export interface SignupRequest {
  phone: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email?: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Export authApi as plain object (like web client)
export const authApi = {
  /**
   * Request OTP for phone number
   */
  async requestOTP(phone: string): Promise<OTPResponse> {
    try {
      console.log('[AuthApi] Requesting OTP for:', phone);
      const response = await apiClient.post<OTPResponse>('/auth/request-otp', {
        phone,
      });
      console.log('[AuthApi] OTP response received');
      return response;
    } catch (error: any) {
      console.error('[AuthApi] OTP request failed:', error);
      throw handleError(error);
    }
  },

  /**
   * Verify OTP and get tokens
   */
  async verifyOTP(phone: string, otp: string): Promise<AuthTokens> {
    try {
      console.log('[AuthApi] Verifying OTP for:', phone);
      const response = await apiClient.post<AuthTokens>('/auth/verify-otp', {
        phone,
        otp,
      });

      // Store tokens
      await storeAuthData(response);

      // Fetch and store user data
      try {
        const user = await apiClient.get<User>('/users/me');
        await SecureStorage.setUserData(user);
        console.log('[AuthApi] User data fetched:', user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }

      return response;
    } catch (error: any) {
      console.error('[AuthApi] OTP verification failed:', error);
      throw handleError(error);
    }
  },

  /**
   * Request OTP for email
   */
  async requestEmailOTP(email: string): Promise<OTPResponse> {
    try {
      console.log('[AuthApi] Requesting Email OTP for:', email);
      const response = await apiClient.post<OTPResponse>('/auth/request-email-otp', {
        email,
      });
      console.log('[AuthApi] Email OTP response received');
      return response;
    } catch (error: any) {
      console.error('[AuthApi] Email OTP request failed:', error);
      throw handleError(error);
    }
  },

  /**
   * Verify Email OTP and get tokens
   */
  async verifyEmailOTP(email: string, otp: string): Promise<AuthTokens> {
    try {
      console.log('[AuthApi] Verifying Email OTP for:', email);
      const response = await apiClient.post<AuthTokens>('/auth/verify-email-otp', {
        email,
        otp,
      });

      // Store tokens
      await storeAuthData(response);

      // Fetch and store user data
      try {
        const user = await apiClient.get<User>('/users/me');
        await SecureStorage.setUserData(user);
        console.log('[AuthApi] User data fetched:', user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }

      return response;
    } catch (error: any) {
      console.error('[AuthApi] Email OTP verification failed:', error);
      throw handleError(error);
    }
  },

  /**
   * Login with phone and password
   */
  async login(phone: string, password: string, portalType: 'citizen' | 'officer' = 'citizen'): Promise<AuthTokens> {
    try {
      console.log('[AuthApi] Logging in:', phone, 'portal:', portalType);
      const response = await apiClient.post<AuthTokens>('/auth/login', {
        phone,
        password,
        portal_type: portalType,
      });

      console.log('[AuthApi] Login response received');

      // Store tokens
      await storeAuthData(response);

      // Fetch and store user data
      try {
        const user = await apiClient.get<User>('/users/me');
        await SecureStorage.setUserData(user);
        console.log('[AuthApi] User data fetched:', user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }

      return response;
    } catch (error: any) {
      console.error('[AuthApi] Login failed:', error);
      throw handleError(error);
    }
  },

  /**
   * Sign up new user
   */
  async signup(data: SignupRequest): Promise<{ message: string; user_id: number; otp?: string }> {
    try {
      console.log('[AuthApi] Signing up:', data.phone);
      const response = await apiClient.post<{ message: string; user_id: number; otp?: string }>('/auth/signup', data);
      return response;
    } catch (error: any) {
      console.error('[AuthApi] Signup failed:', error);
      throw handleError(error);
    }
  },

  /**
   * Verify phone after signup
   */
  async verifyPhone(phone: string, otp: string): Promise<AuthTokens> {
    try {
      console.log('[AuthApi] Verifying phone:', phone);
      const response = await apiClient.post<AuthTokens>('/auth/verify-phone', {
        phone,
        otp,
      });

      // Store tokens
      await storeAuthData(response);

      // Fetch and store user data
      try {
        const user = await apiClient.get<User>('/users/me');
        await SecureStorage.setUserData(user);
        console.log('[AuthApi] User data fetched:', user);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }

      return response;
    } catch (error: any) {
      console.error('[AuthApi] Phone verification failed:', error);
      throw handleError(error);
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const response = await apiClient.post<{ access_token: string }>('/auth/refresh', {
        refresh_token: refreshToken,
      });

      // Update access token
      await SecureStorage.setAuthToken(response.access_token);

      return response;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/users/me');

      // Store user data in secure storage
      await SecureStorage.setUserData(response);

      return response;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint
      await apiClient.post('/auth/logout', {}, { timeout: 5000 });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local data
      await SecureStorage.clearAuthTokens();
      await SecureStorage.clearUserData();
    }
  },
};

console.log('[AuthApi] Module loaded');
console.log('[AuthApi] authApi.login:', typeof authApi.login);
console.log('[AuthApi] authApi.requestOTP:', typeof authApi.requestOTP);
console.log('[AuthApi] keys:', Object.keys(authApi));
