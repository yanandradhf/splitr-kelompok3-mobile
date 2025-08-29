import { Stack } from "expo-router";
import { View, Text, ActivityIndicator } from 'react-native';
import { ErrorModal } from '../components/ui/ErrorModal';
import { useErrorStore } from '../store/errorStore';
import { useFonts } from '../hooks/useFonts';
import { COLORS } from '../constants/theme';
import '../utils/globalErrorHandler'; // Initialize global error handling

export default function RootLayout() {
  const { isVisible, title, message, isSessionExpired, hideError } = useErrorStore();
  const { fontsLoaded, fontError } = useFonts();

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundMain }}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={{ marginTop: 16, fontSize: 16, color: COLORS.textPrimary }}>Loading...</Text>
      </View>
    );
  }

  // Show error if fonts failed to load but continue with fallback
  if (fontError) {
    console.warn('Font loading error:', fontError);
  }
  
  return (
    <>
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
    </>
  );
}