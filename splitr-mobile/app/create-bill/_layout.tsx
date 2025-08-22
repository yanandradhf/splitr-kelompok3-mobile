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
      <Stack.Screen name="camera" />
      <Stack.Screen name="review" />
      <Stack.Screen name="manual" />
      <Stack.Screen name="member-bills" />
      <Stack.Screen name="split-bill" />
      <Stack.Screen name="payment-method" />
      <Stack.Screen name="bill-summary" />
    </Stack>
  );
}