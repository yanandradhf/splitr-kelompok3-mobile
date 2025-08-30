import { Stack } from "expo-router";
import { View, Text, ActivityIndicator } from 'react-native';
import { ErrorModal } from '../components/ui/ErrorModal';
import { ActivityTracker } from '../components/ui/ActivityTracker';
import { useErrorStore } from '../store/errorStore';
import { useFonts } from '../hooks/useFonts';
import { COLORS } from '../constants/theme';
import '../utils/globalErrorHandler'; // Initialize global error handling
import { checkEnvVars } from '../utils/envChecker'; // Environment variable checker

export default function RootLayout() {
  const { isVisible, title, message, isSessionExpired, hideError } = useErrorStore();
  const { fontsLoaded, fontError } = useFonts();

  // Don't block app loading for fonts in Expo Go
  // Show loading only for a short time, then continue with fallback
  if (!fontsLoaded && !fontError) {
    // Set a timeout to prevent infinite loading in Expo Go
    setTimeout(() => {
      if (!fontsLoaded) {
        console.warn('⚠️ Font loading timeout - continuing with system fonts');
      }
    }, 3000);
    
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundMain }}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.textPrimary, fontFamily: 'System' }}>Loading...</Text>
      </View>
    );
  }

  // Log font loading status
  if (fontError) {
    console.warn('⚠️ Font loading error (using system fonts):', fontError);
  } else if (fontsLoaded) {
    console.log('✅ Custom fonts loaded successfully');
  }
  
  // Check environment variables on app start (development only)
  if (__DEV__) {
    checkEnvVars();
  }
  
  return (
    <ActivityTracker>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create-bill" />
        <Stack.Screen name="(modals)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <ErrorModal
        visible={isVisible}
        title={title}
        message={message}
        isSessionExpired={isSessionExpired}
        onClose={hideError}
      />
    </ActivityTracker>
  );
}