import { useEffect } from 'react';
import { router } from 'expo-router';

export default function OnboardingIndex() {
  useEffect(() => {
    // Future: bisa tambah logic seperti:
    // - Check if user already completed onboarding
    // - Skip to specific step based on user state
    // - Analytics tracking
    
    router.replace('/onboarding/step-1');
  }, []);

  return null;
}