import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { formatRp } from '@/lib/currency';
import api from '@/services/api';
import { API_CONFIG } from '@/constants/config';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { getBillEndpoint } from '../../utils/billEndpoints';
import { getImageUrl } from '../../utils/imageHelper';

interface MasterBillData {
  billId: string;
  billCode: string;
  billName: string;
  totalAmount: number;
  status: string;
  receiptImageUrl?: string;
  host: {
    name: string;
    account: string;
  };
  category: any;
  paymentDeadline?: string;
  isExpired?: boolean;
  items: Array<{
    itemId: string;
    itemName: string;
    price: number;
    quantity: number;
    totalAssigned: number;
    isSharing: boolean;
    assignments: Array<{
      participantName: string;
      participantAccount: string;
      quantity: number;
      amount: number;
      isSharedPortion: boolean;
    }>;
  }>;
  participants: Array<{
    participantId: string;
    name: string;
    account: string;
    amountShare: number;
    paymentStatus: string;
    paidAt?: string;
    scheduledDate?: string;
    paymentType?: string;
    isHost: boolean;
    breakdown: {
      subtotal: number;
      taxAmount: number;
      serviceAmount: number;
      discountAmount: number;
      totalAmount: number;
    };
  }>;
  paymentSummary: {
    totalParticipants: number;
    completedCount: number;
    pendingCount: number;
    totalPaid: number;
    totalPending: number;
    completionPercentage: number;
  };
  fees: {
    subTotal: number;
    taxAmount: number;
    serviceAmount: number;
    discountAmount: number;
  };
}

