import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatRp } from "../../../lib/currency";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
import { masterBillStyles } from "../styles";
import { MasterBillData } from "../types";

interface ItemsSectionProps {
  billData: MasterBillData;
}

export const ItemsSection: React.FC<ItemsSectionProps> = ({ billData }) => {
  return (
    <View style={styles.itemsSection}>
      <Text style={masterBillStyles.sectionTitle}>Detail Item</Text>
      {billData.items.map((item) => (
        <View key={item.itemId} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.itemName}</Text>
            <View style={styles.itemPriceContainer}>
              <Text style={styles.itemPrice}>
                {formatRp(item.totalAssigned)}
              </Text>
              {item.isSharing && (
                <View style={styles.sharingBadge}>
                  <Ionicons
                    name="people"
                    size={12}
                    color={COLORS.white}
                  />
                  <Text style={styles.sharingText}>Sharing</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.assignmentsContainer}>
            {item.assignments.map((assignment, index) => (
              <View key={index} style={styles.assignmentRow}>
                <Text style={styles.assignmentName}>
                  {assignment.participantName}
                </Text>
                <Text style={styles.assignmentQty}>
                  {assignment.isSharedPortion
                    ? "Sharing"
                    : `${assignment.quantity}x`}
                </Text>
                <Text style={styles.assignmentAmount}>
                  {formatRp(assignment.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  itemsSection: {
    marginBottom: SPACING.lg,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  itemPriceContainer: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  sharingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  sharingText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  assignmentsContainer: {
    gap: SPACING.xs,
  },
  assignmentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.xs,
  },
  assignmentName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  assignmentQty: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
    minWidth: 60,
    textAlign: "center",
  },
  assignmentAmount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
    minWidth: 80,
    textAlign: "right",
  },
});