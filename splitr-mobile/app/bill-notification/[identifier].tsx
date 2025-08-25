import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatRp } from '@/lib/currency';
import api from '@/services/api';
import { API_CONFIG } from '@/constants/config';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getBillEndpoint } from '../../utils/billEndpoints';

interface BillData {
  billId: string;
  billCode: string;
  billName: string;
  totalBillAmount: number;
  yourShare: number;
  paymentStatus: string;
  hostName: string;
  hostAccount: string;
  category: string;
  paymentDeadline?: string;
  isExpired?: boolean;
  allowScheduledPayment: boolean;
  createdAt?: string;
  participantCount?: number;
  myItems: Array<{
    itemName: string;
    price: number;
    quantity: number;
    amount: number;
    category: string;
    originalPrice?: number;
    isSharing?: boolean;
  }>;
  myBreakdown: {
    subtotal: number;
    taxAmount: number;
    serviceAmount: number;
    discountAmount: number;
    totalBeforeFees: number;
    totalAfterFees: number;
    sharePercentage: number;
  };
  billBreakdown: {
    subTotal: number;
    taxPct: number;
    taxAmount: number;
    servicePct: number;
    serviceAmount: number;
    discountPct: number;
    discountAmount: number;
    totalAmount: number;
  };
  allParticipants?: Array<{
    name: string;
    paymentStatus: string;
    amount: number;
    isHost?: boolean;
  }>;
  paymentHistory?: Array<{
    date: string;
    amount: number;
    method: string;
  }>;
  actions?: {
    canPay: boolean;
    canSchedule: boolean;
    isOverdue: boolean;
    isPaid: boolean;
  };
}

