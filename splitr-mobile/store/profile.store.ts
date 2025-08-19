import { create } from 'zustand';
import { profileAPI, ProfileResponse, UpdateProfileRequest } from '../services/profile.api';

interface ProfileState {
  profile: ProfileResponse | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchProfile: async () => {
    // Don't fetch if already loading or already have data
    if (get().isLoading || get().profile) return;
    
    try {
      set({ isLoading: true, error: null });
      const response = await profileAPI.getProfile();
      set({ profile: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      console.error('Profile fetch error:', error);
    }
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    try {
      set({ isUpdating: true, error: null });
      const response = await profileAPI.updateProfile(data);
      
      // Update profile data in store
      const currentProfile = get().profile;
      if (currentProfile) {
        const updatedProfile = {
          ...currentProfile,
          user: {
            ...currentProfile.user,
            name: response.data.user.name,
            phone: response.data.user.phone,
            email: response.data.user.email,
          }
        };
        
        set({ profile: updatedProfile, isUpdating: false });
        
        // Update auth store with new user data
        const { useAuthStore } = await import('./auth.store');
        const authStore = useAuthStore.getState();
        if (authStore.user) {
          authStore.user.name = response.data.user.name;
          authStore.user.email = response.data.user.email;
        }
      }
      return true;
    } catch (error: any) {
      set({ error: error.message, isUpdating: false });
      console.error('Profile update error:', error);
      return false;
    }
  },
}));