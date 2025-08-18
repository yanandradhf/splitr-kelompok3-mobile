import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import LoadingScreen from '../../components/ui/LoadingScreen';

export default function RegisterScreen() {
  const { clearAuth } = useAuth();

  useEffect(() => {
    const handleClearAuth = async () => {
      await clearAuth();
      router.replace('/(public)/onboarding');
    };
    
    handleClearAuth();
  }, []);

  return <LoadingScreen message="Menghapus data..." />;
}