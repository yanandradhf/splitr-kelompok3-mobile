import { create } from 'zustand';
import { profileAPI } from '../../services';
import type { ProfileUser, ProfileStats } from '../../services';
import { useAuthStore } from '../auth/auth.store';

interface ProfileState {
  user: ProfileUser | null;
  stats: ProfileStats | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: { name: string; phone: string; email: string }) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  user: null,
  stats: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('🔄 Fetching profile data...');
      const response = await profileAPI.getProfile();
      console.log('✅ Profile API response:', response.data);
      const { user, stats } = response.data;
      console.log('👤 User data:', user);
      console.log('📊 Stats data:', stats);
      set({ user, stats, isLoading: false });
    } catch (error: any) {
      console.error('❌ Error fetching profile:', error);
      console.error('❌ Error response:', error.response?.data);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch profile',
        isLoading: false 
      });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdating: true, error: null });
    try {
      const response = await profileAPI.updateProfile(data);
      const updatedUser = response.data.user;
      
      set(state => ({ 
        user: state.user ? { ...state.user, ...updatedUser } : null,
        isUpdating: false 
      }));
      
      // Also update auth store
      useAuthStore.getState().updateUser(updatedUser);
      
      return true;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to update profile',
        isUpdating: false 
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));