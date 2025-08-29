import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StorageService } from '../utils/storage';
import { useAuthStore } from '../features/auth/auth.store';
import CustomSplashScreen from './(public)/splash';

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
      
      // Start timer for minimum splash duration (match CustomSplashScreen)
      const startTime = Date.now();
      const MIN_SPLASH_DURATION = 2500; // 2.5 seconds to match splash component
      
      // DEVELOPMENT ONLY: Clear data if __DEV__ flag is true and specific condition met
      if (__DEV__ && false) { // Change 'false' to 'true' temporarily to clear data
        console.log('🧹 Development mode: Clearing all data...');
        await StorageService.clearAllData();
      }
      
      // Debug: Check storage state
      await StorageService.debugStorage();
      
      // 1. Check onboarding status
      const shouldShowOnboarding = await StorageService.shouldShowOnboarding();
      
      // 2. Check authentication session if onboarding is done
      if (!shouldShowOnboarding) {
        console.log('🔍 Checking authentication...');
        await checkAuth();
      }
      
      // Ensure minimum splash duration (match with CustomSplashScreen duration)
      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_SPLASH_DURATION - elapsedTime;
      
      if (remainingTime > 0) {
        console.log(`⏳ Waiting ${remainingTime}ms for minimum splash duration`);
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // Navigate based on onboarding status
      if (shouldShowOnboarding) {
        console.log('🎆 First time user - showing onboarding');
        router.replace('/(public)/onboarding');
      } else {
        // Mark as initialized to trigger auth-based navigation
        setIsInitialized(true);
      }
      
    } catch (error) {
      console.error('❌ Error initializing app:', error);
      router.replace('/(auth)/login');
    }
  };

  const handleSplashFinish = () => {
    // This will be called when splash animation completes
    // But we control the navigation through our initialization logic
  };

  return (
    <CustomSplashScreen onFinish={handleSplashFinish} />
  );
}