import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

interface PaymentBadgeProps {
  paymentType: 'instant' | 'scheduled';
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ paymentType }) => {
  if (paymentType !== 'scheduled') return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>Scheduled</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: '#B7791F',
  },
});