import { create } from 'zustand';
import { OfficerProfile } from '@shared/hooks/useOfficerProfile';
import { offlineFirstApi } from '@shared/services/api/offlineFirstApi';

interface OfficerProfileState {
    profile: OfficerProfile | null;
    isLoading: boolean;
    isHydrating: boolean;
    error: string | null;
    lastFetched: number | null;

    // Actions
    setProfile: (profile: OfficerProfile) => void;
    setLoading: (loading: boolean) => void;
    setHydrating: (hydrating: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;

    // High level actions
    hydrate: () => Promise<void>;
}

export const useOfficerProfileStore = create<OfficerProfileState>((set, get) => ({
    profile: null,
    isLoading: false,
    isHydrating: false,
    error: null,
    lastFetched: null,

    setProfile: (profile: OfficerProfile) => set({
        profile,
        lastFetched: Date.now(),
        isLoading: false,
        isHydrating: false
    }),

    setLoading: (loading: boolean) => set({ isLoading: loading }),

    setHydrating: (hydrating: boolean) => set({ isHydrating: hydrating }),

    setError: (error: string | null) => set({ error, isLoading: false, isHydrating: false }),

    reset: () => set({
        profile: null,
        isLoading: false,
        isHydrating: false,
        error: null,
        lastFetched: null
    }),

    hydrate: async () => {
        if (get().profile || get().isHydrating) return;

        set({ isHydrating: true });
        try {
            const cached = await offlineFirstApi.get<any>(
                '/users/me/officer-profile',
                { offlineOnly: true }
            );

            if (cached) {
                set({
                    profile: cached as OfficerProfile,
                    isHydrating: false
                });
            }
        } catch (err) {
            console.log('Officer profile hydration failed:', err);
        } finally {
            set({ isHydrating: false });
        }
    }
}));
