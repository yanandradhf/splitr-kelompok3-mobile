import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StorageService } from '../utils/storage';
import { COLORS } from '../constants/theme';

export default function AppEntry() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const shouldShowOnboarding = await StorageService.shouldShowOnboarding();
      
      if (shouldShowOnboarding) {
        // First time user - show onboarding
        router.replace('/(public)/onboarding');
      } else {
        // Returning user - direct to login
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to onboarding on error
      router.replace('/(public)/onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundMain }}>
        <ActivityIndicator size="large" color={COLORS.teal} />
      </View>
    );
  }

  return null;
}