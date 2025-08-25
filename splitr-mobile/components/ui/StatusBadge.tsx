import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface StatusBadgeProps {
  status: string;
  isOverdue?: boolean;
  isLate?: boolean;
  paymentType?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  isOverdue = false, 
  isLate = false,
  paymentType 
}) => {
  const getStatusConfig = () => {
    // Priority: isLate > isOverdue > status
    if (isLate || status === 'completed_late') {
      return {
        text: 'LATE',
        color: '#D97706',
        backgroundColor: '#FEF3C7',
        borderColor: '#FDE68A'
      };
    }
    
    if (isOverdue && status !== 'completed') {
      return {
        text: 'EXPIRED',
        color: COLORS.red,
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA'
      };
    }

    switch (status) {
      case 'completed':
        return {
          text: paymentType === 'scheduled' ? 'PAID (SCHEDULED)' : 'PAID',
          color: COLORS.success,
          backgroundColor: '#DCFCE7',
          borderColor: '#BBF7D0'
        };
      case 'completed_scheduled':
        return {
          text: 'PAID (SCHEDULED)',
          color: COLORS.teal,
          backgroundColor: '#F0F9FF',
          borderColor: '#BAE6FD'
        };
      case 'scheduled':
        return {
          text: 'SCHEDULED',
          color: COLORS.teal,
          backgroundColor: '#F0F9FF',
          borderColor: '#BAE6FD'
        };
      case 'pending':
        return {
          text: 'PENDING',
          color: COLORS.warning,
          backgroundColor: '#FFFBEB',
          borderColor: '#FDE68A'
        };
      default:
        return {
          text: status.toUpperCase(),
          color: COLORS.textSecondary,
          backgroundColor: '#F8F9FA',
          borderColor: '#E5E7EB'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[
      styles.badge,
      {
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor
      }
    ]}>
      <Text style={[styles.badgeText, { color: config.color }]}>
        {config.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
});