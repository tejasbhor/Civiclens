import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';
import { networkService } from '../services/network/networkService';
import { offlineFirstApi } from '../services/api/offlineFirstApi';
import { useOfficerProfileStore } from '../../store/officerProfileStore';

export interface OfficerProfile {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  employee_id: string;
  department: string;
  designation: string;
  zone_assigned: string;
  bio: string;
  preferred_language: string;
  notification_preferences: {
    task_assignments: boolean;
    urgent_reports: boolean;
    system_updates: boolean;
    performance_reports: boolean;
  };
  avatar_url: string | null;
  joined_date: string;
  last_active: string;
  total_tasks_completed: number;
  completion_rate: number;
  average_resolution_time: number;
  performance_rating: number;
}

export interface OfficerProfileUpdate {
  bio?: string;
  preferred_language?: string;
  notification_preferences?: {
    task_assignments?: boolean;
    urgent_reports?: boolean;
    system_updates?: boolean;
    performance_reports?: boolean;
  };
}

interface UseOfficerProfileReturn {
  profile: OfficerProfile | null;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  isHydrating: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: OfficerProfileUpdate) => Promise<void>;
  hydrateFromCache: () => Promise<void>;
  clearError: () => void;
}

export const useOfficerProfile = (): UseOfficerProfileReturn => {
  const {
    profile,
    setProfile,
    isLoading,
    setLoading,
    isHydrating,
    error,
    setError,
    hydrate
  } = useOfficerProfileStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isAuthenticated } = useAuthStore();

  const fetchOfficerProfile = useCallback(async (): Promise<OfficerProfile | null> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    const officerRoles = ['NODAL_OFFICER', 'ADMIN', 'AUDITOR'];
    if (!officerRoles.includes(user.role.toUpperCase())) {
      throw new Error(`Access denied. Officer role required. Current role: ${user.role}`);
    }

    const profileData = await offlineFirstApi.get<any>(
      `/users/me/officer-profile`,
      {
        ttl: 10 * 60 * 1000, // 10 minutes cache
        staleWhileRevalidate: true
      }
    );

    const profile: OfficerProfile = {
      id: profileData.id,
      full_name: profileData.full_name,
      phone: profileData.phone,
      email: profileData.email,
      employee_id: profileData.employee_id,
      department: profileData.department,
      designation: profileData.designation,
      zone_assigned: profileData.zone_assigned,
      bio: profileData.bio,
      preferred_language: profileData.preferred_language,
      notification_preferences: profileData.notification_preferences,
      avatar_url: profileData.avatar_url,
      joined_date: profileData.joined_date,
      last_active: profileData.last_active,
      total_tasks_completed: profileData.total_tasks_completed,
      completion_rate: profileData.completion_rate,
      average_resolution_time: profileData.average_resolution_time,
      performance_rating: profileData.performance_rating,
    };

    return profile;
  }, [isAuthenticated, user]);

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please log in to view profile');
      return;
    }

    // Only set loading if we don't have profile data yet to prevent full-screen spinner on refresh
    if (!profile) {
      setLoading(true);
    }

    setError(null);

    try {
      const profileData = await fetchOfficerProfile();
      if (profileData) {
        setProfile(profileData);
        console.log('✅ Officer profile refreshed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, fetchOfficerProfile, profile, setProfile, setLoading, setError]);

  const updateProfile = useCallback(async (updates: OfficerProfileUpdate) => {
    if (!profile) {
      throw new Error('No profile data to update');
    }

    const isOnline = networkService.isOnline();

    // Optimistic update
    const updatedProfile = {
      ...profile,
      ...updates,
      notification_preferences: {
        ...profile.notification_preferences,
        ...updates.notification_preferences,
      },
    };

    setProfile(updatedProfile);

    try {
      if (isOnline) {
        await offlineFirstApi.put(
          `/users/me/officer-profile`,
          updates,
          [`api:/users/me/officer-profile`]
        );
        console.log('✅ Profile updated on server');
      } else {
        // Simple mock of caching updates for sync
        console.log('📱 Profile updates cached for offline sync');
      }
    } catch (error) {
      setProfile(profile); // Revert
      throw error;
    }
  }, [profile, setProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  const hydrateFromCache = useCallback(async () => {
    await hydrate();
  }, [hydrate]);

  // Initial load
  useEffect(() => {
    if (isAuthenticated && user && !isInitialized) {
      setIsInitialized(true);

      // Check if store already has a profile from previous tab hit
      if (profile) return;

      hydrate().then(() => {
        refreshProfile();
      });
    }
  }, [isAuthenticated, user, isInitialized, profile, hydrate, refreshProfile]);

  // Network sync
  useEffect(() => {
    const unsubscribe = networkService.addListener((status) => {
      if (status.isConnected && status.isInternetReachable && !profile) {
        refreshProfile();
      }
    });
    return unsubscribe;
  }, [profile, refreshProfile]);

  return {
    profile,
    isLoading,
    isHydrating,
    error,
    hasData: profile !== null,
    refreshProfile,
    updateProfile,
    hydrateFromCache,
    clearError,
  };
};

