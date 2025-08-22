import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="create-bill" />
      <Stack.Screen name="(modals)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}