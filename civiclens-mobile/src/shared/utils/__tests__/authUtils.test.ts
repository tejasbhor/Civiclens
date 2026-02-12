import { validateToken } from '../authUtils';

// Mock @shared/services/storage to prevent deep imports that cause issues (like expo-sqlite -> expo-asset)
jest.mock('@shared/services/storage', () => ({
  SecureStorage: {
    clearAuthTokens: jest.fn(),
    clearUserData: jest.fn(),
    getAuthToken: jest.fn(),
    getRefreshToken: jest.fn(),
    getUserData: jest.fn(),
  },
}));

// Mock atob globally as it is used in validateToken
// In a real React Native environment, this might need a polyfill,
// but for unit testing logic, this suffices.
global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');

describe('validateToken', () => {
  it('should return isValid: true for a valid token', () => {
    // Create a dummy token with future expiration
    const payload = {
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in future
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const token = `header.${encodedPayload}.signature`;

    const result = validateToken(token);

    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(false);
    expect(result.payload).toEqual(payload);
  });

  it('should return isExpired: true for an expired token', () => {
    // Create a dummy token with past expiration
    const payload = {
      exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour in past
      sub: '1234567890',
      name: 'John Doe',
      iat: 1516239022
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const token = `header.${encodedPayload}.signature`;

    const result = validateToken(token);

    expect(result.isValid).toBe(true);
    expect(result.isExpired).toBe(true);
    expect(result.payload).toEqual(payload);
  });

  it('should return isValid: false for an invalid token format', () => {
    const token = 'invalid-token';
    const result = validateToken(token);

    expect(result.isValid).toBe(false);
    expect(result.isExpired).toBe(true);
  });

  it('should return isValid: false for invalid base64 payload', () => {
    const token = 'header.invalid-base64.signature';

    const result = validateToken(token);

    expect(result.isValid).toBe(false);
    expect(result.isExpired).toBe(true);
  });

  it('should return isValid: false for valid base64 but invalid JSON', () => {
    const encodedPayload = Buffer.from('not json').toString('base64');
    const token = `header.${encodedPayload}.signature`;

    const result = validateToken(token);

    expect(result.isValid).toBe(false);
    expect(result.isExpired).toBe(true);
  });
});
