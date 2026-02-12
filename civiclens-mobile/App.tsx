import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from './src/store/authStore';
import { AppNavigator } from './src/navigation/AppNavigator';
import { createLogger } from './src/shared/utils/logger';
import { SplashScreen } from '@/features/auth/screens/SplashScreen';
import { BiometricLockScreen } from '@/features/auth/screens/BiometricLockScreen';
import { AuthErrorBoundary } from './src/shared/components/AuthErrorBoundary';
import { useAppInitialization } from '@shared/hooks/useAppInitialization';

const log = createLogger('App');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  const { isReady, error } = useAppInitialization();
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBiometricEnabled = useAuthStore((state) => state.isBiometricEnabled);

  useEffect(() => {
    if (isReady) {
      // Check if we need biometric unlock once app is ready
      const needsUnlock = isAuthenticated && isBiometricEnabled;
      log.info(`Biometric unlock needed: ${needsUnlock}`);

      if (!needsUnlock) {
        setIsUnlocked(true);
      }
    }
  }, [isReady, isAuthenticated, isBiometricEnabled]);

  if (error) {
    return (
      <SafeAreaProvider>
        <SplashScreen
          statusHeading="Initialization Error"
          statusMessage={error || 'Something went wrong while starting CivicLens'}
          highlights={['Check your connection', 'Restart CivicLens', 'Contact support if persistent']}
          footerText="Something went wrong"
          footerSubtext="Tap to restart the app"
          isError
        />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  if (!isReady) {
    return (
      <SafeAreaProvider>
        <SplashScreen />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  // Show biometric lock screen if user is authenticated and biometric is enabled
  if (isAuthenticated && isBiometricEnabled && !isUnlocked) {
    return (
      <SafeAreaProvider>
        <BiometricLockScreen onUnlock={() => setIsUnlocked(true)} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppNavigator />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </AuthErrorBoundary>
    </SafeAreaProvider>
  );
}
