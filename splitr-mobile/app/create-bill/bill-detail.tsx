import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "../../store/billStore";
import { formatRp } from "../../lib/currency";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function BillDetail() {
  const { draft, recalcTotals } = useBillStore();
  
  useEffect(() => {
    recalcTotals();
  }, [draft.items, draft.fees]);
  
  const canConfirm = draft.name.trim().length > 0 && draft.categoryId && draft.items.length > 0;
  
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Detail Tagihan</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteModalContainer}>
          <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Informasi Tagihan</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nama Tagihan</Text>
                  <Text style={styles.infoValue}>{draft.name}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Kategori</Text>
                  <Text style={styles.infoValue}>{draft.categoryName || "-"}</Text>
                </View>
                <Pressable onPress={() => router.push("/create-bill/edit-bill")} style={styles.editButton}>
                  <Ionicons name="create-outline" size={16} color={COLORS.teal} />
                  <Text style={styles.editButtonText}>Edit Tagihan</Text>
                </Pressable>
              </View>
            </View>
        
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Daftar Item</Text>
              <View style={styles.itemsCard}>
                {draft.items.map((it) => (
                  <View key={it.id} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{it.name}</Text>
                      <Text style={styles.itemDetails}>
                        <Text>{it.qty}</Text>
                        <Text> × </Text>
                        <Text>{formatRp(it.price)}</Text>
                      </Text>
                    </View>
                    <Text style={styles.itemPrice}>{formatRp(it.qty * it.price)}</Text>
                  </View>
                ))}
              </View>
            </View>
        
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
              <View style={styles.summaryCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal</Text>
                  <Text style={styles.totalValue}>{formatRp(draft.totals.subTotal)}</Text>
                </View>
                {draft.totals.tax > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Pajak</Text>
                    <Text style={styles.totalValue}>{formatRp(draft.totals.tax)}</Text>
                  </View>
                )}
                {draft.totals.service > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Layanan</Text>
                    <Text style={styles.totalValue}>{formatRp(draft.totals.service)}</Text>
                  </View>
                )}
                {draft.totals.discount > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      <Text>Diskon </Text>
                      {draft.fees.discountPct > 0 ? (
                        <Text>
                          <Text>(</Text>
                          <Text>{draft.fees.discountPct}</Text>
                          <Text>%)</Text>
                        </Text>
                      ) : (
                        <Text>(Nominal)</Text>
                      )}
                    </Text>
                    <Text style={[styles.totalValue, styles.successColor]}>
                      <Text>-</Text>
                      <Text>{formatRp(draft.totals.discount)}</Text>
                    </Text>
                  </View>
                )}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.grandTotalLabel}>Total Keseluruhan</Text>
                  <Text style={styles.grandTotalValue}>{formatRp(draft.totals.grandTotal)}</Text>
                </View>
              </View>
            </View>

            <Pressable 
              onPress={() => router.push("/create-bill/payment-method")} 
              disabled={!canConfirm}
              style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
            >
              <Text style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]}>Konfirmasi</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  whiteModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  infoSection: {
    marginBottom: SPACING.lg,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  editButtonText: {
    color: COLORS.teal,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  itemsSection: {
    marginBottom: SPACING.lg,
  },
  itemsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  itemDetails: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  summarySection: {
    marginBottom: SPACING.lg,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  totalLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  grandTotalLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.disabled,
  },
  confirmText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
  confirmTextDisabled: {
    color: COLORS.textSecondary,
  },
  successColor: {
    color: COLORS.success,
  },
});