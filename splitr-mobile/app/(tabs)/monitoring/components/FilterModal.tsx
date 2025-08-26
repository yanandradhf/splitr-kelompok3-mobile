import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../../constants/theme";
import { SortOption, CategoryFilter, StatusFilter } from "../types";

interface FilterModalProps {
  visible: boolean;
  activeTab: "tagihan" | "riwayat";
  sortBy: SortOption;
  categoryFilter: CategoryFilter;
  statusFilter: StatusFilter;
  onClose: () => void;
  onReset: () => void;
  onSortChange: (sort: SortOption) => void;
  onCategoryChange: (category: CategoryFilter) => void;
  onStatusChange: (status: StatusFilter) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  activeTab,
  sortBy,
  categoryFilter,
  statusFilter,
  onClose,
  onReset,
  onSortChange,
  onCategoryChange,
  onStatusChange,
}) => {
  if (!visible) return null;

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "amount-highest": return "Nominal Terbesar";
      case "date-newest": return "Terbaru";
      case "amount-lowest": return "Nominal Terkecil";
      case "date-oldest": return "Terlama";
      case "deadline-nearest": return "Deadline Terdekat";
      case "deadline-farthest": return "Deadline Terjauh";
    }
  };

  const getCategoryLabel = (category: CategoryFilter) => {
    switch (category) {
      case "semua": return "Semua";
      case "dibuat": return "Saya Buat";
      case "berjalan": return "Berjalan";
      case "selesai": return "Selesai";
      case "expired": return "Kadaluarsa";
    }
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.filterModal}>
        <View style={styles.filterHeader}>
          <Pressable onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.filterTitle}>Filter</Text>
          <Pressable onPress={onReset}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

        {/* Category Filter */}
        {activeTab === "tagihan" && (
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Kategori</Text>
            <View style={styles.filterOptions}>
              {(["berjalan", "selesai", "dibuat", "semua"] as CategoryFilter[]).map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.filterChip,
                    categoryFilter === option && styles.filterChipActive,
                  ]}
                  onPress={() => onCategoryChange(option)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      categoryFilter === option && styles.filterChipTextActive,
                    ]}
                  >
                    {getCategoryLabel(option)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Status Filter - Only for Riwayat */}
        {activeTab === "riwayat" && (
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterOptions}>
              {(["semua", "selesai", "terlambat", "terjadwal"] as StatusFilter[]).map((option) => (
                <Pressable
                  key={option}
                  style={[
                    styles.filterChip,
                    statusFilter === option && styles.filterChipActive,
                  ]}
                  onPress={() => onStatusChange(option)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      statusFilter === option && styles.filterChipTextActive,
                    ]}
                  >
                    {option === "semua"
                      ? "Semua"
                      : option === "selesai"
                      ? "Langsung"
                      : option === "terlambat"
                      ? "Terlambat"
                      : "Terjadwal"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Sort Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Urutkan</Text>
          <View style={styles.filterOptions}>
            {(activeTab === "riwayat"
              ? ["amount-highest", "amount-lowest", "date-newest", "date-oldest"]
              : (["deadline-nearest", "amount-highest", "date-newest", "amount-lowest", "date-oldest", "deadline-farthest"] as SortOption[])
            ).map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.filterChip,
                  sortBy === option && styles.filterChipActive,
                ]}
                onPress={() => onSortChange(option)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    sortBy === option && styles.filterChipTextActive,
                  ]}
                >
                  {getSortLabel(option)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.applyButton} onPress={onClose}>
          <Text style={styles.applyButtonText}>Terapkan Filter</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  filterModal: {
    backgroundColor: COLORS.white,
    margin: 0,
    marginTop: 60,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    flex: 1,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  resetText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.teal,
    fontFamily: FONTS.semiBold,
  },
  filterSection: {
    padding: SPACING.lg,
  },
  filterSectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  filterChipActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  filterChipText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  applyButton: {
    margin: SPACING.lg,
    backgroundColor: COLORS.teal,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
  },
});