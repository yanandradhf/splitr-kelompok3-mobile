import { Stack } from "expo-router";

export default function BillLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="scan-bill/camera" />
      <Stack.Screen name="scan-bill/preview" />
      <Stack.Screen name="scan-bill/scanning" />
      <Stack.Screen name="scan-bill/results" />
      <Stack.Screen name="scan-bill/ocr" />
      <Stack.Screen name="manual-bill/add-bill" />
    </Stack>
  );
}