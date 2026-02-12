import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Environment = 'development' | 'staging' | 'production';

interface EnvConfig {
  API_BASE_URL: string;
  MINIO_BASE_URL: string;
  GRAPHQL_ENDPOINT: string;
  ENABLE_LOGGING: boolean;
  ENVIRONMENT: Environment;
}

// Storage key for custom server URL
const CUSTOM_SERVER_URL_KEY = '@civiclens_custom_server_url';

// Environment variables from Expo
const EXPO_PUBLIC_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const EXPO_PUBLIC_MINIO_URL = process.env.EXPO_PUBLIC_MINIO_URL;
const EXPO_PUBLIC_GRAPHQL_ENDPOINT = process.env.EXPO_PUBLIC_GRAPHQL_ENDPOINT;
const EXPO_PUBLIC_ENV = (process.env.EXPO_PUBLIC_ENV as Environment) || 'development';

// Automatically detect the correct API URL based on environment (Development fallback)
const getDevApiBaseUrl = (): string => {
  if (EXPO_PUBLIC_API_BASE_URL) return EXPO_PUBLIC_API_BASE_URL;

  // Auto-detect for Expo Go
  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (debuggerHost) {
    console.log('🔗 Auto-detected API host:', debuggerHost);
    return `http://${debuggerHost}:8000/api/v1`;
  }

  // Fallback for emulators
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

const getDevMinioBaseUrl = (): string => {
  if (EXPO_PUBLIC_MINIO_URL) return EXPO_PUBLIC_MINIO_URL;

  const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (debuggerHost) {
    console.log('🖼️ Auto-detected MinIO host:', debuggerHost);
    return `http://${debuggerHost}:9000`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:9000';
  }
  return 'http://localhost:9000';
};

const getEnvConfig = (): EnvConfig => {
  const env = EXPO_PUBLIC_ENV;
  const isDev = env === 'development';

  // Use environment variables or fallbacks
  const apiBaseUrl = isDev
    ? getDevApiBaseUrl()
    : (EXPO_PUBLIC_API_BASE_URL || 'https://api.civiclens.com/api/v1');

  const minioBaseUrl = isDev
    ? getDevMinioBaseUrl()
    : (EXPO_PUBLIC_MINIO_URL || 'https://minio.civiclens.com');

  const graphqlEndpoint = EXPO_PUBLIC_GRAPHQL_ENDPOINT || apiBaseUrl.replace('/api/v1', '/graphql');

  return {
    API_BASE_URL: apiBaseUrl,
    MINIO_BASE_URL: minioBaseUrl,
    GRAPHQL_ENDPOINT: graphqlEndpoint,
    ENABLE_LOGGING: isDev || env === 'staging',
    ENVIRONMENT: env,
  };
};

export const ENV = getEnvConfig();

// Helper functions to manage custom server URL
export const getCustomServerUrl = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(CUSTOM_SERVER_URL_KEY);
  } catch (error) {
    console.error('Failed to get custom server URL:', error);
    return null;
  }
};

export const setCustomServerUrl = async (url: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CUSTOM_SERVER_URL_KEY, url);
  } catch (error) {
    console.error('Failed to set custom server URL:', error);
    throw error;
  }
};

export const clearCustomServerUrl = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CUSTOM_SERVER_URL_KEY);
  } catch (error) {
    console.error('Failed to clear custom server URL:', error);
  }
};

export const getActiveApiUrl = async (): Promise<string> => {
  const customUrl = await getCustomServerUrl();
  return customUrl || ENV.API_BASE_URL;
};
