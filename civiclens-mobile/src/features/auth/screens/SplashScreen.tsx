import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@shared/theme/colors';

const { width } = Dimensions.get('window');
const defaultHighlights = ['Offline-first ready', 'Secure OTP', 'Live task sync'];

interface SplashScreenProps {
  statusHeading?: string;
  statusMessage?: string;
  highlights?: string[];
  footerText?: string;
  footerSubtext?: string;
  isError?: boolean;
}

export const SplashScreen = ({
  statusHeading = 'Preparing CivicLens',
  statusMessage = 'Initializing secure storage, offline cache & sync',
  highlights = defaultHighlights,
  footerText = 'Offline-first • Multilingual • Secure',
  footerSubtext = 'v1.0 • Powered by CivicLens',
  isError = false,
}: SplashScreenProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    if (!isError) {
       Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: false,
      }).start();
    }
  }, [fadeAnim, progressAnim, isError]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo Container - Simplified */}
        <View style={styles.logoContainer}>
            {/*
                TODO: Replace with actual App Logo Image
                <Image source={require('@assets/logo.png')} style={styles.logoImage} />
            */}
            <View style={styles.logoCircle}>
                <Ionicons name="shield-checkmark" size={64} color="#FFFFFF" />
            </View>
          
          <Text style={styles.appName}>CivicLens</Text>
          <Text style={styles.tagline}>Citizen & Officer Collaboration Platform</Text>
        </View>

        {/* Highlights - Simplified (Static) */}
        <View style={styles.chipRow}>
          {highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightChip}>
              <Text style={styles.highlightText}>✓ {highlight}</Text>
            </View>
          ))}
        </View>

        {/* Loading Bar */}
        <View style={styles.loadingContainer}>
          <Text style={[styles.statusHeading, isError && styles.statusHeadingError]}>{statusHeading}</Text>
          {isError ? (
            <Text style={styles.errorMessage}>{statusMessage}</Text>
          ) : (
            <>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressWidth,
                    },
                  ]}
                />
              </View>
              <Text style={styles.loadingText}>{statusMessage}</Text>
            </>
          )}
        </View>
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{footerText}</Text>
        <Text style={styles.versionText}>{footerSubtext}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 8,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  highlightChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  highlightText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    width: width - 80,
    alignItems: 'center',
  },
  statusHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusHeadingError: {
    color: '#FECACA',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  loadingText: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#FECACA',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
