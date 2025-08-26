import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../../constants/theme";
import { formatRp } from "../../../../lib/currency";
import { PaymentHistory, StatusBadge } from "../types";

interface HistoryCardProps {
  payment: PaymentHistory;
  statusBadge: StatusBadge;
  onPress: (paymentId: string) => void;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({
  payment,
  statusBadge,
  onPress,
}) => {
  const paymentDate = new Date(payment.paidAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
  const paymentTime = new Date(payment.paidAt).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Pressable
      style={styles.newHistoryCard}
      onPress={() => onPress(payment.paymentId)}
    >
      <View style={styles.newHistoryHeader}>
        <View style={styles.newHistoryLeft}>
          <View style={styles.newHistoryIcon}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={COLORS.success}
            />
          </View>
          <View style={styles.newHistoryInfo}>
            <Text style={styles.newHistoryTitle}>
              Pembayaran Berhasil
            </Text>
            <Text style={styles.newHistoryBill}>
              {payment.billName}
            </Text>
          </View>
        </View>
        <View style={styles.newHistoryAmount}>
          <Text style={styles.newAmountText}>
            {formatRp(payment.amount)}
          </Text>
        </View>
      </View>

      <View style={styles.newHistoryDetails}>
        <View style={styles.newDetailRow}>
          <Text style={styles.newDetailLabel}>
            Kode Tagihan
          </Text>
          <Text style={styles.newDetailValue}>
            #{payment.billCode || payment.paymentId}
          </Text>
        </View>
        <View style={styles.newDetailRow}>
          <Text style={styles.newDetailLabel}>Kepada</Text>
          <Text style={styles.newDetailValue}>
            {payment.hostName}
          </Text>
        </View>
        <View style={styles.newDetailRow}>
          <Text style={styles.newDetailLabel}>Waktu</Text>
          <Text style={styles.newDetailValue}>
            {paymentDate} • {paymentTime}
          </Text>
        </View>
        <View style={styles.newDetailRow}>
          <Text style={styles.newDetailLabel}>Status</Text>
          <View
            style={[
              styles.newStatusBadge,
              { backgroundColor: statusBadge.bg },
            ]}
          >
            <Text
              style={[
                styles.newStatusText,
                { color: statusBadge.color },
              ]}
            >
              {statusBadge.text}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  newHistoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  newHistoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  newHistoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  newHistoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  newHistoryInfo: {
    flex: 1,
  },
  newHistoryTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  newHistoryBill: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  newHistoryAmount: {
    alignItems: "flex-end",
  },
  newAmountText: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  newHistoryDetails: {
    backgroundColor: "#F8F9FA",
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  newDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  newDetailLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  newDetailValue: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  newStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  newStatusText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
});