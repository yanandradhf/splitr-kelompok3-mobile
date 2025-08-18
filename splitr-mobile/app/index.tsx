import { useState } from 'react';
import { router } from 'expo-router';
import CustomSplashScreen from './(public)/splash';

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
    router.replace('/(public)/onboarding');
  };

  if (showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return null;
}