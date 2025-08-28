import { useAuthStore } from '../store';
import { router } from 'expo-router';
import { Alert } from 'react-native';

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
      console.log('🚀 Login attempt:', { username: username.trim(), password });
      await loginStore(username.trim(), password.trim());
      console.log('✅ Login success');
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.log('❌ Login error:', error);
      console.log('❌ Error response:', error.response);
      console.log('❌ Error message:', error.message);
      console.log('❌ Error status:', error.response?.status);
      console.log('❌ Error data:', error.response?.data);
      
      Alert.alert(
        'Login Gagal',
        'Username dan password belum sesuai'
      );
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