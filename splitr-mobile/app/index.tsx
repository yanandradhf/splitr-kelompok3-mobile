import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const timer = setTimeout(() => {
        router.replace('/(auth)/login');
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isMounted]);

  return <View style={{ flex: 1, backgroundColor: '#FFFFFF' }} />;
}