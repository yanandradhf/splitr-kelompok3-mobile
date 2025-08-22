import { Stack } from 'expo-router';

export default function CreateBillLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="camera" />
      <Stack.Screen name="review" />
      <Stack.Screen name="manual" />
      <Stack.Screen name="items" />
    </Stack>
  );
}