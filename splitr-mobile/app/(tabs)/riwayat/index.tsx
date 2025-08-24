import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../../components/layout/Screen';
import HistoryCard from '../../../components/ui/HistoryCard';
import { useTransactionStore } from '../../../store';
import { COLORS, FONTS } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

export default function RiwayatScreen() {
  const { runningTransactions, completedPayments, initializeTransactions } = useTransactionStore();
  const [activeTab, setActiveTab] = useState<'tagihan' | 'riwayat'>('riwayat');

  useEffect(() => {
    initializeTransactions();
  }, []);

  const renderRunningTransaction = (transaction: any) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pengingat': return COLORS.orange;
        case 'permintaan': return COLORS.teal;
        case 'terlambat': return '#FF5252';
        default: return COLORS.textSecondary;
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pengingat': return 'Pengingat';
        case 'permintaan': return 'Permintaan';
        case 'terlambat': return 'Terlambat';
        default: return status;
      }
    };

    return (
      <View key={transaction.id} style={styles.historyCard}>
        <View style={[styles.leftBorder, { backgroundColor: getStatusColor(transaction.status) }]} />
        <View style={styles.cardContent}>
          <View style={styles.topSection}>
            <View style={styles.leftContent}>
              <View style={[styles.iconContainer, { backgroundColor: getStatusColor(transaction.status) }]}>
                <Text style={styles.iconText}>💳</Text>
              </View>
              <View style={styles.titleSection}>
                <Text style={styles.paymentTitle}>{transaction.title}</Text>
                <Text style={styles.paymentSubtitle}>dari {transaction.from}</Text>
              </View>
            </View>
            <Text style={styles.amountText}>{transaction.amount.formatted}</Text>
          </View>
          <View style={styles.bottomSection}>
            <Text style={styles.dateText}>Jatuh tempo: {transaction.dueDate}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
              <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCompletedPayment = (payment: any, index: number) => {
    const getIcon = (title: string) => {
      if (title.toLowerCase().includes('pizza')) return '🍕';
      if (title.toLowerCase().includes('coffee') || title.toLowerCase().includes('cafe')) return '☕';
      if (title.toLowerCase().includes('lunch') || title.toLowerCase().includes('makan')) return '🍔';
      return '🍽️';
    };

    const getIconBgColor = (title: string, index: number) => {
      if (title.toLowerCase().includes('pizza')) return '#FF8A65';
      if (title.toLowerCase().includes('coffee') || title.toLowerCase().includes('cafe')) return '#8E24AA';
      if (title.toLowerCase().includes('lunch') || title.toLowerCase().includes('makan')) return '#FF7043';
      return ['#FF8A65', '#8E24AA', '#FF7043'][index % 3];
    };

    const getBorderColor = (title: string, index: number) => {
      if (title.toLowerCase().includes('pizza')) return '#FF8A65';
      if (title.toLowerCase().includes('coffee') || title.toLowerCase().includes('cafe')) return '#8E24AA';
      if (title.toLowerCase().includes('lunch') || title.toLowerCase().includes('makan')) return '#FF7043';
      return ['#FF8A65', '#8E24AA', '#FF7043'][index % 3];
    };

    return (
      <View key={payment.id} style={styles.historyCard}>
        <View style={[styles.leftBorder, { backgroundColor: getBorderColor(payment.title, index) }]} />
        <View style={styles.cardContent}>
          <View style={styles.topSection}>
            <View style={styles.leftContent}>
              <View style={[styles.iconContainer, { backgroundColor: getIconBgColor(payment.title, index) }]}>
                <Text style={styles.iconText}>{getIcon(payment.title)}</Text>
              </View>
              <View style={styles.titleSection}>
                <Text style={styles.paymentTitle}>{payment.title}</Text>
                <Text style={styles.paymentSubtitle}>Pembayaran ke {payment.hostName}</Text>
              </View>
            </View>
            <Text style={styles.amountText}>{payment.amount.formatted}</Text>
          </View>
          <View style={styles.bottomSection}>
            <Text style={styles.dateText}>{payment.methodDate}</Text>
            <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
              <Text style={styles.statusText}>SELESAI</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSegmentedControl = () => (
    <View style={styles.segmentedContainer}>
      <TouchableOpacity
        style={[styles.segmentButton, activeTab === 'tagihan' && styles.segmentButtonActive]}
        onPress={() => setActiveTab('tagihan')}
      >
        <Text style={[styles.segmentText, activeTab === 'tagihan' && styles.segmentTextActive]}>
          Tagihan
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.segmentButton, activeTab === 'riwayat' && styles.segmentButtonActive]}
        onPress={() => setActiveTab('riwayat')}
      >
        <Text style={[styles.segmentText, activeTab === 'riwayat' && styles.segmentTextActive]}>
          Riwayat
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {renderSegmentedControl()}
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'tagihan' && (
            <>
              {/* Running Transactions */}
              {runningTransactions.length > 0 ? (
                runningTransactions.map(renderRunningTransaction)
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={64} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>Belum ada tagihan aktif</Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'riwayat' && (
            <>
              {/* Completed Payments */}
              {completedPayments.length > 0 ? (
                completedPayments.map((payment, index) => renderCompletedPayment(payment, index))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={64} color={COLORS.textSecondary} />
                  <Text style={styles.emptyText}>Belum ada riwayat pembayaran</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 25,
    margin: 16,
    marginTop: isIOS ? 20 : 16,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 21,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: COLORS.teal,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  segmentTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.04,
    paddingTop: 8,
    paddingBottom: isIOS ? 100 : 80,
  },
  section: {
    marginBottom: height * 0.03,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.1,
  },
  emptyText: {
    fontSize: width * 0.04,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  // History Card Styles
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  leftBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  cardContent: {
    padding: 20,
    paddingLeft: 24,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  titleSection: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  amountText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.success,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});