export default function MasterBillDetail() {
  const { identifier, billData: passedBillData } = useLocalSearchParams<{ 
    identifier: string;
    billData?: string;
  }>();
  const [billData, setBillData] = useState<MasterBillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);

  useEffect(() => {
    if (identifier) {
      fetchBillData();
    }
  }, [identifier]);

  const fetchBillData = async () => {
    try {
      setLoading(true);
      
      // Use passed data if available, otherwise fetch from API
      if (passedBillData) {
        try {
          const parsedData = JSON.parse(passedBillData);
          setBillData(parsedData);
          setLoading(false);
          return;
        } catch (e) {
          console.log('Failed to parse passed data, fetching from API');
        }
      }
      
      const endpoint = getBillEndpoint(identifier, true); // Always host for master-bill
      console.log('🔍 [MASTER] Fetching master bill data:', endpoint);
      
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setBillData(response.data.bill);
      } else {
        setError('Tagihan tidak ditemukan');
      }
    } catch (error) {
      console.error('Error fetching master bill data:', error);
      setError('Gagal memuat data tagihan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return COLORS.teal;
      case 'completed': return COLORS.success;
      case 'completed_scheduled': return COLORS.teal;
      case 'completed_late': return '#D97706';
      case 'cancelled': return COLORS.red;
      case 'pending': return COLORS.warning;
      case 'expired': return COLORS.red;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'completed': return 'Selesai';
      case 'completed_scheduled': return 'Terjadwal Selesai';
      case 'completed_late': return 'Terlambat';
      case 'cancelled': return 'Dibatalkan';
      case 'pending': return 'Belum Bayar';
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
            <Text style={styles.headerTitle}>Bill Keseluruhan</Text>
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
          <Text style={styles.headerTitle}>Bill Keseluruhan</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Receipt Info */}
            {billData.receiptImageUrl && (
              <TouchableOpacity style={styles.receiptInfoCard} onPress={() => setShowFullImage(true)}>
                <View style={styles.receiptInfoContent}>
                  <Ionicons name="receipt-outline" size={24} color={COLORS.teal} />
                  <View style={styles.receiptInfoText}>
                    <Text style={styles.receiptInfoTitle}>Struk Tersedia</Text>
                    <Text style={styles.receiptInfoSubtitle}>Tap untuk melihat struk pembayaran</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            )}

            {/* Bill Overview */}
            <View style={styles.overviewCard}>
              <View style={styles.billHeader}>
                <View style={styles.billInfo}>
                  <Text style={styles.billCode}>{billData.billCode}</Text>
                  <Text style={styles.billName}>{billData.billName}</Text>
                  <Text style={styles.hostName}>Host: {billData.host.name}</Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge, 
                    { 
                      backgroundColor: getStatusColor(billData.status) === COLORS.teal ? '#E6FFFA' :
                                     getStatusColor(billData.status) === COLORS.success ? '#F0FDF4' :
                                     getStatusColor(billData.status) === COLORS.red ? '#FEF2F2' :
                                     getStatusColor(billData.status) === COLORS.warning ? '#FFFBEB' :
                                     getStatusColor(billData.status) === '#D97706' ? '#FEF3C7' : '#F8F9FA',
                      borderColor: getStatusColor(billData.status) === COLORS.teal ? '#B2F5EA' :
                                 getStatusColor(billData.status) === COLORS.success ? '#BBF7D0' :
                                 getStatusColor(billData.status) === COLORS.red ? '#FECACA' :
                                 getStatusColor(billData.status) === COLORS.warning ? '#FDE68A' :
                                 getStatusColor(billData.status) === '#D97706' ? '#FDE68A' : '#E5E7EB'
                    }
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(billData.status) }]}>{getStatusText(billData.status)}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.amountContainer}>
                <Text style={styles.totalAmountLabel}>Total Tagihan</Text>
                <Text style={styles.totalAmountValue}>{formatRp(billData.totalAmount)}</Text>
              </View>
            </View>

            {/* Payment Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Ringkasan Pembayaran</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{billData.paymentSummary.completedCount}</Text>
                  <Text style={styles.summaryLabel}>Selesai</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{billData.paymentSummary.pendingCount}</Text>
                  <Text style={styles.summaryLabel}>Belum Bayar</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValueGreen}>{formatRp(billData.paymentSummary.totalPaid)}</Text>
                  <Text style={styles.summaryLabel}>Terkumpul</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValueOrange}>{formatRp(billData.paymentSummary.totalPending)}</Text>
                  <Text style={styles.summaryLabel}>Tertunggak</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${billData.paymentSummary.completionPercentage}%` }]} />
                </View>
                <Text style={styles.progressText}>{billData.paymentSummary.completionPercentage}% selesai</Text>
              </View>
            </View>

            {/* Participants Status */}
            <View style={styles.participantsSection}>
              <Text style={styles.sectionTitle}>Status Peserta</Text>
              {billData.participants.map((participant) => (
                <View key={participant.participantId} style={styles.participantCard}>
                  <View style={styles.participantInfo}>
                    <View style={styles.participantHeader}>
                      <Text style={styles.participantName}>{participant.name}</Text>
                      {participant.isHost && (
                        <View style={styles.hostBadge}>
                          <Text style={styles.hostBadgeText}>Host</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.participantAccount}>{participant.account}</Text>
                    <Text style={styles.participantAmount}>{formatRp(participant.amountShare)}</Text>
                  </View>
                  <View style={styles.participantStatus}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(participant.paymentStatus) }]} />
                    <Text style={[styles.statusLabel, { color: getStatusColor(participant.paymentStatus) }]}>
                      {getStatusText(participant.paymentStatus)}
                    </Text>
                    {participant.paidAt && (
                      <Text style={styles.paidDate}>Dibayar: {formatDate(participant.paidAt)}</Text>
                    )}
                    {participant.paymentStatus === 'completed_scheduled' && participant.scheduledDate && (
                      <Text style={styles.scheduledDate}>Dijadwalkan: {formatDate(participant.scheduledDate)}</Text>
                    )}
                    {participant.paymentStatus === 'completed_late' && participant.paidAt && (
                      <Text style={styles.lateDate}>Terlambat: {formatDate(participant.paidAt)}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            {/* Items Detail */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionTitle}>Detail Item</Text>
              {billData.items.map((item) => (
                <View key={item.itemId} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <View style={styles.itemPriceContainer}>
                      <Text style={styles.itemPrice}>{formatRp(item.totalAssigned)}</Text>
                      {item.isSharing && (
                        <View style={styles.sharingBadge}>
                          <Ionicons name="people" size={12} color={COLORS.white} />
                          <Text style={styles.sharingText}>Sharing</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.assignmentsContainer}>
                    {item.assignments.map((assignment, index) => (
                      <View key={index} style={styles.assignmentRow}>
                        <Text style={styles.assignmentName}>{assignment.participantName}</Text>
                        <Text style={styles.assignmentQty}>
                          {assignment.isSharedPortion ? 'Sharing' : `${assignment.quantity}x`}
                        </Text>
                        <Text style={styles.assignmentAmount}>{formatRp(assignment.amount)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Bill Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>Rincian Total</Text>
              <View style={styles.breakdownCard}>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Subtotal</Text>
                  <Text style={styles.breakdownValue}>{formatRp(billData.fees.subTotal)}</Text>
                </View>
                {billData.fees.taxAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Pajak</Text>
                    <Text style={styles.breakdownValue}>{formatRp(billData.fees.taxAmount)}</Text>
                  </View>
                )}
                {billData.fees.serviceAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Service</Text>
                    <Text style={styles.breakdownValue}>{formatRp(billData.fees.serviceAmount)}</Text>
                  </View>
                )}
                {billData.fees.discountAmount > 0 && (
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Diskon</Text>
                    <Text style={[styles.breakdownValue, { color: COLORS.success }]}>-{formatRp(billData.fees.discountAmount)}</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatRp(billData.totalAmount)}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
        
        {/* Full Screen Image Modal */}
        <Modal visible={showFullImage} transparent animationType="fade">
          <View style={styles.fullImageModal}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setShowFullImage(false)}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Image 
              source={{ uri: getImageUrl(billData?.receiptImageUrl) }}
              style={styles.fullImage}
              resizeMode="contain"
              onLoad={() => {
                if (__DEV__) {
                  console.log('📸 Receipt Image Loaded:', {
                    originalUrl: billData?.receiptImageUrl,
                    processedUrl: getImageUrl(billData?.receiptImageUrl)
                  });
                }
              }}
              onError={(error) => {
                if (__DEV__) {
                  console.log('❌ Receipt Image Error:', {
                    originalUrl: billData?.receiptImageUrl,
                    processedUrl: getImageUrl(billData?.receiptImageUrl),
                    error
                  });
                }
              }}
            />
          </View>
        </Modal>
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
  overviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  billInfo: {
    flex: 1,
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
  },
  hostName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  amountContainer: {
    backgroundColor: '#F8FFFE',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  totalAmountLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  totalAmountValue: {
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  summaryValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  summaryValueGreen: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.success,
    marginBottom: SPACING.xs,
  },
  summaryValueOrange: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.teal,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  participantsSection: {
    marginBottom: SPACING.lg,
  },
  participantCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  participantInfo: {
    flex: 1,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
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
  participantAccount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  participantAmount: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  participantStatus: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
  },
  paidDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  scheduledDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.teal,
  },
  lateDate: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: '#D97706',
  },
  itemsSection: {
    marginBottom: SPACING.lg,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  itemPriceContainer: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  itemPrice: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  sharingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.teal,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  sharingText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  assignmentsContainer: {
    gap: SPACING.xs,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  assignmentName: {
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
    minWidth: 60,
    textAlign: 'center',
  },
  assignmentAmount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
    minWidth: 80,
    textAlign: 'right',
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
  receiptInfoCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E6FFFA',
  },
  receiptInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  receiptInfoText: {
    flex: 1,
  },
  receiptInfoTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  receiptInfoSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  fullImageModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 10,
  },
  fullImage: {
    width: '90%',
    height: '80%',
  },
});