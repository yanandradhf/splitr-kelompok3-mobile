import { Stack } from 'expo-router';
import { COLORS } from '../../constants/theme';

export default function CreateBillLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.backgroundMain },
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="scan-bill/camera" /> 
      <Stack.Screen name="scan-bill/preview" />
      <Stack.Screen name="scan-bill/scanning" />
      <Stack.Screen name="scan-bill/bill-results" />
      <Stack.Screen name="manual-bill/manual" />
      <Stack.Screen name="review" />
      <Stack.Screen name="edit-bill" />
      <Stack.Screen name="bill-detail" />
      <Stack.Screen name="member-bills" />
      <Stack.Screen name="split-bill" />
      <Stack.Screen name="payment-method" />
      <Stack.Screen name="pin-verification" />
      <Stack.Screen name="bill-summary" />
      <Stack.Screen name="success" />
    </Stack>
  );
}