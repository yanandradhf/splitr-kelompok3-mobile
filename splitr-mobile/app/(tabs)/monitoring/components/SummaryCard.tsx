import React from "react";
import { View, Text, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS } from "../../../../constants/theme";
import { summaryCardStyles } from "../styles";

interface SummaryCardProps {
  activeTab: "tagihan" | "riwayat";
  totalAmount: string;
  label: string;
  hasActiveFilters: boolean;
  onFilterPress: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  activeTab,
  totalAmount,
  label,
  hasActiveFilters,
  onFilterPress,
}) => {
  const isZero = totalAmount === "Rp 0";

  return (
    <View style={summaryCardStyles.compactCard}>
      <LinearGradient
        colors={[COLORS.teal, '#2D7D7A', '#1F5F5C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={summaryCardStyles.gradientBackground}
      >
        {/* Enhanced Background Pattern */}
        <View style={summaryCardStyles.backgroundPattern}>
          {/* Gradient Circles */}
          <View style={summaryCardStyles.circle1} />
          <View style={summaryCardStyles.circle2} />
          <View style={summaryCardStyles.circle3} />

          {/* Decorative Lines */}
          <View style={summaryCardStyles.decorLine1} />
          <View style={summaryCardStyles.decorLine2} />

          {/* Floating Dots */}
          <View style={summaryCardStyles.dot1} />
          <View style={summaryCardStyles.dot2} />
          <View style={summaryCardStyles.dot3} />
          <View style={summaryCardStyles.dot4} />
        </View>

        {/* Filter Button - Top Right */}
        <View style={summaryCardStyles.filterContainer}>
          <Pressable
            style={[
              summaryCardStyles.compactFilter,
              hasActiveFilters && summaryCardStyles.compactFilterActive,
            ]}
            onPress={onFilterPress}
          >
            <Ionicons name="funnel" size={16} color={COLORS.white} />
            {hasActiveFilters && <View style={summaryCardStyles.compactFilterDot} />}
          </Pressable>
        </View>

        {/* Main Content - Centered */}
        <View style={summaryCardStyles.compactContent}>
          {!isZero && (
            <Text style={summaryCardStyles.compactAmount}>{totalAmount}</Text>
          )}
          <View style={summaryCardStyles.compactLabelRow}>
            <Text style={summaryCardStyles.compactLabel}>{label}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};