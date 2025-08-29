import { useAuthStore } from '../store';
import { router } from 'expo-router';

export const useAuth = () => {
  const { 
    user, 
    token, 
    isLoading, 
    isAuthenticated, 
    login: loginStore, 
    logout: logoutStore, 
    checkAuth 
  } = useAuthStore();

  const login = async (username: string, password: string) => {
    try {
      await loginStore(username.trim(), password.trim());
      router.replace('/(tabs)/home');
    } catch (error: any) {
      // Error automatically handled by API interceptor
    }
  };

  const logout = async () => {
    await logoutStore();
    router.replace('/(auth)/login');
  };

  const clearAuth = async () => {
    await logoutStore();
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    clearAuth,
    checkAuth,
  };
};