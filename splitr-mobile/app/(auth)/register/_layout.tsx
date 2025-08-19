import { Stack } from 'expo-router';

export default function RegisterLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="regist_email" />
      <Stack.Screen name="regist_otp" />
      <Stack.Screen name="regist_username" />
      <Stack.Screen name="regist_set-pin" />
    </Stack>
  );
}