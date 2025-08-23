import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatRp } from '@/lib/currency';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function PaymentReceiptScreen() {
  const params = useLocalSearchParams();
  const { receiptData } = params;

  let receipt = null;
  try {
    receipt = receiptData ? JSON.parse(receiptData as string) : null;
  } catch (error) {
    console.error('Error parsing receipt data:', error);
  }

  if (!receipt) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Data receipt tidak ditemukan</Text>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>Kembali</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const getStatusBadge = () => {
    if (receipt.status === 'completed' && receipt.paymentType === 'instant') {
      return { text: 'Pembayaran Selesai', color: COLORS.success, bg: '#DCFCE7' };
    }
    if (receipt.status === 'completed_scheduled') {
      return { text: 'Pembayaran Terjadwal Selesai', color: COLORS.teal, bg: '#F0F9FF' };
    }
    return { text: 'Selesai', color: COLORS.success, bg: '#DCFCE7' };
  };

  const statusBadge = getStatusBadge();

  const handleShare = async () => {
    try {
      const shareContent = `
🧾 BUKTI PEMBAYARAN SPLITR

📋 ${receipt.bill.billName}
💰 ${formatRp(receipt.breakdown.totalPaid)}
📅 ${new Date(receipt.paidAt).toLocaleDateString('id-ID')}
🆔 ${receipt.transactionId}

Terima kasih telah menggunakan Splitr! 🙏
      `.trim();

      await Share.share({
        message: shareContent,
        title: 'Bukti Pembayaran Splitr'
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Bukti Pembayaran</Text>
          <Pressable onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={24} color={COLORS.textPrimary} />
          </Pressable>
        </View>

        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.successIcon}>
            <Ionicons 
              name={receipt.paymentType === 'scheduled' ? "calendar-outline" : "checkmark"} 
              size={48} 
              color={COLORS.white} 
            />
          </View>
        </View>

        <Text style={styles.title}>Pembayaran Berhasil!</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg }]}>
          <Text style={[styles.statusText, { color: statusBadge.color }]}>
            {statusBadge.text}
          </Text>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Transaction Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informasi Transaksi</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID Transaksi</Text>
                <Text style={styles.infoValue}>{receipt.transactionId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Referensi BNI</Text>
                <Text style={styles.infoValue}>{receipt.bniReferenceNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Waktu Pembayaran</Text>
                <Text style={styles.infoValue}>
                  {new Date(receipt.paidAt).toLocaleString('id-ID')}
                </Text>
              </View>
              {receipt.scheduledDate && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tanggal Terjadwal</Text>
                  <Text style={styles.infoValue}>
                    {new Date(receipt.scheduledDate).toLocaleString('id-ID')}
                  </Text>
                </View>
              )}
            </View>

            {/* Bill Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detail Tagihan</Text>
              <View style={styles.billInfo}>
                <Text style={styles.billCategory}>{receipt.bill.categoryIcon} {receipt.bill.category}</Text>
                <Text style={styles.billName}>{receipt.bill.billName}</Text>
              </View>
            </View>

            {/* Payer & Recipient */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pembayar & Penerima</Text>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Dari</Text>
                <Text style={styles.accountName}>{receipt.payer.name}</Text>
                <Text style={styles.accountNumber}>BNI - {receipt.payer.account}</Text>
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountLabel}>Kepada</Text>
                <Text style={styles.accountName}>{receipt.recipient.name}</Text>
                <Text style={styles.accountNumber}>BNI - {receipt.recipient.account}</Text>
              </View>
            </View>

            {/* Items */}
            {receipt.yourItems && receipt.yourItems.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Item Anda</Text>
                {receipt.yourItems.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.itemName}</Text>
                      <Text style={styles.itemQty}>x{item.quantity}</Text>
                    </View>
                    <Text style={styles.itemAmount}>{formatRp(item.amount)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rincian Pembayaran</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Subtotal</Text>
                <Text style={styles.breakdownValue}>{formatRp(receipt.breakdown.subtotal)}</Text>
              </View>
              {receipt.breakdown.taxAmount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Pajak</Text>
                  <Text style={styles.breakdownValue}>{formatRp(receipt.breakdown.taxAmount)}</Text>
                </View>
              )}
              {receipt.breakdown.serviceAmount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Biaya Layanan</Text>
                  <Text style={styles.breakdownValue}>{formatRp(receipt.breakdown.serviceAmount)}</Text>
                </View>
              )}
              {receipt.breakdown.discountAmount > 0 && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Diskon</Text>
                  <Text style={[styles.breakdownValue, { color: COLORS.success }]}>
                    -{formatRp(receipt.breakdown.discountAmount)}
                  </Text>
                </View>
              )}
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Bagian Anda</Text>
                <Text style={styles.breakdownValue}>{formatRp(receipt.breakdown.yourShare)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Biaya Admin</Text>
                <Text style={styles.breakdownValue}>{formatRp(receipt.breakdown.adminFee)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Biaya Transfer</Text>
                <Text style={styles.breakdownValue}>{formatRp(receipt.breakdown.transferFee)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Dibayar</Text>
                <Text style={styles.totalValue}>{formatRp(receipt.breakdown.totalPaid)}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Button */}
          <View style={styles.buttonContainer}>
            <Pressable 
              style={styles.primaryButton}
              onPress={() => router.push('/monitoring')}
            >
              <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
            </Pressable>
          </View>
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
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerBackButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  shareButton: {
    padding: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
  },
  billInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  billCategory: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  billName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  accountInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  accountLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  accountName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  accountNumber: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  itemQty: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  itemAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  breakdownLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  buttonContainer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  primaryButton: {
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  backButton: {
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
});