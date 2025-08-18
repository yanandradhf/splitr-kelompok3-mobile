import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';

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
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
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
          
          const { user, token } = response.data;
          
          console.log('🔥 Extracted user:', user);
          console.log('🔥 Extracted token:', token);
          
          // Save to SecureStore
          await SecureStore.setItemAsync('auth_token', token);
          await SecureStore.setItemAsync('user_data', JSON.stringify(user));
          
          console.log('🔥 Saved to SecureStore');
          
          set({ 
            user, 
            token, 
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
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

  checkAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        });
      }
    } catch (error) {
      console.log('Check auth error:', error);
      get().logout();
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
}));