import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../../components/layout/Screen';
import { useTransactionStore } from '../../../store';
import { COLORS, FONTS } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

export default function RiwayatScreen() {
  const { runningTransactions, completedPayments, initializeTransactions } = useTransactionStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeTransactions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await initializeTransactions();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [initializeTransactions]);

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
      <View key={transaction.id} style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle}>{transaction.title}</Text>
            <Text style={styles.transactionFrom}>dari {transaction.from}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
          </View>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionAmount}>{transaction.amount.formatted}</Text>
          <Text style={styles.transactionDate}>Jatuh tempo: {transaction.dueDate}</Text>
        </View>
      </View>
    );
  };

  const renderCompletedPayment = (payment: any) => {
    const getMethodText = (method: string) => {
      return method === 'bayar-sekarang' ? 'Bayar Langsung' : 'Bayar Nanti';
    };

    const getStatusBadge = (method: string) => {
      if (method === 'bayar-sekarang') {
        return { text: 'Bayar Langsung', color: COLORS.success, bg: '#DCFCE7' };
      } else {
        return { text: 'Bayar Nanti', color: '#0369A1', bg: '#DBEAFE' };
      }
    };

    const statusBadge = getStatusBadge(payment.method);
    const paymentDate = new Date(payment.methodDate).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    const paymentTime = new Date(payment.methodDate).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <View key={payment.id} style={styles.newPaymentCard}>
        <View style={styles.newPaymentHeader}>
          <View style={styles.newPaymentLeft}>
            <View style={styles.newPaymentIcon}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            </View>
            <View style={styles.newPaymentInfo}>
              <Text style={styles.newPaymentTitle}>{payment.title}</Text>
              <Text style={styles.newPaymentHost}>ke {payment.hostName}</Text>
            </View>
          </View>
          <Text style={styles.newPaymentAmount}>{payment.amount.formatted}</Text>
        </View>
        
        <View style={styles.newPaymentDetails}>
          <View style={styles.newDetailRow}>
            <Text style={styles.newDetailLabel}>Kode Tagihan</Text>
            <Text style={styles.newDetailValue}>#{payment.id}</Text>
          </View>
          <View style={styles.newDetailRow}>
            <Text style={styles.newDetailLabel}>Kepada</Text>
            <Text style={styles.newDetailValue}>{payment.hostName}</Text>
          </View>
          <View style={styles.newDetailRow}>
            <Text style={styles.newDetailLabel}>Waktu</Text>
            <Text style={styles.newDetailValue}>{paymentDate} • {paymentTime}</Text>
          </View>
          <View style={styles.newDetailRow}>
            <Text style={styles.newDetailLabel}>Status</Text>
            <View style={[styles.newStatusBadge, { backgroundColor: statusBadge.bg }]}>
              <Text style={[styles.newStatusText, { color: statusBadge.color }]}>
                {statusBadge.text}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Aktivitas</Text>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.teal}
              colors={[COLORS.teal]}
            />
          }
        >
          {/* Running Transactions */}
          {runningTransactions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tagihan Aktif</Text>
              {runningTransactions.map(renderRunningTransaction)}
            </View>
          )}

          {/* Completed Payments */}
          {completedPayments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pembayaran Selesai</Text>
              {completedPayments.map(renderCompletedPayment)}
            </View>
          )}

          {runningTransactions.length === 0 && completedPayments.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>Belum ada aktivitas</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: width * 0.06,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    paddingHorizontal: width * 0.04,
    paddingTop: isIOS ? 20 : 16,
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: width * 0.04,
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
  transactionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: width * 0.04,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  transactionFrom: {
    fontSize: width * 0.035,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: width * 0.03,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: width * 0.045,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  transactionDate: {
    fontSize: width * 0.032,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  newPaymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  newPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  newPaymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  newPaymentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  newPaymentInfo: {
    flex: 1,
  },
  newPaymentTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  newPaymentHost: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  newPaymentAmount: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  newPaymentDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  newDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newDetailLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  newDetailValue: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  newStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newStatusText: {
    fontSize: 11,
    fontFamily: FONTS.semiBold,
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
});