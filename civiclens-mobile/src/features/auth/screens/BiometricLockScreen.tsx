import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BiometricAuth } from '@shared/services/biometric';
import { APP_CONFIG } from '@/config/appConfig';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@shared/theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BiometricLockScreenProps {
  onUnlock: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ onUnlock }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const { user, logout, biometricCapabilities } = useAuthStore();
  const insets = useSafeAreaInsets();

  // Automatically trigger biometric on mount
  useEffect(() => {
    handleBiometricAuth();
  }, []);

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);

    try {
      const result = await BiometricAuth.authenticate(
        `Unlock ${APP_CONFIG.appName}`,
        'Cancel'
      );

      if (result.success) {
        // Success! Unlock the app
        onUnlock();
      } else {
        // Failed authentication
        setFailedAttempts(prev => prev + 1);
        setIsAuthenticating(false);

        // Show error message
        if (result.error && result.error !== 'Authentication cancelled by user') {
          Alert.alert('Authentication Failed', result.error, [
            { text: 'Try Again', onPress: handleBiometricAuth },
            { text: 'Logout', onPress: handleLogout, style: 'destructive' },
          ]);
        }
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      setIsAuthenticating(false);
      setFailedAttempts(prev => prev + 1);

      Alert.alert('Error', 'Biometric authentication failed. Please try again.', [
        { text: 'Try Again', onPress: handleBiometricAuth },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' },
      ]);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // onUnlock will be called automatically by App.tsx when user becomes unauthenticated
          },
        },
      ]
    );
  };

  const getBiometricIcon = () => {
    if (!biometricCapabilities) return 'finger-print';

    const types = biometricCapabilities.supportedTypes;
    if (types.includes(1)) return 'scan'; // Face recognition
    if (types.includes(2)) return 'scan'; // Iris
    return 'finger-print'; // Fingerprint (default)
  };

  const getBiometricName = () => {
    if (!biometricCapabilities) return 'Biometric';
    return BiometricAuth.getBiometricTypeName(biometricCapabilities.supportedTypes);
  };

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20
          }
        ]}
      >
        {/* Top Section */}
        <View style={styles.headerContainer}>
          <View style={styles.lockIconWrapper}>
            <Ionicons name="lock-closed" size={38} color="#FFF" />
          </View>
          <Text style={styles.lockTitle}>{APP_CONFIG.appName} Locked</Text>
          <Text style={styles.lockSubtitle}>
            Unlock with {getBiometricName().toLowerCase()} to continue
          </Text>
        </View>

        {/* Middle Section: User Info */}
        <View style={styles.middleContainer}>
          {user ? (
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user.full_name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text style={styles.userName}>{user.full_name || 'User'}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>
          ) : (
            <View />
          )}
        </View>

        {/* Bottom Section: Biometric Button & Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.biometricButton, isAuthenticating && styles.biometricButtonDisabled]}
            onPress={handleBiometricAuth}
            disabled={isAuthenticating}
            activeOpacity={0.8}
          >
            <View style={styles.biometricIconWrapper}>
              {isAuthenticating ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name={getBiometricIcon()} size={28} color={colors.primary} />
              )}
            </View>
            <Text style={styles.biometricButtonText}>
              {isAuthenticating ? 'Authenticating...' : `Unlock with ${getBiometricName()}`}
            </Text>
          </TouchableOpacity>

          {failedAttempts > 0 && (
            <Text style={styles.failedText}>
              Failed attempts: {failedAttempts}
            </Text>
          )}

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isAuthenticating}
          >
            <Ionicons name="log-out-outline" size={18} color="rgba(255,255,255,0.8)" />
            <Text style={styles.logoutText}>Switch Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  lockIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  lockTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  lockSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  middleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  userAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userAvatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  userPhone: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  actionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  biometricButton: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 100,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  biometricButtonDisabled: {
    opacity: 0.7,
  },
  biometricIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  biometricButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  failedText: {
    fontSize: 14,
    color: '#FEE2E2',
    marginTop: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

