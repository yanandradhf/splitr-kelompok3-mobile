import React, { useEffect } from 'react';
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
import { useTransactionStore } from '../../../store/transaction.store';
import { COLORS, FONTS } from '../../../constants/theme';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

export default function RiwayatScreen() {
  const { runningTransactions, completedPayments, initializeTransactions } = useTransactionStore();

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
      return method === 'bayar-sekarang' ? 'Bayar Sekarang' : 'Auto Transfer';
    };

    return (
      <View key={payment.id} style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>{payment.title}</Text>
            <Text style={styles.paymentHost}>kepada {payment.hostName}</Text>
          </View>
          <View style={styles.statusCompleted}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.teal} />
            <Text style={styles.statusCompletedText}>Lunas</Text>
          </View>
        </View>
        <View style={styles.paymentDetails}>
          <Text style={styles.paymentAmount}>{payment.amount.formatted}</Text>
          <Text style={styles.paymentMethod}>{getMethodText(payment.method)} • {payment.methodDate}</Text>
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
  paymentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentTitle: {
    fontSize: width * 0.04,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  paymentHost: {
    fontSize: width * 0.035,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusCompletedText: {
    fontSize: width * 0.032,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: width * 0.045,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  paymentMethod: {
    fontSize: width * 0.032,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
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