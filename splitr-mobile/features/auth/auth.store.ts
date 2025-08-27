import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../../services';

interface User {
  userId: string;
  name: string;
  email: string;
  username: string;
  bniAccountNumber: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          console.log('🔥 API Call starting...');
          console.log('🔥 Credentials:', { username, password });
          
          const response = await authAPI.login({ username, password });
          
          console.log('🔥 API Response:', response);
          console.log('🔥 Response data:', response.data);
          
          const { user, accessToken, refreshToken } = response.data;
          
          console.log('🔥 Extracted user:', user);
          console.log('🔥 Extracted tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
          
          // Save to SecureStore
          await SecureStore.setItemAsync('access_token', accessToken);
          await SecureStore.setItemAsync('refresh_token', refreshToken);
          await SecureStore.setItemAsync('user_data', JSON.stringify(user));
          
          console.log('🔥 Saved to SecureStore');
          
          set({ 
            user, 
            token: accessToken,
            refreshToken,
            isAuthenticated: true, 
            isLoading: false 
          });
          
          console.log('🔥 State updated successfully');
        } catch (error) {
          console.log('🔥 Login error in store:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Try to call logout API, but don't fail if it errors
          await authAPI.logout();
        } catch (error) {
          console.log('Logout API failed, clearing locally:', error?.message || error);
        } finally {
          // Always clear local storage
          try {
            await SecureStore.deleteItemAsync('access_token');
            await SecureStore.deleteItemAsync('refresh_token');
            await SecureStore.deleteItemAsync('user_data');
          } catch (storageError) {
            console.log('Storage cleanup error:', storageError);
          }
          
          // Always reset state
          set({ 
            user: null, 
            token: null, 
            refreshToken: null,
            isAuthenticated: false 
          });
        }
      },

  checkAuth: async () => {
    try {
      console.log('🔍 Checking stored authentication...');
      
      // Check new token format first
      let accessToken = await SecureStore.getItemAsync('access_token');
      let refreshToken = await SecureStore.getItemAsync('refresh_token');
      
      // Fallback to old token format for backward compatibility
      if (!accessToken) {
        accessToken = await SecureStore.getItemAsync('auth_token');
        console.log('🔄 Using legacy token format');
      }
      
      const userData = await SecureStore.getItemAsync('user_data');
      
      console.log('🔍 Found tokens:', { 
        accessToken: !!accessToken, 
        refreshToken: !!refreshToken, 
        userData: !!userData 
      });
      
      if (accessToken && userData) {
        const user = JSON.parse(userData);
        console.log('✅ Valid session found, user:', user.username);
        set({ 
          user, 
          token: accessToken,
          refreshToken: refreshToken || null,
          isAuthenticated: true 
        });
      } else {
        console.log('❌ No valid session found');
        set({ 
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false 
        });
      }
    } catch (error) {
      console.log('❌ Check auth error:', error);
      await get().logout();
    }
  },



  updateUser: async (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));