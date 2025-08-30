import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../features/auth/auth.store';

const TIMEOUT_DURATION = (Number(process.env.EXPO_PUBLIC_AUTO_LOGOUT_SECONDS) || 120) * 1000; // Default 2 minutes if not set

export const useAutoLogout = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only start timer if user is authenticated
    if (isAuthenticated) {
      console.log('⏰ Timer reset - will logout in', TIMEOUT_DURATION / 1000, 'seconds');
      timeoutRef.current = setTimeout(async () => {
        console.log('🕐 Auto logout triggered - forcing logout now');
        
        // Clear timer first
        clearTimer();
        
        try {
          await logout();
          console.log('✅ Logout completed');
        } catch (error) {
          console.error('❌ Logout error:', error);
        }
      }, TIMEOUT_DURATION);
    }
  };

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground - reset timer
      resetTimer();
    } else if (nextAppState.match(/inactive|background/)) {
      // App went to background - clear timer
      clearTimer();
    }
    appStateRef.current = nextAppState;
  };

  useEffect(() => {
    if (isAuthenticated) {
      resetTimer();
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [isAuthenticated]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  return { resetTimer };
};