import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../../constants/theme";
import { formatRp } from "../../../../lib/currency";
import { BillActivity, StatusBadge } from "../types";

interface BillCardProps {
  bill: BillActivity;
  statusBadge: StatusBadge;
  isExpanded: boolean;
  onPress: (bill: BillActivity, event?: any) => void;
  onPaymentPress: (bill: BillActivity) => void;
  onToggleExpanded: (id: string) => void;
  isPaidStatus: (bill: BillActivity) => boolean;
  formatDate: (dateString: string) => string;
  getHostStatusText: (bill: BillActivity) => string;
}

export const BillCard: React.FC<BillCardProps> = ({
  bill,
  statusBadge,
  isExpanded,
  onPress,
  onPaymentPress,
  onToggleExpanded,
  isPaidStatus,
  formatDate,
  getHostStatusText,
}) => {
  const getCardStyle = () => {
    const paid = isPaidStatus(bill);

    if (bill.paymentStatus === "completed_late") return styles.lateCard;
    if (bill.isExpired && !paid) return styles.expiredCard;
    
    if (bill.isHost && bill.paymentSummary) {
      const { paidCount, totalParticipants } = bill.paymentSummary;
      return paidCount >= totalParticipants ? styles.completedCard : styles.hostCard;
    }

    if (paid) return bill.paymentStatus === "completed_scheduled" ? styles.scheduledCard : styles.completedCard;
    if (bill.paymentStatus === "scheduled") return styles.scheduledCard;
    return bill.isHost ? styles.hostCard : styles.participantCard;
  };

  const getParticipantStatus = (participant: any) => {
    if (participant.paymentStatus === "completed_late") {
      return { text: "Terlambat", color: "#D97706", bg: "#FEF3C7" };
    }
    if (participant.paymentStatus === "completed") {
      return { text: "Selesai", color: COLORS.success, bg: "#DCFCE7" };
    }
    if (participant.paymentStatus === "scheduled") {
      return { text: "Dijadwalkan", color: COLORS.teal, bg: "#F0F9FF" };
    }
    if (participant.paymentStatus === "completed_scheduled") {
      return { text: "Terjadwal Selesai", color: COLORS.teal, bg: "#F0F9FF" };
    }
    return { text: "Belum bayar", color: "#EF4444", bg: "#FEF2F2" };
  };

  return (
    <View style={[styles.billCard, getCardStyle()]}>
      <Pressable
        style={[
          styles.billContent,
          bill.isExpired && bill.paymentStatus !== "completed" && styles.expiredContent,
        ]}
        onPress={(event) => onPress(bill, event)}
        delayPressIn={0}
        delayPressOut={100}
      >
        {/* Bill Header */}
        <View style={styles.billHeader}>
          <View style={styles.billInfo}>
            <Text style={styles.billTitle}>{bill.billName}</Text>
            <Text style={styles.billCode}>{bill.billCode}</Text>
            {!bill.isHost ? (
              <Text style={styles.hostName}>dari {bill.hostName}</Text>
            ) : (
              <View style={styles.hostBadge}>
                <Ionicons name="person" size={10} color={COLORS.white} />
                <Text style={styles.hostBadgeText}>Host</Text>
              </View>
            )}
            {bill.isHost && (
              <Text style={styles.statusText}>
                Status: {getHostStatusText(bill)}
              </Text>
            )}
          </View>

          <View style={styles.billRight}>
            {bill.isHost ? (
              <View style={styles.hostAmountContainer}>
                <Text style={styles.totalBillAmount}>
                  {formatRp(bill.displayAmount || bill.totalBillAmount)}
                </Text>
                <Text style={styles.hostShareAmount}>
                  Anda bayar: {formatRp(bill.yourShare)}
                </Text>
              </View>
            ) : (
              <Text style={styles.billAmount}>{formatRp(bill.yourShare)}</Text>
            )}
            <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                {statusBadge.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Deadline for participants */}
        {!bill.isHost && bill.paymentDeadline && !bill.isExpired && (
          <Text style={styles.deadlineText}>
            Jatuh tempo: {formatDate(bill.paymentDeadline)}
          </Text>
        )}

        {/* Scheduled payment info */}
        {(bill.paymentStatus === "scheduled" || bill.paymentStatus === "completed_scheduled") && (
          <View style={styles.scheduledInfo}>
            <Ionicons name="calendar" size={14} color={COLORS.teal} />
            <Text style={styles.scheduledText}>
              {bill.scheduledDate
                ? bill.paymentStatus === "scheduled"
                  ? `Akan dibayar: ${formatDate(bill.scheduledDate)}`
                  : `Dijadwalkan: ${formatDate(bill.scheduledDate)}`
                : bill.paymentStatus === "scheduled"
                ? "Pembayaran dijadwalkan"
                : "Terjadwal selesai"}
            </Text>
          </View>
        )}
      </Pressable>

      {/* Payment Button for Participants */}
      {(() => {
        const paid = isPaidStatus(bill);
        const isScheduled = bill.paymentStatus === "scheduled";
        const canPay = bill.actions?.canPay !== false && !paid && !isScheduled;
        const canSchedule = bill.actions?.canSchedule && !bill.isExpired;

        if (bill.isHost || !canPay) return null;

        const buttonColor = bill.isExpired ? COLORS.red : canSchedule ? "#0369A1" : COLORS.teal;
        const buttonText = bill.isExpired ? "Bayar Walau Terlambat" : canSchedule ? "Bayar atau Jadwalkan" : "Bayar Sekarang";
        const buttonStyle = bill.isExpired ? styles.overdueButton : canSchedule ? styles.scheduledButton : styles.instantButton;

        return (
          <View style={styles.paymentButtonContainer}>
            <Pressable style={[styles.payButton, buttonStyle]} onPress={() => onPaymentPress(bill)}>
              <Ionicons name="flash" size={14} color={buttonColor} style={styles.buttonIcon} />
              <Text style={[styles.payButtonText, { color: buttonColor }]}>{buttonText}</Text>
            </Pressable>
          </View>
        );
      })()}

      {/* Host Dropdown - Show participants status */}
      {bill.isHost && bill.participantsStatus && bill.participantsStatus.length > 0 && (
        <Pressable style={styles.dropdownToggle} onPress={() => onToggleExpanded(bill.billId)}>
          <Text style={styles.dropdownText}>Status Pembayaran</Text>
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={COLORS.textSecondary}
          />
        </Pressable>
      )}

      {/* Expanded Content for Host */}
      {bill.isHost && isExpanded && bill.participantsStatus && (
        <View style={styles.expandedContent}>
          {bill.participantsStatus.map((participant) => {
            const participantStatus = getParticipantStatus(participant);

            return (
              <View key={participant.participantId} style={styles.participantItem}>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{participant.name}</Text>
                  <Text style={styles.participantAmount}>
                    {formatRp(participant.amountShare)}
                  </Text>
                  {(participant.paymentStatus === "scheduled" ||
                    participant.paymentStatus === "completed_scheduled") &&
                    participant.scheduledDate && (
                      <Text style={styles.scheduledDateText}>
                        {participant.paymentStatus === "scheduled"
                          ? `Akan dibayar: ${formatDate(participant.scheduledDate)}`
                          : `Dijadwalkan: ${formatDate(participant.scheduledDate)}`}
                      </Text>
                    )}
                </View>
                <View style={[styles.participantStatusBadge, { backgroundColor: participantStatus.bg }]}>
                  <Text style={[styles.participantStatusText, { color: participantStatus.color }]}>
                    {participantStatus.text}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  billCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    position: "relative",
  },
  participantCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
  },
  hostCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
    backgroundColor: "#F8FFFE",
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    backgroundColor: "#F0FDF4",
  },
  scheduledCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.teal,
    backgroundColor: "#F0F9FF",
  },
  expiredCard: {
    borderColor: "#FCA5A5",
    borderWidth: 2,
    backgroundColor: "#FEF2F2",
    opacity: 0.8,
  },
  lateCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#D97706",
    backgroundColor: "#FFFBEB",
  },
  billContent: {
    padding: SPACING.lg,
  },
  expiredContent: {
    opacity: 0.7,
  },
  hostBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.teal,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    gap: 2,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  hostBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  billInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  billTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  billCode: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  hostName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },
  billRight: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  billAmount: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  hostAmountContainer: {
    alignItems: "flex-end",
  },
  totalBillAmount: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  hostShareAmount: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  statusBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
  deadlineText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
    marginTop: SPACING.xs,
  },
  scheduledInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  scheduledText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },
  scheduledDateText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.teal,
    marginTop: 2,
  },
  paymentButtonContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  payButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  instantButton: {
    backgroundColor: "#E0F2F1",
    borderWidth: 1,
    borderColor: "#B2DFDB",
  },
  scheduledButton: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  overdueButton: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  buttonIcon: {
    marginRight: 6,
  },
  payButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  dropdownToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dropdownText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  expandedContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  participantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  participantAmount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  participantStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: "transparent",
  },
  participantStatusText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
  },
});