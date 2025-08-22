import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatRp } from '@/lib/currency';
import api from '@/services/api';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

interface BillData {
  billId: string;
  billCode: string;
  billName: string;
  yourShare: number;
  paymentStatus: string;
  hostName: string;
  myItems: Array<{
    itemName: string;
    quantity: number;
    price: number;
    amount: number;
    category: string;
  }>;
  paymentDeadline: string;
  isExpired: boolean;
}

export default function BillNotificationDetail() {
  const { identifier } = useLocalSearchParams<{ identifier: string }>();
  const [billData, setBillData] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (identifier) {
      fetchBillData();
    }
  }, [identifier]);

  const fetchBillData = async () => {
    try {
      setLoading(true);
      console.log('🌐 Fetching bill data with identifier:', identifier);
      
      // Try the notification endpoint first
      const response = await api.get(`/api/mobile/bills/from-notification/${identifier}`);
      
      if (response.data.success) {
        console.log('📋 Bill data received:', JSON.stringify(response.data.bill, null, 2));
        setBillData(response.data.bill);
      } else {
        setError('Tagihan tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching bill data:', error);
      setError('Gagal memuat data tagihan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning;
      case 'paid': return COLORS.success;
      case 'expired': return COLORS.red;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Belum Bayar';
      case 'paid': return 'Sudah Bayar';
      case 'expired': return 'Kadaluarsa';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePayment = () => {
    router.push({
      pathname: '/payment/[billId]',
      params: { billId: billData?.billId }
    });
  };

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
            <View style={styles.billHeader}>
              <Text style={styles.billName}>{billData.billName}</Text>
              <Text style={styles.billCode}>Kode: {billData.billCode}</Text>
              <Text style={styles.hostName}>dari {billData.hostName}</Text>
              
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(billData.paymentStatus) }]}>
                <Text style={styles.statusText}>{getStatusText(billData.paymentStatus)}</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Bagian Anda</Text>
              <Text style={styles.yourShare}>{formatRp(billData.yourShare)}</Text>
              
              {billData.paymentDeadline && (
                <View style={styles.deadlineContainer}>
                  <Ionicons 
                    name={billData.isExpired ? "time" : "calendar-outline"} 
                    size={16} 
                    color={billData.isExpired ? COLORS.red : COLORS.textSecondary} 
                  />
                  <Text style={[styles.deadlineText, billData.isExpired && styles.expiredText]}>
                    {billData.isExpired ? 'Kadaluarsa: ' : 'Jatuh tempo: '}
                    {formatDate(billData.paymentDeadline)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Item Anda</Text>
              {billData.myItems.map((item, index) => {
                // Check if this is a shared item (quantity seems to be share amount)
                const isSharedItem = item.quantity > 100 || item.quantity === item.amount;
                
                return (
                  <View key={index} style={styles.itemCard}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>
                        {item.itemName}
                        {isSharedItem && (
                          <Text style={styles.sharingText}> (Sharing)</Text>
                        )}
                      </Text>
                      <Text style={styles.itemDetails}>
                        {isSharedItem 
                          ? `Bagian Anda dari item sharing`
                          : `${item.quantity} × ${formatRp(item.price)}`
                        }
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>{formatRp(item.amount)}</Text>
                  </View>
                );
              })}
            </View>

            {billData.paymentStatus === 'pending' && !billData.isExpired && (
              <Pressable onPress={handlePayment} style={styles.payButton}>
                <Text style={styles.payButtonText}>Bayar Sekarang</Text>
              </Pressable>
            )}

            {billData.paymentStatus === 'paid' && (
              <View style={styles.paidIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.paidText}>Pembayaran Berhasil</Text>
              </View>
            )}

            {billData.isExpired && billData.paymentStatus === 'pending' && (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  whiteContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  backToHomeButton: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.md,
  },
  backToHomeText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
  },
  billHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  billName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  billCode: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  hostName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  yourShare: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
    marginBottom: SPACING.md,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  deadlineText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  expiredText: {
    color: COLORS.red,
    fontFamily: FONTS.semiBold,
  },
  itemsSection: {
    marginBottom: SPACING.xl,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sharingText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },
  itemDetails: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  itemTotal: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  payButton: {
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
  paidIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  paidText: {
    color: COLORS.success,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
  },
  expiredIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  expiredIndicatorText: {
    color: COLORS.red,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
  },
});