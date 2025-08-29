import { Stack } from "expo-router";
import { ErrorModal } from '../components/ui/ErrorModal';
import { useErrorStore } from '../store/errorStore';
import '../utils/globalErrorHandler'; // Initialize global error handling

export default function RootLayout() {
  const { isVisible, title, message, isSessionExpired, hideError } = useErrorStore();
  
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