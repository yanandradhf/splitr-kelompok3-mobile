import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatRp } from '@/lib/currency';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

// Components
import { StatusBadge } from './components/StatusBadge';

// Hooks & Utils
import { useBillNotificationLogic } from './hooks/useBillNotificationLogic';

// Types
import { BillData } from './types';

export default function BillNotificationDetail() {
  const { identifier, isHost, billData: passedBillData } = useLocalSearchParams<{ 
    identifier: string;
    isHost?: string;
    billData?: string;
  }>();

  const {
    billData,
    loading,
    error,
    getStatusColor,
    getStatusText,
    formatDate,
    handlePayment,
  } = useBillNotificationLogic(identifier, isHost, passedBillData);

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.teal} />
            <Text style={styles.loadingText}>Memuat tagihan...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || !billData) {
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
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={COLORS.red} />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => router.back()} style={styles.backToHomeButton}>
              <Text style={styles.backToHomeText}>Kembali</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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

        <View style={styles.whiteContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.billInfo}>
                    <Text style={styles.billCode}>{billData.billCode}</Text>
                    <Text style={styles.billName}>{billData.billName}</Text>
                    <Text style={styles.hostName}>dari {billData.hostName}</Text>
                  </View>
                  <StatusBadge 
                    status={billData.paymentStatus} 
                    billData={billData}
                    getStatusText={getStatusText}
                  />
                </View>
                
                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Tagihan Anda</Text>
                  <Text style={styles.amountValue}>{formatRp(billData.yourShare)}</Text>
                </View>
                
                <View style={styles.categoryContainer}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{billData.category}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Your Items */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Item yang Anda Pesan</Text>
              <View style={styles.itemsCard}>
                {billData.myItems.map((item, index) => {
                  const isSharing = item.isSharing || item.quantity !== Math.floor(item.quantity);
                  return (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.itemName}</Text>
                        {isSharing ? (
                          <View style={styles.sharingDetails}>
                            <Text style={styles.originalPrice}>Harga asli: {formatRp(item.originalPrice || item.price)}</Text>
                            <Text style={styles.yourPart}>Bagian Anda: {formatRp(item.amount)}</Text>
                          </View>
                        ) : (
                          <Text style={styles.itemPrice}>{formatRp(item.price)} × {item.quantity}</Text>
                        )}
                      </View>
                      <View style={styles.itemRightSection}>
                        {isSharing && (
                          <View style={styles.sharingBadge}>
                            <Ionicons name="people" size={12} color={COLORS.white} />
                            <Text style={styles.sharingText}>Sharing</Text>
                          </View>
                        )}
                        <Text style={styles.itemAmount}>{formatRp(item.amount)}</Text>
                      </View>
                    </View>
                  );
                })}
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalLabel}>Subtotal Item</Text>
                  <Text style={styles.itemTotalAmount}>{formatRp(billData.myBreakdown.subtotal)}</Text>
                </View>
              </View>
            </View>

            {/* Your Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>Rincian Tagihan Anda</Text>
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Subtotal Item</Text>
                  <Text style={styles.breakdownValue}>{formatRp(billData.myBreakdown.subtotal)}</Text>
                </View>
                {billData.myBreakdown.taxAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Pajak (bagian Anda)</Text>
                    <Text style={styles.breakdownValue}>{formatRp(billData.myBreakdown.taxAmount)}</Text>
                  </View>
                )}
                {billData.myBreakdown.serviceAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Service (bagian Anda)</Text>
                    <Text style={styles.breakdownValue}>{formatRp(billData.myBreakdown.serviceAmount)}</Text>
                  </View>
                )}
                {billData.myBreakdown.discountAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Diskon (bagian Anda)</Text>
                    <Text style={[styles.breakdownValue, { color: COLORS.success }]}>-{formatRp(billData.myBreakdown.discountAmount)}</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Tagihan Anda</Text>
                  <Text style={styles.totalValue}>{formatRp(billData.yourShare)}</Text>
                </View>
              </View>
            </View>

            {/* Deadline Info */}
            {billData.paymentDeadline && (
              <View style={styles.deadlineCard}>
                <Ionicons name="time-outline" size={20} color={COLORS.warning} />
                <View style={styles.deadlineInfo}>
                  <Text style={styles.deadlineLabel}>Batas Waktu Pembayaran</Text>
                  <Text style={styles.deadlineValue}>{formatDate(billData.paymentDeadline)}</Text>
                </View>
              </View>
            )}

            {/* View Full Bill Button */}
            <Pressable 
              onPress={() => router.push({
                pathname: '/master-bill/[identifier]',
                params: { identifier: billData.billId }
              })} 
              style={styles.viewFullBillButton}
            >
              <Ionicons name="receipt-outline" size={20} color={COLORS.teal} />
              <Text style={styles.viewFullBillText}>Lihat Bill Keseluruhan</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.teal} />
            </Pressable>

            {/* Scheduled Payment Info */}
            {billData.paymentStatus === 'completed_scheduled' && (
              <View style={styles.scheduledPaymentCard}>
                <View style={styles.scheduledHeader}>
                  <Ionicons name="calendar" size={20} color={COLORS.teal} />
                  <Text style={styles.scheduledTitle}>Pembayaran Terjadwal</Text>
                </View>
                {billData.paidAt && (
                  <Text style={styles.scheduledDetail}>
                    Dibayar pada: {formatDate(billData.paidAt)}
                  </Text>
                )}
                {billData.scheduledDate && (
                  <Text style={styles.scheduledDetail}>
                    Dijadwalkan untuk: {formatDate(billData.scheduledDate)}
                  </Text>
                )}
              </View>
            )}

            {/* Action Button */}
            {billData.paymentStatus === 'pending' && (
              <Pressable 
                onPress={handlePayment} 
                style={[
                  styles.payButton,
                  billData.isExpired ? styles.overdueButton :
                  (billData.allowScheduledPayment || billData.canSchedule) ? styles.scheduledButton : styles.payButton
                ]}
              >
                <Text style={[
                  styles.payButtonText,
                  billData.isExpired && styles.overdueButtonText,
                  (billData.allowScheduledPayment || billData.canSchedule) && !billData.isExpired && styles.scheduledButtonText
                ]}>
                  {billData.isExpired ? 'Bayar Walau Terlambat' :
                   (billData.allowScheduledPayment || billData.canSchedule) ? 'Bayar atau Jadwalkan' : 'Bayar Sekarang'}
                </Text>
              </Pressable>
            )}

            {/* Payment Status Indicators */}
            {(billData.paymentStatus === 'completed' || billData.paymentStatus === 'completed_scheduled' || billData.paymentStatus === 'completed_late') && (
              <View style={[styles.paidIndicator, billData.paymentStatus === 'completed_late' && styles.lateIndicator]}>
                <Ionicons name="checkmark-circle" size={24} color={billData.paymentStatus === 'completed_late' ? '#D97706' : COLORS.success} />
                <Text style={[styles.paidText, billData.paymentStatus === 'completed_late' && styles.lateText]}>
                  {billData.paymentStatus === 'completed_late' ? 'Pembayaran Terlambat Berhasil' :
                   billData.paymentStatus === 'completed_scheduled' ? 'Pembayaran Terjadwal Berhasil' : 'Pembayaran Berhasil'}
                </Text>
              </View>
            )}

            {billData.isExpired && billData.paymentStatus === 'pending' && !billData.actions?.canPay && (
              <View style={styles.expiredIndicator}>
                <Ionicons name="time" size={24} color={COLORS.red} />
                <Text style={styles.expiredIndicatorText}>Tagihan Kadaluarsa</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Simplified styles (keeping essential ones)
const styles = {
  container: { flex: 1, backgroundColor: COLORS.backgroundMain },
  safeArea: { flex: 1 },
  header: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  backButton: { padding: 5 },
  headerTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  placeholder: { width: 24 },
  whiteContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  loadingContainer: { flex: 1, justifyContent: "center" as const, alignItems: "center" as const, gap: SPACING.md },
  loadingText: { fontSize: FONT_SIZES.base, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  errorContainer: { flex: 1, justifyContent: "center" as const, alignItems: "center" as const, paddingHorizontal: SPACING.lg, gap: SPACING.md },
  errorText: { fontSize: FONT_SIZES.base, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: "center" as const },
  backToHomeButton: { backgroundColor: COLORS.teal, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginTop: SPACING.md },
  backToHomeText: { color: COLORS.white, fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold },
  heroSection: { marginBottom: SPACING.xl },
  modernCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  cardHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "flex-start" as const, marginBottom: SPACING.lg },
  billInfo: { flex: 1, marginRight: SPACING.md },
  billCode: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  billName: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs, lineHeight: 28 },
  hostName: { fontSize: FONT_SIZES.base, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  amountContainer: { backgroundColor: '#F8FFFE', borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, alignItems: "center" as const, marginBottom: SPACING.md, borderWidth: 1, borderColor: '#E0F2F1' },
  amountLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.textSecondary, marginBottom: SPACING.xs },
  amountValue: { fontSize: 28, fontFamily: FONTS.bold, color: COLORS.teal },
  categoryContainer: { alignItems: "flex-start" as const },
  categoryBadge: { backgroundColor: '#F0F9FF', paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: '#BAE6FD' },
  categoryText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: '#0369A1' },
  itemsSection: { marginBottom: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  itemsCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#F0F0F0' },
  itemRow: { flexDirection: "row" as const, alignItems: "center" as const, paddingVertical: SPACING.xs, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.md },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold, color: COLORS.textPrimary },
  itemPrice: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 2 },
  itemRightSection: { alignItems: "flex-end" as const, gap: SPACING.xs },
  sharingBadge: { flexDirection: "row" as const, alignItems: "center" as const, backgroundColor: COLORS.teal, paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full, gap: SPACING.xs, alignSelf: "flex-end" as const },
  sharingText: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.semiBold, color: COLORS.white },
  sharingDetails: { gap: 2 },
  originalPrice: { fontSize: FONT_SIZES.xs, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  yourPart: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.teal },
  itemAmount: { fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold, color: COLORS.teal },
  itemTotal: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
  itemTotalLabel: { fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold, color: COLORS.textPrimary },
  itemTotalAmount: { fontSize: FONT_SIZES.base, fontFamily: FONTS.bold, color: COLORS.teal },
  breakdownSection: { marginBottom: SPACING.xl },
  breakdownCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: '#F0F0F0' },
  breakdownRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, paddingVertical: SPACING.xs },
  breakdownLabel: { fontSize: FONT_SIZES.base, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  breakdownValue: { fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold, color: COLORS.textPrimary },
  totalRow: { flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 2, borderTopColor: COLORS.teal },
  totalLabel: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  totalValue: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.teal },
  deadlineCard: { backgroundColor: '#FFF7ED', borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, flexDirection: "row" as const, alignItems: "center" as const, gap: SPACING.sm, marginBottom: SPACING.xl, borderWidth: 1, borderColor: '#FED7AA', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  deadlineInfo: { flex: 1 },
  deadlineLabel: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  deadlineValue: { fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold, color: COLORS.textPrimary },
  viewFullBillButton: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.teal, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, marginBottom: SPACING.lg, gap: SPACING.sm },
  viewFullBillText: { color: COLORS.teal, fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold },
  scheduledPaymentCard: { backgroundColor: '#F0F9FF', borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, borderWidth: 1, borderColor: '#BAE6FD' },
  scheduledHeader: { flexDirection: "row" as const, alignItems: "center" as const, gap: SPACING.sm, marginBottom: SPACING.sm },
  scheduledTitle: { fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold, color: COLORS.teal },
  scheduledDetail: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  payButton: { backgroundColor: COLORS.teal, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, alignItems: "center" as const, marginBottom: SPACING.lg },
  payButtonText: { color: COLORS.white, fontSize: FONT_SIZES.base, fontFamily: FONTS.bold },
  overdueButton: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  overdueButtonText: { color: COLORS.red },
  scheduledButton: { backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#BAE6FD' },
  scheduledButtonText: { color: '#0369A1' },
  paidIndicator: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: COLORS.successLight, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, marginBottom: SPACING.lg, gap: SPACING.sm },
  paidText: { color: COLORS.success, fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold },
  lateIndicator: { backgroundColor: '#FFFBEB' },
  lateText: { color: '#D97706' },
  expiredIndicator: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: '#FFEBEE', borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.md, marginBottom: SPACING.lg, gap: SPACING.sm },
  expiredIndicatorText: { color: COLORS.red, fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold },
};