export default function BillNotificationDetail() {
  const { identifier, isHost, billData: passedBillData } = useLocalSearchParams<{ 
    identifier: string;
    isHost?: string;
    billData?: string;
  }>();
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
      console.log('🚀 Starting fetchBillData with params:', { identifier, isHost, hasPassedData: !!passedBillData });
      
      // Always fetch fresh data from API for latest status
      // Determine endpoint based on isHost parameter
      const isHostUser = isHost === 'true';
      const endpoint = getBillEndpoint(identifier, isHostUser);
      
      console.log(`🔍 [${isHostUser ? 'HOST' : 'PARTICIPANT'}] Fetching bill data:`, endpoint);
      
      console.log('📡 Making API call to:', endpoint);
      const response = await api.get(endpoint);
      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('✅ Bill data received successfully');
        const rawBillData = response.data.data || response.data.bill;
        
        // Debug scheduling capability
        console.log('🔍 Bill data allowScheduledPayment:', rawBillData.allowScheduledPayment);
        console.log('🔍 Bill data canSchedule:', rawBillData.canSchedule);
        console.log('🔍 Bill data paymentStatus:', rawBillData.paymentStatus);
        console.log('🔍 Bill data isExpired:', rawBillData.isExpired);
        
        // Redirect to master bill page if this is a host view
        if (isHostUser && rawBillData.viewType === 'master') {
          router.replace({
            pathname: '/master-bill/[identifier]',
            params: { identifier, billData: JSON.stringify(rawBillData) }
          });
          return;
        }
        
        setBillData(rawBillData);
      } else {
        console.log('❌ API returned success: false');
        setError('Tagihan tidak ditemukan');
      }
    } catch (error) {
      console.error('💥 Error fetching bill data:', error);
      setError('Gagal memuat data tagihan');
    } finally {
      setLoading(false);
      console.log('🏁 fetchBillData completed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return COLORS.warning; // Orange seperti batas waktu pembayaran
      case 'completed': return COLORS.success;
      case 'paid': return COLORS.success;
      case 'expired': return COLORS.red;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string, isOverdue?: boolean) => {
    if (isOverdue) return 'Belum Bayar\nKadaluarsa';
    
    switch (status) {
      case 'pending': return 'Belum Bayar';
      case 'overdue': return 'Terlambat';
      case 'completed': return 'Selesai';
      case 'paid': return 'Selesai';
      case 'scheduled': return 'Belum Bayar';
      case 'expired': return 'Kadaluarsa';
      default: return 'Unknown';
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusStyle = (status: string) => {
      if (billData?.isExpired) {
        return {
          backgroundColor: '#FEF2F2',
          borderWidth: 1,
          borderColor: '#FECACA',
          textColor: COLORS.red
        };
      }
      
      switch (status) {
        case 'pending':
        case 'scheduled': 
          return {
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
            textColor: '#EF4444'
          };
        case 'overdue':
          return {
            backgroundColor: '#FEF2F2',
            borderWidth: 1,
            borderColor: '#FECACA',
            textColor: COLORS.red
          };
        case 'completed':
        case 'paid':
          return {
            backgroundColor: COLORS.success,
            textColor: COLORS.white
          };
        case 'expired':
          return {
            backgroundColor: COLORS.red,
            textColor: COLORS.white
          };
        default:
          return {
            backgroundColor: COLORS.textSecondary,
            textColor: COLORS.white
          };
      }
    };
    
    const statusStyle = getStatusStyle(status);
    
    return (
      <View style={[styles.statusBadge, { 
        backgroundColor: statusStyle.backgroundColor,
        borderWidth: statusStyle.borderWidth,
        borderColor: statusStyle.borderColor
      }]}>
        <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
          {getStatusText(status, billData?.isExpired)}
        </Text>
      </View>
    );
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
      pathname: '/payment-new',
      params: {
        billId: billData?.billId,
        billName: billData?.billName,
        amount: billData?.yourShare.toString(),
        hostName: billData?.hostName,
        hostAccount: billData?.hostAccount,
        paymentDeadline: billData?.paymentDeadline,
        canSchedule: (billData?.allowScheduledPayment || billData?.canSchedule) ? 'true' : 'false',
        isOverdue: billData?.actions?.isOverdue?.toString()
      }
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
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.billInfo}>
                    <Text style={styles.billCode}>{billData.billCode}</Text>
                    <Text style={styles.billName}>{billData.billName}</Text>
                    <Text style={styles.hostName}>dari {billData.hostName}</Text>
                  </View>
                  <StatusBadge status={billData.paymentStatus} />
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

            {/* Action Button */}
            {billData.paymentStatus !== 'completed' && (
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

            {billData.paymentStatus === 'completed' && (
              <View style={styles.paidIndicator}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.paidText}>Pembayaran Berhasil</Text>
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
  heroSection: {
    marginBottom: SPACING.xl,
  },
  modernCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  billInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  billCode: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  billName: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    lineHeight: 28,
  },
  hostName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  amountContainer: {
    backgroundColor: '#F8FFFE',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  amountLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  amountValue: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  categoryContainer: {
    alignItems: 'flex-start',
  },
  categoryBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: '#0369A1',
  },
  hostInfo: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  hostLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  hostAccount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    textAlign: 'center',
    lineHeight: 16,
  },
  yourAssignment: {
    marginBottom: SPACING.xl,
  },
  amountCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  yourItems: {
    marginTop: SPACING.md,
  },
  subsectionTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  },
  itemQty: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    minWidth: 40,
    textAlign: 'center',
  },
  itemAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  discountInfo: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: SPACING.xs,
  },
  deadlineCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#FED7AA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  deadlineValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  paymentCard: {
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  paymentTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  paymentAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  sharePercentage: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    opacity: 0.8,
  },
  itemsSection: {
    marginBottom: SPACING.xl,
  },
  itemsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemRightSection: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  sharingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
    alignSelf: 'flex-end',
  },
  sharingText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  sharingDetails: {
    gap: 2,
  },
  originalPrice: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  yourPart: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  itemTotalLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  itemTotalAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  breakdownSection: {
    marginBottom: SPACING.xl,
  },
  breakdownCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
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
    borderTopWidth: 2,
    borderTopColor: COLORS.teal,
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
  totalBillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.teal,
  },
  totalBillLabel: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  totalBillValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
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
  billBreakdown: {
    marginBottom: SPACING.xl,
  },
  breakdownCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
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
  allItems: {
    marginBottom: SPACING.xl,
  },
  itemDetail: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemPrice: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  itemQtyTotal: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  assignments: {
    gap: SPACING.xs,
  },
  assignment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  participantName: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  assignmentQty: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginRight: SPACING.md,
  },
  assignmentAmount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  participants: {
    marginBottom: SPACING.xl,
  },
  participantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  participantInfo: {
    flex: 1,
  },
  participantAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
    marginTop: SPACING.xs,
  },
  billSummary: {
    marginBottom: SPACING.xl,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  billInfoSection: {
    marginBottom: SPACING.xl,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
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
    flex: 2,
    textAlign: 'right',
  },
  participantsSection: {
    marginBottom: SPACING.xl,
  },
  participantsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  participantInfo: {
    flex: 1,
  },
  participantNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  participantName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  hostBadge: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
  },
  hostBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  participantAmount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  paymentHistorySection: {
    marginBottom: SPACING.xl,
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  historyMethod: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  historyAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.success,
  },

  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    flex: 1,
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
  viewFullBillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  viewFullBillText: {
    color: COLORS.teal,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
  },
  overdueButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  overdueButtonText: {
    color: COLORS.red,
  },
  scheduledButton: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  scheduledButtonText: {
    color: '#0369A1',
  },
});