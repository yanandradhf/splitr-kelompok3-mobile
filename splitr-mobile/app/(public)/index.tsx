import React, { useState } from 'react';
import { router } from 'expo-router';
import CustomSplashScreen from './splash';

export default function PublicIndex() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
    router.replace('/onboarding');
  };

  if (showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return null;
}