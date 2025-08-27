import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatRp } from "../../../lib/currency";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
import { masterBillStyles } from "../styles";
import { MasterBillData } from "../types";

interface BreakdownSectionProps {
  billData: MasterBillData;
}

export const BreakdownSection: React.FC<BreakdownSectionProps> = ({ billData }) => {
  return (
    <View style={styles.breakdownSection}>
      <Text style={masterBillStyles.sectionTitle}>Rincian Total</Text>
      <View style={styles.breakdownCard}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Subtotal</Text>
          <Text style={styles.breakdownValue}>
            {formatRp(billData.fees.subTotal)}
          </Text>
        </View>
        {billData.fees.taxAmount > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Pajak</Text>
            <Text style={styles.breakdownValue}>
              {formatRp(billData.fees.taxAmount)}
            </Text>
          </View>
        )}
        {billData.fees.serviceAmount > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Service</Text>
            <Text style={styles.breakdownValue}>
              {formatRp(billData.fees.serviceAmount)}
            </Text>
          </View>
        )}
        {billData.fees.discountAmount > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Diskon</Text>
            <Text
              style={[
                styles.breakdownValue,
                { color: COLORS.success },
              ]}
            >
              -{formatRp(billData.fees.discountAmount)}
            </Text>
          </View>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatRp(billData.totalAmount)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  breakdownSection: {
    marginBottom: SPACING.xl,
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  breakdownLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.teal,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
});