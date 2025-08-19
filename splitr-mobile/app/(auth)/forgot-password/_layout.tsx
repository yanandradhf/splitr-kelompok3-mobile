import { Stack } from 'expo-router';

export default function ForgotPasswordLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="password-succes" />
    </Stack>
  );
}