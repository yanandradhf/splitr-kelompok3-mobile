import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatRp } from '@/lib/currency';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../../../constants/theme';
import { useMonitoringStore } from '../../../../../store/monitoring.store';

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();
  const { receiptData, paymentType } = params;
  const { refreshAll } = useMonitoringStore();

  useEffect(() => {
    // Refresh monitoring data after successful payment
    refreshAll();
  }, []);

  let receipt = null;
  try {
    receipt = receiptData ? JSON.parse(receiptData as string) : null;
  } catch (error) {
    console.error('Error parsing receipt data:', error);
  }

  console.log('=== SUCCESS SCREEN DEBUG ===');
  console.log('receiptData:', receiptData);
  console.log('parsed receipt:', receipt);

  const isScheduled = paymentType === 'scheduled';

  if (!receipt) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <Text style={styles.errorText}>Data pembayaran tidak ditemukan</Text>
            <Pressable style={styles.backButton} onPress={() => {
              refreshAll();
              router.push('/monitoring');
            }}>
              <Text style={styles.backButtonText}>Kembali ke Beranda</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header Section */}
        <View style={styles.headerSection}>
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
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.receiptCard}>
              <View style={styles.receiptHeader}>
                <Text style={styles.receiptTitle}>Detail Pembayaran</Text>
                <Text style={styles.transactionId}>ID: {receipt.transactionId}</Text>
                <Text style={styles.bniReference}>Ref BNI: {receipt.bniReferenceNumber}</Text>
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
                  <Text style={styles.receiptLabel}>Rekening Tujuan</Text>
                  <Text style={styles.receiptValue}>BNI - {receipt.bill?.hostAccount}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Jumlah Tagihan</Text>
                  <Text style={styles.receiptValue}>{formatRp(receipt.breakdown?.yourShare)}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Biaya Admin</Text>
                  <Text style={styles.receiptValue}>{formatRp(receipt.breakdown?.adminFee)}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Biaya Transfer</Text>
                  <Text style={styles.receiptValue}>{formatRp(receipt.breakdown?.transferFee)}</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Dibayar</Text>
                  <Text style={styles.totalValue}>{formatRp(receipt.breakdown?.totalPaid)}</Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <Text style={[styles.receiptValue, styles.statusText]}>
                    {receipt.status === 'completed' ? 'Berhasil' : receipt.status}
                  </Text>
                </View>

                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Waktu Pembayaran</Text>
                  <Text style={styles.receiptValue}>
                    {new Date(receipt.paidAt).toLocaleString('id-ID')}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Button at Bottom */}
          <View style={styles.buttonContainer}>
            <Pressable 
              style={styles.primaryButton}
              onPress={() => {
                refreshAll();
                router.push('/monitoring');
              }}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: 'center',
  },
  iconContainer: {
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
  subtitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  receiptCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#F0F0F0',
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
    marginBottom: SPACING.xs,
  },
  bniReference: {
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