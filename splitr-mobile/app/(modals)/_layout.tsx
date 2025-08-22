import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="enter-pin" />
      <Stack.Screen name="pick-date" />
      <Stack.Screen name="pick-my-bill" />
      <Stack.Screen name="add-friend" />
    </Stack>
  );
}