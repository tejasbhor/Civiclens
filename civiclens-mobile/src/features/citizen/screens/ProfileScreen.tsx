/**
 * ProfileScreen — Production Ready
 *
 * Features:
 * - Real user profile & stats from /users/me and /users/me/stats
 * - "Complete Profile" banner shown only when profile is incomplete
 * - Account Verification section with real phone/email verified state
 * - Reputation progress bar (real points, not hardcoded)
 * - Single logout button with confirmation dialog ONLY
 * - Pull-to-refresh
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBottomTabPadding } from '@shared/utils/screenPadding';

import { useAuthStore } from '@store/authStore';
import { apiClient } from '@shared/services/api/apiClient';
import { userApi, type UserStats, type VerificationStatus } from '@shared/services/api/userApi';
import { TopNavbar } from '@shared/components';
import { Toast } from '@shared/components';
import { useToast } from '@shared/hooks/useToast';
import { BiometricSettings } from '@/features/auth/components/BiometricSettings';
import { APP_CONFIG } from '@/config/appConfig';

// ───────────────────────────────────────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────────────────────────────────────

interface UserProfile {
  id: number;
  phone: string;
  email?: string;
  full_name?: string;
  role: string;
  reputation_score: number;
  total_reports: number;
  total_validations: number;
  helpful_validations: number;
  primary_address?: string;
  bio?: string;
  preferred_language?: string;
  phone_verified: boolean;
  email_verified: boolean;
  profile_completion: 'minimal' | 'basic' | 'complete';
  aadhaar_linked: boolean;
  digilocker_linked: boolean;
  created_at: string;
}

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

const BADGE_LEVELS = [
  { min: 1000, name: 'Gold', color: '#F59E0B', icon: 'trophy' as const },
  { min: 500, name: 'Silver', color: '#64748B', icon: 'medal' as const },
  { min: 100, name: 'Bronze', color: '#92400E', icon: 'ribbon' as const },
  { min: 0, name: 'Beginner', color: '#94A3B8', icon: 'star' as const },
];

const getBadge = (score: number) =>
  BADGE_LEVELS.find((b) => score >= b.min) ?? BADGE_LEVELS[BADGE_LEVELS.length - 1];

/** Returns which profile fields are still missing */
const getMissingItems = (p: UserProfile): string[] => {
  const m: string[] = [];
  if (!p.full_name) m.push('Full Name');
  if (!p.email) m.push('Email');
  if (!p.primary_address) m.push('Address');
  return m;
};

const isComplete = (p: UserProfile) =>
  p.profile_completion === 'complete' || getMissingItems(p).length === 0;

// ───────────────────────────────────────────────────────────────────────────────
// Sub-components
// ───────────────────────────────────────────────────────────────────────────────

interface VerificationRowProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  verified: boolean;
  loading?: boolean;
  onPress?: () => void;
}

