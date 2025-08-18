import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import CustomSplashScreen from './(public)/splash';
import LoadingScreen from '../components/ui/LoadingScreen';
import { useAuthStore } from '../store/auth.store';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!showSplash) {
      checkAuthStatus();
    }
  }, [showSplash]);

  const checkAuthStatus = async () => {
    setIsChecking(true);
    await checkAuth();
    setIsChecking(false);
    
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/(public)/onboarding');
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  if (isChecking) {
    return <LoadingScreen message="Memeriksa autentikasi..." />;
  }

  return null;
}