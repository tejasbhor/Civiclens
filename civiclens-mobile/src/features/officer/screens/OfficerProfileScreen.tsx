/**
 * Officer Profile Screen - Production Ready
 * Profile management for officers with admin-controlled fields
 * Implements offline-first with hydration and caching
 * Smart change tracking - Save button only appears when there are changes
 * UI consistent with Citizen Profile for better UX
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBottomTabPadding } from '@shared/utils/screenPadding';

// Hooks and Services
import { TopNavbar, RoleGuard } from '../../../shared/components';
import { useOfficerProfile } from '@shared/hooks/useOfficerProfile';
import { networkService } from '../../../shared/services/network/networkService';
import { colors } from '../../../shared/theme/colors';
import { UserRole } from '../../../shared/types/user';
import { useAuthStore } from '@store/authStore';
import { APP_CONFIG } from '@/config/appConfig';

export const OfficerProfileScreen: React.FC = () => {
  return (
    <RoleGuard allowedRoles={[UserRole.NODAL_OFFICER, UserRole.ADMIN, UserRole.AUDITOR]}>
      <OfficerProfileContent />
    </RoleGuard>
  );
};

const OfficerProfileContent: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser: refreshAuthUser } = useAuthStore();

  const {
    profile: hookProfile,
    isLoading: hookLoading,
    isHydrating,
    error,
    refreshProfile,
    updateProfile,
    clearError,
  } = useOfficerProfile();

  const [isOnline, setIsOnline] = useState(networkService.isOnline());
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Derive profile by merging hook profile with auth store user
  // This ensures we always have SOMETHING to show (name, phone) immediately
  const profile = useMemo(() => {
    if (hookProfile) return hookProfile;
    if (!user) return null;
    
    // Fallback if full officer profile isn't loaded yet
    return {
      full_name: user.full_name || 'Officer',
      phone: user.phone,
      email: user.email || '',
      designation: 'Nodal Officer',
      department: 'Municipal Services',
      employee_id: '...',
      zone_assigned: 'Unassigned',
      bio: user.bio || '',
      preferred_language: user.preferred_language || 'en',
      notification_preferences: {
        task_assignments: true,
        urgent_reports: true,
        system_updates: false,
        performance_reports: true,
      }
    };
  }, [hookProfile, user]);

  const hasData = !!profile;
  const isLoading = hookLoading && !hookProfile; // Only "loading" if we have absolutely no hook data

  // Local state for editable fields
  const [editableData, setEditableData] = useState({
    bio: '',
    preferred_language: 'en',
    notification_preferences: {
      task_assignments: true,
      urgent_reports: true,
      system_updates: false,
      performance_reports: true,
    },
  });

  // Track original data to detect changes
  const [originalData, setOriginalData] = useState({
    bio: '',
    preferred_language: 'en',
    notification_preferences: {
      task_assignments: true,
      urgent_reports: true,
      system_updates: false,
      performance_reports: true,
    },
  });

  useEffect(() => {
    const unsubscribe = networkService.addListener((status) => {
      setIsOnline(status.isConnected && status.isInternetReachable !== false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (profile) {
      const profileData = {
        bio: profile.bio || '',
        preferred_language: profile.preferred_language || 'en',
        notification_preferences: profile.notification_preferences || {
          task_assignments: true,
          urgent_reports: true,
          system_updates: false,
          performance_reports: true,
        },
      };
      setEditableData(profileData);
      setOriginalData(profileData);
    }
  }, [profile]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, clearError]);

  // Check if there are any changes
  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return (
      editableData.bio.trim() !== originalData.bio ||
      editableData.preferred_language !== originalData.preferred_language ||
      JSON.stringify(editableData.notification_preferences) !== JSON.stringify(originalData.notification_preferences)
    );
  }, [editableData, originalData, profile]);

  const handleSaveChanges = useCallback(async () => {
    if (!profile || !hasChanges) return;

    setIsUpdating(true);
    try {
      const updates = {
        bio: editableData.bio.trim(),
        preferred_language: editableData.preferred_language,
        notification_preferences: editableData.notification_preferences,
      };

      await updateProfile(updates);

      // Update original data after successful save
      setOriginalData({
        bio: editableData.bio.trim(),
        preferred_language: editableData.preferred_language,
        notification_preferences: editableData.notification_preferences,
      });

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  }, [profile, editableData, originalData, hasChanges, updateProfile]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshAuthUser(),
        refreshProfile()
      ]);
    } catch (err) {
      console.error('[OfficerProfile] Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAuthUser, refreshProfile]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  }, [logout]);

  // If absolutely no data and loading, show full screen spinner
  if (isLoading && !user) {
    return (
      <View style={styles.container}>
        <TopNavbar title="Officer Profile" showNotifications={true} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading officer profile…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavbar
        title="Officer Profile"
        showBack={false}
        showNotifications={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: getBottomTabPadding(insets, 24) }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {hasData && profile ? (
          <>
            {/* Profile Header Card - Robust Design */}
            <View style={styles.profileCard}>
              <LinearGradient
                colors={[colors.primary, '#1565C0']}
                style={styles.profileGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {profile.full_name?.charAt(0).toUpperCase() || 'O'}
                    </Text>
                  </View>
                  <View style={styles.officerBadge}>
                    <Ionicons name="checkmark-circle" size={22} color="#4CAF50" />
                  </View>
                </View>

                <Text style={styles.profileName}>{profile.full_name}</Text>
                <Text style={styles.profileDesignation}>{profile.designation}</Text>
                <Text style={styles.profileDepartment}>{profile.department}</Text>

                <View style={styles.badgeContainer}>
                  <Ionicons name="shield-checkmark" size={16} color="#FFF" />
                  <Text style={styles.badgeText}>Verified Municipal Officer</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Official Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Official Information</Text>
              <View style={styles.card}>
                <View style={styles.officialInfoItem}>
                  <View style={styles.officialInfoHeader}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="card-outline" size={20} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.menuItemText}>Employee ID</Text>
                      <Text style={styles.officialInfoValue}>{profile.employee_id}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.officialInfoItem}>
                  <View style={styles.officialInfoHeader}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#F0FDF4' }]}>
                      <Ionicons name="call-outline" size={20} color="#22C55E" />
                    </View>
                    <View>
                      <Text style={styles.menuItemText}>Phone Number</Text>
                      <Text style={styles.officialInfoValue}>{profile.phone}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.officialInfoItem}>
                  <View style={styles.officialInfoHeader}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="mail-outline" size={20} color="#F59E0B" />
                    </View>
                    <View>
                      <Text style={styles.menuItemText}>Email Address</Text>
                      <Text style={styles.officialInfoValue}>{profile.email || 'N/A'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.officialInfoItem}>
                  <View style={styles.officialInfoHeader}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#F3E8FF' }]}>
                      <Ionicons name="location-outline" size={20} color="#A855F7" />
                    </View>
                    <View>
                      <Text style={styles.menuItemText}>Assigned Zone</Text>
                      <Text style={styles.officialInfoValue}>{profile.zone_assigned}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Personal Information Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Profile Details</Text>
                {hasChanges && (
                  <View style={styles.unsavedIndicator}>
                    <Text style={styles.unsavedText}>Unsaved Changes</Text>
                  </View>
                )}
              </View>
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.menuItemInner}
                  onPress={() => {
                    Alert.prompt(
                      'Edit Bio',
                      'Update your bio',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Save',
                          onPress: (text?: string) => setEditableData(prev => ({ ...prev, bio: text || '' }))
                        },
                      ],
                      'plain-text',
                      editableData.bio
                    );
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#DBEAFE' }]}>
                      <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                    </View>
                    <Text style={styles.menuItemText}>Bio</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    <Text style={styles.menuItemValue} numberOfLines={1}>
                      {editableData.bio || 'Add bio'}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </View>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.menuItemInner}
                  onPress={() => {
                    Alert.alert(
                      'Select Language',
                      'Choose your preferred language',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'English',
                          onPress: () => setEditableData(prev => ({ ...prev, preferred_language: 'en' }))
                        },
                        {
                          text: 'Hindi',
                          onPress: () => setEditableData(prev => ({ ...prev, preferred_language: 'hi' }))
                        },
                      ]
                    );
                  }}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#F0FDF4' }]}>
                      <Ionicons name="language-outline" size={20} color="#22C55E" />
                    </View>
                    <Text style={styles.menuItemText}>Preferred Language</Text>
                  </View>
                  <View style={styles.menuItemRight}>
                    <Text style={styles.menuItemValue}>
                      {editableData.preferred_language === 'en' ? 'English' : 'Hindi'}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notification Preferences Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Notifications</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.menuItemInner}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="briefcase-outline" size={20} color="#2563EB" />
                    </View>
                    <View style={styles.menuItemTextContainer}>
                      <Text style={styles.menuItemText}>Task Assignments</Text>
                      <Text style={styles.menuItemDescription}>New task alerts</Text>
                    </View>
                  </View>
                  <Switch
                    value={editableData.notification_preferences.task_assignments}
                    onValueChange={(value) =>
                      setEditableData(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          task_assignments: value,
                        },
                      }))
                    }
                    trackColor={{ false: '#E2E8F0', true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={styles.divider} />

                <View style={styles.menuItemInner}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FEF2F2' }]}>
                      <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
                    </View>
                    <View style={styles.menuItemTextContainer}>
                      <Text style={styles.menuItemText}>Urgent Reports</Text>
                      <Text style={styles.menuItemDescription}>High-priority alerts</Text>
                    </View>
                  </View>
                  <Switch
                    value={editableData.notification_preferences.urgent_reports}
                    onValueChange={(value) =>
                      setEditableData(prev => ({
                        ...prev,
                        notification_preferences: {
                          ...prev.notification_preferences,
                          urgent_reports: value,
                        },
                      }))
                    }
                    trackColor={{ false: '#E2E8F0', true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>

            {/* Save Changes Button */}
            {hasChanges && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={[styles.saveButton, (!isOnline || isUpdating) && styles.saveButtonDisabled]}
                  onPress={handleSaveChanges}
                  disabled={!isOnline || isUpdating}
                  activeOpacity={0.8}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                      <Text style={styles.saveButtonText}>
                        {isOnline ? 'Save Changes' : 'Offline - Changes Cached'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Account Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.card}>
                <TouchableOpacity style={styles.menuItemInner} onPress={() => (navigation as any).navigate('HelpSupport')}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#F0F9FF' }]}>
                      <Ionicons name="help-circle-outline" size={20} color="#0EA5E9" />
                    </View>
                    <Text style={styles.menuItemText}>Help & Support</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </TouchableOpacity>

                <View style={styles.divider} />

                <View style={styles.menuItemInner}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconCircle, { backgroundColor: '#F1F5F9' }]}>
                      <Ionicons name="information-circle-outline" size={20} color="#64748B" />
                    </View>
                    <Text style={styles.menuItemText}>App Version</Text>
                  </View>
                  <Text style={styles.menuItemValue}>{APP_CONFIG.appVersion}</Text>
                </View>
              </View>
            </View>

            {/* Logout Button */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.emptyText}>Accessing profile...</Text>
          </View>
        )}

        {/* Navigation Bar Padding */}
        <View style={{ height: getBottomTabPadding(insets, 80) }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },

  // Profile Header Card
  profileCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.primary,
  },
  officerBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 2,
    elevation: 2,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  profileDesignation: {
    fontSize: 16,
    color: '#E3F2FD',
    marginBottom: 4,
    fontWeight: '500',
  },
  profileDepartment: {
    fontSize: 14,
    color: '#E3F2FD',
    opacity: 0.9,
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },

  // Sections
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
  },
  unsavedIndicator: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  unsavedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EA580C',
  },

  // Cards & Menu Items
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
  menuItemInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  menuItemValue: {
    fontSize: 13,
    color: '#64748B',
    maxWidth: 150,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 68,
  },

  // Official Info Specific
  officialInfoItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  officialInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officialInfoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    marginTop: 2,
  },

  // Buttons
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#CBD5E1',
    elevation: 0,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
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
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Misc
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
  },
});
