import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StorageService } from '../utils/storage';
import { useAuthStore } from '../features/auth/auth.store';
import { COLORS } from '../constants/theme';

export default function AppEntry() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      console.log('🚀 App initialized, auth status:', isAuthenticated);
      if (isAuthenticated && user) {
        console.log('✅ Redirecting to home for user:', user.username);
        router.replace('/(tabs)/home');
      } else {
        console.log('❌ Redirecting to login');
        router.replace('/(auth)/login');
      }
    }
  }, [isInitialized, isAuthenticated, user]);

  const initializeApp = async () => {
    try {
      console.log('🚀 Initializing app...');
      
      // DEVELOPMENT ONLY: Clear data if __DEV__ flag is true and specific condition met
      if (__DEV__ && false) { // Change 'false' to 'true' temporarily to clear data
        await StorageService.clearAllData();
      }
      
      // Debug: Check storage state
      await StorageService.debugStorage();
      
      // 1. Check onboarding status
      const shouldShowOnboarding = await StorageService.shouldShowOnboarding();
      
      if (shouldShowOnboarding) {
        console.log('🎆 First time user - showing onboarding');
        router.replace('/(public)/onboarding');
        return;
      }
      
      // 2. Check authentication session
      console.log('🔍 Checking authentication...');
      await checkAuth();
      
      // Mark as initialized to trigger navigation
      setIsInitialized(true);
      
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundMain }}>
      <ActivityIndicator size="large" color={COLORS.teal} />
    </View>
  );
}