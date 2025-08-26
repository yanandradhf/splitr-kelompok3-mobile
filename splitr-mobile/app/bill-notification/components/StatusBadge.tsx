import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
import { BillData } from "../types";

interface StatusBadgeProps {
  status: string;
  billData?: BillData;
  getStatusText: (status: string, isOverdue?: boolean) => string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, billData, getStatusText }) => {
  const getStatusStyle = (status: string) => {
    if (status === 'completed_late') {
      return {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        textColor: '#D97706'
      };
    }
    
    if (billData?.isExpired && status === 'pending') {
      return {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        textColor: COLORS.red
      };
    }
    
    switch (status) {
      case 'pending':
      case 'scheduled': 
        return {
          backgroundColor: '#FEF2F2',
          borderWidth: 1,
          borderColor: '#FECACA',
          textColor: '#EF4444'
        };
      case 'overdue':
        return {
          backgroundColor: '#FEF2F2',
          borderWidth: 1,
          borderColor: '#FECACA',
          textColor: COLORS.red
        };
      case 'completed':
      case 'completed_scheduled':
      case 'paid':
        return {
          backgroundColor: status === 'completed_scheduled' ? COLORS.teal : COLORS.success,
          textColor: COLORS.white
        };
      case 'expired':
        return {
          backgroundColor: COLORS.red,
          textColor: COLORS.white
        };
      default:
        return {
          backgroundColor: COLORS.textSecondary,
          textColor: COLORS.white
        };
    }
  };
  
  const statusStyle = getStatusStyle(status);
  
  return (
    <View style={[styles.statusBadge, { 
      backgroundColor: statusStyle.backgroundColor,
      borderWidth: statusStyle.borderWidth,
      borderColor: statusStyle.borderColor
    }]}>
      <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
        {getStatusText(status, billData?.isExpired)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    lineHeight: 16,
  },
});