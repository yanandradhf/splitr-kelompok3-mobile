import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../../constants/theme";

interface TabNavigationProps {
  activeTab: "groups" | "friends";
  onTabChange: (tab: "groups" | "friends") => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        onPress={() => onTabChange("groups")} 
        style={[styles.tabButton, activeTab === "groups" && styles.tabButtonActive]}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="people" 
          size={20} 
          color={activeTab === "groups" ? COLORS.white : COLORS.teal} 
        />
        <Text style={[styles.tabText, activeTab === "groups" && styles.tabTextActive]}>Grup</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => onTabChange("friends")} 
        style={[styles.tabButton, activeTab === "friends" && styles.tabButtonActive]}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="person" 
          size={20} 
          color={activeTab === "friends" ? COLORS.white : COLORS.teal} 
        />
        <Text style={[styles.tabText, activeTab === "friends" && styles.tabTextActive]}>Teman</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  tabButtonActive: {
    backgroundColor: COLORS.teal,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
    marginLeft: SPACING.xs,
  },
  tabTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
});