import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatRp } from '@/lib/currency';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../../constants/theme';

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();
  const { receiptData, paymentType } = params;

  let receipt = null;
  try {
    receipt = receiptData ? JSON.parse(receiptData as string) : null;
  } catch (error) {
    console.error('Error parsing receipt data:', error);
  }

  const isScheduled = paymentType === 'scheduled';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <View style={styles.successIcon}>
              <Ionicons 
                name={isScheduled ? "calendar-outline" : "checkmark"} 
                size={48} 
                color={COLORS.white} 
              />
            </View>
          </View>

          <Text style={styles.title}>
            {isScheduled ? 'Pembayaran Dijadwalkan!' : 'Pembayaran Berhasil!'}
          </Text>
          <Text style={styles.subtitle}>
            {isScheduled 
              ? 'Pembayaran Anda telah dijadwalkan dan akan diproses otomatis'
              : 'Transaksi Anda telah berhasil diproses'
            }
          </Text>

          {receipt && (
            <View style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptTitle}>Detail Pembayaran</Text>
                <Text style={styles.transactionId}>ID: {receipt.transactionId}</Text>
              </View>

              <View style={styles.receiptBody}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Tagihan</Text>
                  <Text style={styles.receiptValue}>{receipt.bill?.billName}</Text>
                </View>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Kepada</Text>
                  <Text style={styles.receiptValue}>{receipt.bill?.hostName}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Jumlah Tagihan</Text>
                  <Text style={styles.receiptValue}>{formatRp(receipt.breakdown?.yourShare || receipt.amount)}</Text>
                </View>

                {receipt.breakdown?.adminFee > 0 && (
                  <View style={styles.receiptRow}>
                    <Text style={styles.receiptLabel}>Biaya Admin</Text>
                    <Text style={styles.receiptValue}>{formatRp(receipt.breakdown.adminFee)}</Text>
                  </View>
                )}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Dibayar</Text>
                  <Text style={styles.totalValue}>{formatRp(receipt.breakdown?.totalPaid || receipt.amount)}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <Text style={[styles.receiptValue, styles.statusText]}>
                    {isScheduled ? 'Dijadwalkan' : 'Berhasil'}
                  </Text>
                </View>
              </View>
            </View>
          )}

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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  receiptCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  receiptHeader: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.md,
  },
  receiptTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  transactionId: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  receiptBody: {
    gap: SPACING.sm,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  receiptValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
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
  statusText: {
    color: COLORS.success,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
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
});