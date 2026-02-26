import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { colors } from '@shared/theme/colors';

/**
 * Consistent gradient used across the entire login flow.
 * Darker blue palette chosen for a premium, official feel.
 */
export const AUTH_GRADIENT: [string, string] = ['#0D47A1', '#1565C0'];

type RoleSelectionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'RoleSelection'
>;

interface RoleSelectionScreenProps {
  navigation: RoleSelectionScreenNavigationProp;
  onSelectRole?: (role: 'citizen' | 'officer') => void;
}

/**
 * Role selection landing screen. Users choose between Citizen and Officer flows.
 * Uses ScrollView for smaller screens and consistent gradient theming.
 */
export const RoleSelectionScreen = ({ navigation, onSelectRole }: RoleSelectionScreenProps) => {
  const handleSelectRole = (role: 'citizen' | 'officer') => {
    if (onSelectRole) {
      onSelectRole(role);
    } else {
      if (role === 'citizen') {
        navigation.navigate('CitizenLogin');
      } else {
        navigation.navigate('OfficerLogin');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Card */}
        <LinearGradient
          colors={AUTH_GRADIENT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>CL</Text>
            </View>
            <View style={styles.heroTextBlock}>
              <Text style={styles.heroTitle}>CivicLens</Text>
              <Text style={styles.heroSubtitle}>
                One platform for citizens & officers to collaborate on civic issues.
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Role Cards */}
        <View style={styles.roleGrid}>
          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View style={[styles.roleIcon, styles.roleIconPrimary]}>
                <Ionicons name="people" size={22} color="#0D47A1" />
              </View>
              <View style={styles.roleHeaderText}>
                <Text style={styles.roleTitle}>Citizen</Text>
                <Text style={styles.roleDescription}>
                  Submit reports, track progress, and validate nearby issues.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={() => handleSelectRole('citizen')}
            >
              <Text style={styles.primaryButtonText}>Continue as Citizen</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <View style={[styles.roleIcon, styles.roleIconSecondary]}>
                <Ionicons name="shield-checkmark" size={22} color={colors.secondaryDark} />
              </View>
              <View style={styles.roleHeaderText}>
                <Text style={styles.roleTitle}>Nodal Officer</Text>
                <Text style={styles.roleDescription}>
                  Manage assigned tasks, capture proofs, and update citizens.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.85}
              onPress={() => handleSelectRole('officer')}
            >
              <Text style={styles.secondaryButtonText}>Continue as Officer</Text>
              <Ionicons name="arrow-forward" size={16} color="#0D47A1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Offline-first  •  Secure  •  Available in 6 languages
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    flexGrow: 1,
    justifyContent: 'center',
  },

  // ---- Hero Card ----
  heroCard: {
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#0D47A1',
    shadowOpacity: 0.14,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoBadgeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },

  // ---- Role Grid ----
  roleGrid: {
    gap: 14,
    marginBottom: 20,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  roleHeaderText: {
    flex: 1,
  },
  roleIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleIconPrimary: {
    backgroundColor: 'rgba(13,71,161,0.08)',
  },
  roleIconSecondary: {
    backgroundColor: 'rgba(16,185,129,0.10)',
  },
  roleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  roleDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  primaryButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0D47A1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#0D47A1',
    fontSize: 14,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: 12,
    marginTop: 4,
  },
});