const VerificationRow: React.FC<VerificationRowProps> = ({
  icon, iconColor, iconBg, title, subtitle, verified, loading, onPress,
}) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    disabled={verified || loading}
    activeOpacity={0.7}
  >
    <View style={styles.menuItemLeft}>
      <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <View>
        <Text style={styles.menuItemText}>{title}</Text>
        <Text style={styles.menuItemSubtext}>{subtitle}</Text>
      </View>
    </View>
    <View style={styles.menuItemRight}>
      {loading ? (
        <ActivityIndicator size="small" color="#1976D2" />
      ) : verified ? (
        <View style={styles.verifiedChip}>
          <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
      ) : (
        <View style={styles.unverifiedChip}>
          <Text style={styles.unverifiedText}>Verify</Text>
          <Ionicons name="chevron-forward" size={14} color="#FF9800" />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

// ───────────────────────────────────────────────────────────────────────────────
// Main Screen
// ───────────────────────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuthStore();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(user as any); // Use user from store as initial profile
  const [stats, setStats] = useState<UserStats | null>(null);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(!user); // Only load if no user in store
  const [refreshing, setRefreshing] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  // ── Modal states ────────────────────────────────────────────────────────────
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [verificationType, setVerificationType] = useState<'phone' | 'email'>('phone');
  const [verificationCode, setVerificationCode] = useState('');
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [profileData, statsData, verificationData] = await Promise.all([
        apiClient.get<UserProfile>('/users/me'),
        userApi.getMyStats(),
        userApi.getVerificationStatus(),
      ]);
      setProfile(profileData);
      setStats(statsData);
      setVerification(verificationData);
    } catch (err: any) {
      if (err?.isAxiosError && err.message === 'Network Error') {
        console.info('[ProfileScreen] Network unavailable, skipping fresh data fetch');
      } else {
        console.error('[ProfileScreen] Failed to load data:', err);
        // Don't alert if it's a silent background fetch
        if (!isSilent) {
          Alert.alert('Error', 'Failed to load profile. Pull down to retry.');
        }
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Always do a silent load on mount to get fresh stats
    loadAll(true);
  }, [loadAll]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      await loadAll();
    } catch (err) {
      console.error('[ProfileScreen] Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // ── Phone Verification Flow ─────────────────────────────────────────────────
  const handleVerifyPhone = async () => {
    if (!profile?.phone) return;
    setVerifyingPhone(true);
    try {
      const res = await userApi.sendPhoneVerification();
      const debugOtp = res.debug_otp;

      if (debugOtp) {
        setVerificationCode(debugOtp);
        showSuccess(`Verification code sent! (Dev OTP: ${debugOtp})`);
      } else {
        setVerificationCode('');
        showSuccess(`OTP sent to ${profile.phone}`);
      }
      setVerificationType('phone');
      setVerificationModalVisible(true);
    } catch (err: any) {
      showError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setVerifyingPhone(false);
    }
  };

  // ── Email Verification Flow ─────────────────────────────────────────────────
  const handleVerifyEmail = async () => {
    if (!profile?.email) {
      Alert.alert('No Email', 'Please add an email in Edit Profile first.', [
        { text: 'Go to Edit Profile', onPress: () => navigation.navigate('EditProfile') },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    setVerifyingEmail(true);
    try {
      const res = await userApi.sendEmailVerification();
      const debugToken = res.debug_token;

      if (debugToken) {
        setVerificationCode(debugToken);
        showSuccess(`Verification code sent! (Dev Token: ${debugToken})`);
      } else {
        setVerificationCode('');
        showSuccess(`Verification email sent to ${profile.email}`);
      }
      setVerificationType('email');
      setVerificationModalVisible(true);
    } catch (err: any) {
      showError(err?.message || 'Failed to send verification email. Please try again.');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const updateProfileField = async (field: string, value: any) => {
    try {
      if (!profile) return;
      await userApi.updateProfile({ [field]: value });
      setProfile({ ...profile, [field]: value });
      showSuccess(`${field.replace(/_/g, ' ')} updated`);
    } catch (err: any) {
      showError(err?.message || `Failed to update ${field}`);
    }
  };

  const submitVerification = async () => {
    if (!verificationCode.trim()) {
      showError('Please enter the verification code');
      return;
    }
    setSubmittingVerification(true);
    try {
      if (verificationType === 'phone') {
        await userApi.verifyPhone(verificationCode.trim());
      } else {
        await userApi.verifyEmail(verificationCode.trim());
      }
      await loadAll();
      setVerificationModalVisible(false);
      showSuccess(`✅ ${verificationType === 'phone' ? 'Phone' : 'Email'} verified successfully!`);
    } catch (err: any) {
      showError('Invalid or expired token. Please try again.');
    } finally {
      setSubmittingVerification(false);
    }
  };

  // ── Single logout with confirmation ─────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => logout() },
      ],
      { cancelable: true }
    );
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.container}>
        <TopNavbar title="Profile" showNotifications />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading profile…</Text>
        </View>
        <Toast {...toast} onHide={hideToast} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <TopNavbar title="Profile" showNotifications />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadAll()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
        <Toast {...toast} onHide={hideToast} />
      </View>
    );
  }

  const badge = getBadge(stats?.reputation_score ?? profile.reputation_score);
  const missingItems = getMissingItems(profile);
  const profileComplete = isComplete(profile);
  const reputationScore = stats?.reputation_score ?? profile.reputation_score;
  const levelProgress = reputationScore % 100;      // 0-99 within current level
  const pointsToNext = 100 - levelProgress;

  return (
    <View style={styles.container}>
      <TopNavbar title="Profile" showNotifications />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1976D2']}
            tintColor="#1976D2"
          />
        }
      >
        {/* ── Incomplete Profile Banner ──────────────────────────────────── */}
        {!profileComplete && (
          <TouchableOpacity
            style={styles.bannerWrapper}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FF6B35', '#EF4444']}
              style={styles.bannerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.bannerIconBox}>
                <Ionicons name="person-add" size={22} color="#FFF" />
              </View>
              <View style={styles.bannerBody}>
                <Text style={styles.bannerTitle}>Complete Your Profile</Text>
                <Text style={styles.bannerSub}>Missing: {missingItems.join(', ')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.75)" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Profile Header ─────────────────────────────────────────────── */}
        <View style={styles.headerCard}>
          <LinearGradient colors={['#1976D2', '#1565C0']} style={styles.headerGradient}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                </Text>
              </View>
              {profile.phone_verified && (
                <View style={styles.verifiedDot}>
                  <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                </View>
              )}
            </View>

            <Text style={styles.headerName}>{profile.full_name ?? 'Set Your Name'}</Text>
            <Text style={styles.headerPhone}>{profile.phone}</Text>
            {profile.email ? (
              <Text style={styles.headerEmail}>{profile.email}</Text>
            ) : null}

            <View style={[styles.badgeChip, { backgroundColor: badge.color + '33' }]}>
              <Ionicons name={badge.icon} size={14} color="#FFF" />
              <Text style={styles.badgeChipText}>{badge.name} Citizen</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── My Impact (real stats) ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Impact</Text>
          <View style={styles.impactRow}>
            <View style={styles.impactCard}>
              <Text style={styles.impactValue}>
                {stats?.total_reports ?? profile.total_reports}
              </Text>
              <Text style={styles.impactLabel}>Reports</Text>
            </View>
            <View style={[styles.impactCard, styles.impactCardMid]}>
              <Text style={[styles.impactValue, { color: '#1976D2' }]}>
                {reputationScore}
              </Text>
              <Text style={styles.impactLabel}>Reputation</Text>
            </View>
            <View style={styles.impactCard}>
              <Text style={[styles.impactValue, { color: '#4CAF50' }]}>
                {stats?.resolved_reports ?? 0}
              </Text>
              <Text style={styles.impactLabel}>Resolved</Text>
            </View>
          </View>
        </View>

        {/* ── Reputation ────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reputation</Text>
          <View style={styles.card}>
            <View style={styles.repHeader}>
              <Text style={styles.repScore}>{reputationScore}</Text>
              <Text style={styles.repLabel}>Points</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min(levelProgress, 100)}%` }]} />
            </View>
            <Text style={styles.progressCaption}>{pointsToNext} pts to next level</Text>
            {stats?.next_milestone ? (
              <Text style={styles.milestoneText}>{stats.next_milestone}</Text>
            ) : null}
            {stats?.can_promote_to_contributor ? (
              <View style={styles.promotionBanner}>
                <Ionicons name="trophy" size={16} color="#F59E0B" />
                <Text style={styles.promotionText}>Eligible for Contributor status!</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Account Verification ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Verification</Text>
          <View style={styles.card}>
            <VerificationRow
              icon="call"
              iconColor="#2563EB"
              iconBg="#EFF6FF"
              title="Phone Number"
              subtitle={profile.phone}
              verified={verification?.phone.verified ?? profile.phone_verified}
              loading={verifyingPhone}
              onPress={handleVerifyPhone}
            />
            <View style={styles.divider} />
            <VerificationRow
              icon="mail"
              iconColor="#7C3AED"
              iconBg="#EDE9FE"
              title="Email Address"
              subtitle={profile.email ?? 'Not added yet'}
              verified={verification?.email.verified ?? profile.email_verified}
              loading={verifyingEmail}
              onPress={handleVerifyEmail}
            />
            {profile.aadhaar_linked ? (
              <>
                <View style={styles.divider} />
                <VerificationRow
                  icon="finger-print"
                  iconColor="#059669"
                  iconBg="#D1FAE5"
                  title="Aadhaar"
                  subtitle="Linked via DigiLocker"
                  verified={true}
                />
              </>
            ) : null}
          </View>
        </View>

        {/* ── Account Settings ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="person-outline" size={20} color="#2563EB" />
                </View>
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="notifications-outline" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.menuItemText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Security (Biometrics) ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <BiometricSettings phone={profile.phone} />
        </View>

        {/* ── Preferences ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Alert.alert(
                  'Select Language',
                  'Choose your preferred language',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'English',
                      onPress: () => updateProfileField('preferred_language', 'en')
                    },
                    {
                      text: 'Hindi',
                      onPress: () => updateProfileField('preferred_language', 'hi')
                    },
                  ]
                );
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="language-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.menuItemText}>Language</Text>
              </View>
              <View style={styles.menuItemRight}>
                <Text style={styles.menuItemValue}>
                  {profile.preferred_language === 'hi' ? 'Hindi' : 'English'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (navigation as any).navigate('Legal', { type: 'privacy' })}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#22C55E" />
                </View>
                <Text style={styles.menuItemText}>Privacy & Security</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── About ────────────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (navigation as any).navigate('HelpSupport')}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="help-circle-outline" size={20} color="#EF4444" />
                </View>
                <Text style={styles.menuItemText}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="information-circle-outline" size={20} color="#0EA5E9" />
                </View>
                <Text style={styles.menuItemText}>App Version</Text>
              </View>
              <Text style={styles.menuItemValue}>{APP_CONFIG.appVersion}</Text>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (navigation as any).navigate('Legal', { type: 'terms' })}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Ionicons name="document-text-outline" size={20} color="#A855F7" />
                </View>
                <Text style={styles.menuItemText}>Terms of Use</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Logout — single button with confirmation only ─────────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: getBottomTabPadding(insets, 80) }} />
      </ScrollView>

      {/* Verification Modal */}
      <Modal
        visible={verificationModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setVerificationModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBg}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Verify {verificationType === 'phone' ? 'Phone' : 'Email'}</Text>
              <TouchableOpacity onPress={() => setVerificationModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Enter the OTP sent to your {verificationType === 'phone' ? profile.phone : profile.email}
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType={verificationType === 'phone' ? "number-pad" : "default"}
              autoCapitalize="none"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.modalBtn, submittingVerification && styles.modalBtnDisabled]}
              onPress={submitVerification}
              disabled={submittingVerification}
            >
              {submittingVerification ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Verify Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Toast {...toast} onHide={hideToast} />
    </View>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Styles
// ───────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B' },
  errorTitle: { marginTop: 12, fontSize: 17, fontWeight: '600', color: '#1E293B' },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: '#1976D2',
    borderRadius: 10,
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },

  scroll: { flex: 1 },
  scrollContent: { paddingTop: 8, paddingBottom: 100 },

  // ── Banner ──────────────────────────────────────────────────────────────────
  bannerWrapper: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerBody: { flex: 1 },
  bannerTitle: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  // ── Header ──────────────────────────────────────────────────────────────────
  headerCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerGradient: { padding: 24, alignItems: 'center' },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  verifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  headerName: { fontSize: 22, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  headerPhone: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  headerEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeChipText: { fontSize: 13, fontWeight: '600', color: '#FFF' },

  // ── Section ──────────────────────────────────────────────────────────────────
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 12 },

  // ── Impact Row ───────────────────────────────────────────────────────────────
  impactRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  impactCard: { flex: 1, alignItems: 'center' },
  impactCardMid: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F1F5F9',
  },
  impactValue: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  impactLabel: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },

  // ── Card ─────────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginLeft: 62 },

  // ── Reputation ───────────────────────────────────────────────────────────────
  repHeader: { alignItems: 'center', paddingTop: 16, paddingBottom: 12 },
  repScore: { fontSize: 48, fontWeight: '800', color: '#1976D2', letterSpacing: -1 },
  repLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  progressBg: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginHorizontal: 16,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#1976D2', borderRadius: 4 },
  progressCaption: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'right',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  milestoneText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
    marginHorizontal: 16,
  },
  promotionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF9E7',
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  promotionText: { fontSize: 13, fontWeight: '600', color: '#92400E' },

  // ── Menu Items ───────────────────────────────────────────────────────────────
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  menuItemSubtext: { fontSize: 12, color: '#94A3B8', marginTop: 1 },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuItemValue: { fontSize: 13, color: '#64748B' },

  // ── Verification chips ────────────────────────────────────────────────────────
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#166534' },
  unverifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  unverifiedText: { fontSize: 12, fontWeight: '600', color: '#E65100' },

  // ── Logout ───────────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },

  // ── Modal ────────────────────────────────────────────────────────────────────
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
  },
  modalDesc: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: 2,
    fontWeight: '600',
  },
  modalBtn: {
    backgroundColor: '#1976D2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalBtnDisabled: {
    opacity: 0.7,
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

