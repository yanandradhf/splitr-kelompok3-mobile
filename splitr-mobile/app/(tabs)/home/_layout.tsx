import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="split" />
      <Stack.Screen name="groups" />
      <Stack.Screen name="group-detail" />
      <Stack.Screen name="create-group" />
    </Stack>
  );
}