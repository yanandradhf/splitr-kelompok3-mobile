import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SkeletonStats } from "../../../../components/ui/Skeleton";
import { COLORS, FONTS } from "../../../../constants/theme";
import { UserStats } from "../types";

interface StatsCardProps {
  stats?: UserStats;
  onPress: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.unifiedCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {!stats ? (
        <SkeletonStats />
      ) : (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={24}
                  color={COLORS.teal}
                />
              </View>
              <Text style={styles.statNumber}>
                {stats?.totalBills || 0}
              </Text>
              <Text style={styles.statLabel}>Total Tagihan</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={COLORS.teal}
                />
              </View>
              <Text style={styles.statNumber}>
                {stats?.completedBills || 0}
              </Text>
              <Text style={styles.statLabel}>Selesai</Text>
            </View>
            <View style={[styles.statItem, styles.lastStatItem]}>
              <View style={styles.statIconContainer}>
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={COLORS.teal}
                />
              </View>
              <Text style={styles.statNumber}>
                {stats?.pendingPayments || 0}
              </Text>
              <Text style={styles.statLabel}>Belum Dibayar</Text>
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  unifiedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#76B9BB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 120,
    justifyContent: "center",
  },
  statsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 0,
  },
  statItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "33.33%",
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#E8E8E8",
  },
  lastStatItem: {
    borderRightWidth: 0,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(118, 185, 187, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});