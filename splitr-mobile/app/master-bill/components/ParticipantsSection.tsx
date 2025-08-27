import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { formatRp } from "../../../lib/currency";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
import { masterBillStyles } from "../styles";
import { MasterBillData } from "../types";

interface ParticipantsSectionProps {
  billData: MasterBillData;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  formatDate: (dateString: string) => string;
}

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({
  billData,
  getStatusColor,
  getStatusText,
  formatDate,
}) => {
  return (
    <View style={styles.participantsSection}>
      <Text style={masterBillStyles.sectionTitle}>Status Peserta</Text>
      {billData.participants.map((participant) => (
        <View key={participant.participantId} style={styles.participantCard}>
          <View style={styles.participantInfo}>
            <View style={styles.participantHeader}>
              <Text style={styles.participantName}>{participant.name}</Text>
              {participant.isHost && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>Host</Text>
                </View>
              )}
            </View>
            <Text style={styles.participantAccount}>{participant.account}</Text>
            <Text style={styles.participantAmount}>
              {formatRp(participant.amountShare)}
            </Text>
          </View>
          <View style={styles.participantStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: getStatusColor(participant.paymentStatus),
                },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                { color: getStatusColor(participant.paymentStatus) },
              ]}
            >
              {getStatusText(participant.paymentStatus)}
            </Text>
            {participant.paidAt && (
              <Text style={styles.paidDate}>
                Dibayar: {formatDate(participant.paidAt)}
              </Text>
            )}
            {participant.paymentStatus === "completed_scheduled" &&
              participant.scheduledDate && (
                <Text style={styles.scheduledDate}>
                  Dijadwalkan: {formatDate(participant.scheduledDate)}
                </Text>
              )}
            {participant.paymentStatus === "completed_late" &&
              participant.paidAt && (
                <Text style={styles.lateDate}>
                  Terlambat: {formatDate(participant.paidAt)}
                </Text>
              )}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  participantsSection: {
    marginBottom: SPACING.lg,
  },
  participantCard: {
    flexDirection: "row",
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
  participantInfo: {
    flex: 1,
  },
  participantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  participantName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  hostBadge: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  hostBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  participantAccount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  participantAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  participantStatus: {
    alignItems: "flex-end",
    gap: SPACING.xs,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  paidDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  scheduledDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.teal,
  },
  lateDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: "#D97706",
  },
});