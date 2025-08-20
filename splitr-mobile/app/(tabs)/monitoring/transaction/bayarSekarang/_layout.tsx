import { Stack } from 'expo-router';

export default function BayarSekarangLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="rincian" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="berhasil" />
    </Stack>
  );
}