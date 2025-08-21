// app/(tabs)/monitoring/index.tsx
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Colors } from '../../../constants/Colors';
import { BUTTON_RULES, UI_STATE_PAYLOAD } from '../../../constants/config';
import { useTransactionStore } from '../../../store/transaction.store';

const DonutChart = ({ progress }: { progress: { percent: number; label?: string } }) => {
  const size = 50;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: size - 4, height: size - 4, borderRadius: (size - 4) / 2,
        borderWidth: 3, borderColor: UI_STATE_PAYLOAD.theme.colors.muted, position: 'absolute'
      }} />
      <View style={{
        width: size - 4, height: size - 4, borderRadius: (size - 4) / 2,
        borderWidth: 3, borderColor: 'transparent',
        borderTopColor: progress.percent > 0 ? UI_STATE_PAYLOAD.theme.colors.accent : 'transparent',
        borderRightColor: progress.percent > 25 ? UI_STATE_PAYLOAD.theme.colors.accent : 'transparent',
        borderBottomColor: progress.percent > 50 ? UI_STATE_PAYLOAD.theme.colors.accent : 'transparent',
        borderLeftColor: progress.percent > 75 ? UI_STATE_PAYLOAD.theme.colors.accent : 'transparent',
        transform: [{ rotate: '-90deg' }], position: 'absolute'
      }} />
      <Text style={{ fontSize: 10, fontWeight: '600', color: UI_STATE_PAYLOAD.theme.colors.textPrimary }}>
        {progress.percent}%
      </Text>
    </View>
  );
};

type Money = {
  amount: number;
  currency: 'IDR';
  formatted: string;
};

type PersonOwed = {
  name: string;
  status: 'lunas' | 'tertunda';
  subtotal: Money;
};

type DonutProgress = {
  percent: number;
  label?: string;
};

type BillCardHost = {
  id: string;
  title: string;
  date: string;
  total: Money;
  people: PersonOwed[];
  progress: DonutProgress;
  isExpanded?: boolean;
  receiptUrl?: string;
};

type PayStatus = 'pengingat' | 'permintaan' | 'terlambat';

type NotificationCard = {
  id: string;
  status: PayStatus;
  title: string;
  from: string;
  dueDate: string;
  amount: Money;
};

type CompletedBill = {
  id: string;
  title: string;
  date: string;
  role: 'host' | 'payer';
  total: Money;
  status: 'selesai';
};

type SummaryCard = {
  title: string;
  value: Money;
};

const formatMoney = (amount: number): Money => ({
  amount,
  currency: 'IDR',
  formatted: `Rp ${amount.toLocaleString('id-ID')}`
});

const MOCK_DATA = UI_STATE_PAYLOAD.screens;

export default function MonitoringIndex() {
  const [activeTab, setActiveTab] = useState<'running' | 'completed'>('running');
  const [expandedBills, setExpandedBills] = useState<Set<string>>(new Set());
  const { runningTransactions, completedPayments, isInitialized, initializeTransactions } = useTransactionStore();

  useEffect(() => {
    // Only initialize if store hasn't been initialized yet
    if (!isInitialized) {
      initializeTransactions();
    }
  }, [isInitialized]);

  // Calculate dynamic summary values
  const calculateSummary = () => {
    // Pembayaran Tertunda = akumulasi dari tagihan yang harus dibayar
    const pendingPayments = runningTransactions.reduce((sum, transaction) => {
      return sum + transaction.amount.amount;
    }, 0);

    // Total Tagihan Saya = akumulasi dari tagihan yang saya buat
    const myBillsTotal = MOCK_DATA.running.myBills.items.reduce((sum, bill) => {
      return sum + bill.total.amount;
    }, 0);

    return {
      pendingPayments: {
        amount: pendingPayments,
        formatted: `Rp ${pendingPayments.toLocaleString('id-ID')}`
      },
      myBills: {
        amount: myBillsTotal,
        formatted: `Rp ${myBillsTotal.toLocaleString('id-ID')}`
      }
    };
  };

  // Calculate completed summary for completed tab
  const calculateCompletedSummary = () => {
    // Total Pembayaran Selesai = akumulasi dari completed payments
    const completedPaymentsTotal = completedPayments.reduce((sum, payment) => {
      return sum + payment.amount.amount;
    }, 0);

    // Total Tagihan Selesai = akumulasi dari host bills yang selesai
    const completedHostBillsTotal = MOCK_DATA.completed.hostBills.reduce((sum, bill) => {
      return sum + bill.total.amount;
    }, 0);

    return {
      completedPayments: {
        amount: completedPaymentsTotal,
        formatted: `Rp ${completedPaymentsTotal.toLocaleString('id-ID')}`
      },
      completedHostBills: {
        amount: completedHostBillsTotal,
        formatted: `Rp ${completedHostBillsTotal.toLocaleString('id-ID')}`
      }
    };
  };

  const summaryData = calculateSummary();
  const completedSummaryData = calculateCompletedSummary();

  useFocusEffect(
    React.useCallback(() => {
      // Refresh data when screen comes into focus
      console.log('=== MONITORING SCREEN FOCUSED ===');
      console.log('Running transactions:', runningTransactions.length);
      console.log('Completed payments:', completedPayments.length);
      console.log('Running transaction titles:', runningTransactions.map(t => t.title));
      console.log('Completed payment titles:', completedPayments.map(p => p.title));
    }, [runningTransactions, completedPayments])
  );

  const toggleExpanded = (billId: string) => {
    const newExpanded = new Set(expandedBills);
    if (newExpanded.has(billId)) {
      newExpanded.delete(billId);
    } else {
      newExpanded.add(billId);
    }
    setExpandedBills(newExpanded);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Tab - Bill Management</Text>
      </View> */}

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <Pressable
          style={[styles.segment, activeTab === 'running' && styles.activeSegment]}
          onPress={() => setActiveTab('running')}
        >
          <Text style={[styles.segmentText, activeTab === 'running' && styles.activeSegmentText]}>
            Tagihan Berjalan
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segment, activeTab === 'completed' && styles.activeSegment]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.segmentText, activeTab === 'completed' && styles.activeSegmentText]}>
            Tagihan Selesai
          </Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'running' ? (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.myBillsCard]}>
                <Text style={styles.summaryTitle}>Tagihan yang Dibuat</Text>
                <Text style={[styles.summaryAmount, styles.myBillsAmount]}>{summaryData.myBills.formatted}</Text>
              </View>
              <View style={[styles.summaryCard, styles.pendingPaymentCard]}>
                <Text style={styles.summaryTitle}>Pembayaran Tertunda</Text>
                <Text style={[styles.summaryAmount, styles.pendingPaymentAmount]}>{summaryData.pendingPayments.formatted}</Text>
              </View>
            </View>

            {/* Tagihan yang Aku Buat */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="wallet-outline" size={20} color="#00897B" />
                <Text style={styles.sectionTitle}>{MOCK_DATA.running.myBills.title}</Text>
              </View>
              {MOCK_DATA.running.myBills.items.map((bill) => (
                <View key={bill.id} style={[styles.billCard, styles.myBillCard]}>
                  <View style={styles.billHeader}>
                    <View style={styles.billInfo}>
                      <Text style={styles.billTitle}>{bill.title}</Text>
                      <Text style={styles.billDate}>{bill.date}</Text>
                      <Text style={styles.billAmount}>{bill.total.formatted}</Text>
                    </View>
                    <View style={styles.billActions}>
                      <DonutChart progress={bill.progress} />
                      <Pressable onPress={() => toggleExpanded(bill.id)}>
                        <Ionicons 
                          name={expandedBills.has(bill.id) ? 'chevron-up' : 'chevron-down'} 
                          size={20} 
                          color={Colors.textSecondary} 
                        />
                      </Pressable>
                    </View>
                  </View>
                  
                  {expandedBills.has(bill.id) && (
                    <View style={styles.expandedContent}>
                      {bill.people.map((person, index) => (
                        <View key={index} style={styles.friendRow}>
                          <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                              <Text style={styles.avatarText}>{person.name.charAt(0)}</Text>
                            </View>
                            <View style={styles.friendInfo}>
                              <Text style={styles.friendName}>{person.name}</Text>
                              {person.orderItems && (
                                <View style={styles.orderItems}>
                                  {person.orderItems.map((item, idx) => (
                                    <Text key={idx} style={styles.orderItem}>
                                      {item.qty}x {item.name} - {item.price.formatted}
                                    </Text>
                                  ))}
                                </View>
                              )}
                            </View>
                          </View>
                          <View style={styles.friendRight}>
                            <Text style={styles.friendAmount}>{person.subtotal.formatted}</Text>
                            <View style={[styles.statusBadge, 
                              person.status === 'lunas' ? styles.statusLunas : styles.statusTertunda
                            ]}>
                              <Text style={[styles.statusText,
                                person.status === 'lunas' ? styles.statusTextLunas : styles.statusTextTertunda
                              ]}>{person.status === 'lunas' ? 'Lunas' : 'Tertunda'}</Text>
                            </View>
                          </View>
                        </View>
                      ))}
                      <Pressable style={styles.receiptButton}>
                        <Text style={styles.receiptButtonText}>Lihat Struk</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* Tagihan yang Harus Dibayar */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="card-outline" size={20} color="#FF8736" />
                <Text style={styles.sectionTitle}>Tagihan yang Harus Dibayar</Text>
              </View>
              {runningTransactions.map((bill) => (
                <View key={bill.id} style={[styles.paymentCard, styles.payableCard]}>
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentHeader}>
                      <Text style={styles.billTitle}>{bill.title}</Text>
                      <View style={[styles.statusIndicator, 
                        bill.status === 'pengingat' && styles.statusPengingat,
                        bill.status === 'permintaan' && styles.statusPermintaan,
                        bill.status === 'terlambat' && styles.statusTerlambat
                      ]}>
                        <Text style={[styles.statusIndicatorText,
                          bill.status === 'pengingat' && styles.statusTextPengingat,
                          bill.status === 'permintaan' && styles.statusTextPermintaan,
                          bill.status === 'terlambat' && styles.statusTextTerlambat
                        ]}>{bill.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={styles.payerName}>Dibayar oleh: {bill.from}</Text>
                    <Text style={styles.dueDate}>Jatuh tempo: {bill.dueDate}</Text>
                    <Text style={styles.billAmount}>{bill.amount.formatted}</Text>
                  </View>
                  <View style={styles.paymentActions}>
                    {(() => {
                      const rule = BUTTON_RULES.buttonRules.find(r => r.when.status === bill.status);
                      const actions = rule?.setActions || { payNow: false, payLater: false, overdue: false };
                      return (
                        <>
                          {actions.payNow && (
                            <Pressable 
                              style={styles.payNowButton}
                              onPress={() => {
                                console.log('Paying for transaction:', bill.id, bill.title, bill.amount.formatted);
                                router.push({
                                  pathname: '/monitoring/transaction/pembayaran',
                                  params: {
                                    transactionId: bill.id,
                                    title: bill.title,
                                    from: bill.from,
                                    amount: bill.amount.formatted,
                                    paymentMethod: 'sekarang'
                                  }
                                });
                              }}
                            >
                              <Text style={styles.payNowText}>Bayar Sekarang</Text>
                            </Pressable>
                          )}
                          {actions.payLater && (
                            <Pressable 
                              style={styles.payLaterButton}
                              onPress={() => {
                                console.log('Bayar Nanti for transaction:', bill.id, bill.title, bill.amount.formatted);
                                router.push({
                                  pathname: '/monitoring/transaction/pembayaran',
                                  params: {
                                    transactionId: bill.id,
                                    title: bill.title,
                                    from: bill.from,
                                    amount: bill.amount.formatted
                                  }
                                });
                              }}
                            >
                              <Text style={styles.payLaterText}>Bayar Nanti</Text>
                            </Pressable>
                          )}
                          {actions.overdue && (
                            <Pressable style={styles.overdueButton} disabled>
                              <Text style={styles.overdueText}>Jatuh Tempo</Text>
                            </Pressable>
                          )}
                        </>
                      );
                    })()} 
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          /* Tagihan Selesai */
          <>
            {/* Summary Cards for Completed */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.completedBillsCard]}>
                <Text style={styles.summaryTitle}>Total Tagihan Selesai</Text>
                <Text style={[styles.summaryAmount, styles.completedBillsAmount]}>{completedSummaryData.completedHostBills.formatted}</Text>
              </View>
              <View style={[styles.summaryCard, styles.completedPaymentCard]}>
                <Text style={styles.summaryTitle}>Total Pembayaran Selesai</Text>
                <Text style={[styles.summaryAmount, styles.completedPaymentAmount]}>{completedSummaryData.completedPayments.formatted}</Text>
              </View>
            </View>
            {/* Host Bills - Tagihan yang Aku Buat (100% terbayar) */}
            {MOCK_DATA.completed.hostBills.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
                  <Text style={styles.sectionTitle}>Tagihan yang Aku Buat (Selesai)</Text>
                </View>
                {MOCK_DATA.completed.hostBills.map((bill) => (
                  <View key={bill.id} style={[styles.completedCard, styles.completedMyBillCard]}>
                    <View style={styles.billHeader}>
                      <View style={styles.billInfo}>
                        <Text style={styles.billTitle}>{bill.title}</Text>
                        <Text style={styles.billDate}>Selesai: {bill.dateDone}</Text>
                        <Text style={styles.billAmount}>{bill.total.formatted}</Text>
                      </View>
                      <View style={styles.billActions}>
                        <DonutChart progress={bill.progress} />
                        <Pressable onPress={() => toggleExpanded(bill.id)}>
                          <Ionicons 
                            name={expandedBills.has(bill.id) ? 'chevron-up' : 'chevron-down'} 
                            size={20} 
                            color={Colors.textSecondary} 
                          />
                        </Pressable>
                      </View>
                    </View>
                    
                    {expandedBills.has(bill.id) && bill.people && (
                      <View style={styles.expandedContent}>
                        {bill.people.map((person, index) => (
                          <View key={index} style={styles.friendRow}>
                            <View style={styles.avatarContainer}>
                              <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{person.name.charAt(0)}</Text>
                              </View>
                              <View style={styles.friendInfo}>
                                <Text style={styles.friendName}>{person.name}</Text>
                                <Text style={styles.paymentMethod}>
                                  {person.method === 'bayar-sekarang' ? 'Bayar Sekarang' : 'Auto-Transfer'} : {person.paidAt}
                                </Text>
                                {person.orderItems && (
                                  <View style={styles.orderItems}>
                                    {person.orderItems.map((item, idx) => (
                                      <Text key={idx} style={styles.orderItem}>
                                        {item.qty}x {item.name} - {item.price.formatted}
                                      </Text>
                                    ))}
                                  </View>
                                )}
                              </View>
                            </View>
                            <View style={styles.friendRight}>
                              <Text style={styles.friendAmount}>{person.subtotal.formatted}</Text>
                              <View style={styles.statusBadgeSuccess}>
                                <Text style={styles.statusTextSuccess}>Lunas</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                        {bill.receiptUrl && (
                          <Pressable style={styles.receiptButton}>
                            <Text style={styles.receiptButtonText}>Lihat Struk</Text>
                          </Pressable>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Payment History - Pembayaran Selesai */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-done-outline" size={20} color="#9CA3AF" />
                <Text style={styles.sectionTitle}>Pembayaran Selesai</Text>
              </View>
              {completedPayments.map((payment) => (
                <View key={payment.id} style={[styles.paymentHistoryCard, styles.completedPayableCard]}>
                  <View style={styles.paymentHistoryHeader}>
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{payment.hostName.charAt(0)}</Text>
                      </View>
                      <View style={styles.paymentMainInfo}>
                        <Text style={styles.paymentLabel}>Pembayaran Selesai untuk {payment.hostName}</Text>
                        <Text style={styles.paymentTitle}>{payment.title}</Text>
                        <Text style={styles.paymentMethod}>
                          {payment.method === 'bayar-sekarang' ? 'Bayar Sekarang' : 'Auto-Transfer'} : {payment.methodDate}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.paymentRight}>
                      <Text style={styles.paymentAmount}>{payment.amount.formatted}</Text>
                      <View style={styles.statusBadgeSuccess}>
                        <Text style={styles.statusTextSuccess}>Lunas</Text>
                      </View>
                      <Pressable onPress={() => toggleExpanded(payment.id)}>
                        <Ionicons 
                          name={expandedBills.has(payment.id) ? 'chevron-up' : 'chevron-down'} 
                          size={20} 
                          color={Colors.textSecondary} 
                        />
                      </Pressable>
                    </View>
                  </View>

                  {expandedBills.has(payment.id) && payment.items && (
                    <View style={styles.paymentExpandedContent}>
                      <Text style={styles.expandedTitle}>{payment.title}</Text>
                      <Text style={styles.expandedStatus}>Done : {payment.methodDate}</Text>
                      <View style={styles.expandedAmountRow}>
                        <View style={styles.statusBadgeSuccess}>
                          <Text style={styles.statusTextSuccess}>Lunas</Text>
                        </View>
                        <Text style={styles.expandedAmount}>{payment.amount.formatted}</Text>
                      </View>
                      
                      <View style={styles.dividerToolbar}>
                        <Text style={styles.dividerText}>Rincian Pesanan Kamu</Text>
                        {payment.receiptUrl && (
                          <Pressable style={styles.receiptButtonSmall}>
                            <Text style={styles.receiptButtonSmallText}>Lihat Struk</Text>
                          </Pressable>
                        )}
                      </View>
                      
                      <View style={styles.itemsTable}>
                        {payment.items.map((item, index) => (
                          <View key={index} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQty}>{item.qty}x</Text>
                            <Text style={styles.itemPrice}>{item.price.formatted}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UI_STATE_PAYLOAD.theme.colors.backgroundMain,
  },
  header: {
    backgroundColor: '#00897B',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  segmentedControl: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSegment: {
    backgroundColor: '#00897B',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeSegmentText: {
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 120,
    flexGrow: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: UI_STATE_PAYLOAD.theme.colors.cardBg,
    borderRadius: UI_STATE_PAYLOAD.theme.radius,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00897B',
  },
  pendingPaymentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF8736',
    backgroundColor: '#FFF7ED',
  },
  pendingPaymentAmount: {
    color: '#FF8736',
  },
  myBillsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#00897B',
    backgroundColor: '#F0FDFA',
  },
  myBillsAmount: {
    color: '#00897B',
  },
  completedPaymentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
  },
  completedPaymentAmount: {
    color: '#9CA3AF',
  },
  completedBillsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  completedBillsAmount: {
    color: '#16A34A',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  billCard: {
    backgroundColor: UI_STATE_PAYLOAD.theme.colors.cardBg,
    borderRadius: UI_STATE_PAYLOAD.theme.radius,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myBillCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#00897B',
    backgroundColor: '#F0FDFA',
  },
  payableCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF8736',
    backgroundColor: '#FFF7ED',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  billInfo: {
    flex: 1,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  billDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00897B',
  },
  billActions: {
    alignItems: 'flex-end',
    gap: 8,
  },

  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  friendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  orderItems: {
    marginTop: 4,
  },
  orderItem: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  friendRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  friendAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.success,
  },
  statusLunas: {
    backgroundColor: '#DCFCE7',
  },
  statusTertunda: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.white,
  },
  statusTextLunas: {
    color: '#16A34A',
  },
  statusTextTertunda: {
    color: '#D97706',
  },
  receiptButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E0F2F1',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  receiptButtonText: {
    fontSize: 12,
    color: '#00897B',
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentInfo: {
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusPengingat: {
    backgroundColor: '#E3F2FD',
  },
  statusPermintaan: {
    backgroundColor: '#FFF8E1',
  },
  statusTerlambat: {
    backgroundColor: '#FFEBEE',
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusTextPengingat: {
    color: '#1976D2',
  },
  statusTextPermintaan: {
    color: '#F57C00',
  },
  statusTextTerlambat: {
    color: '#D32F2F',
  },
  payerName: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  payNowButton: {
    flex: 1,
    backgroundColor: '#00897B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  payNowText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  payLaterButton: {
    flex: 1,
    backgroundColor: Colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  payLaterText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '900',
  },
  overdueButton: {
    flex: 1,
    backgroundColor: Colors.disabled,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  overdueText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  completedCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHistoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedMyBillCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  completedPayableCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#9CA3AF',
    backgroundColor: '#F9FAFB',
  },
  paymentHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  paymentMainInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00897B',
  },
  statusBadgeSuccess: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
  },
  statusTextSuccess: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  paymentExpandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandedHeaderText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  expandedStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  expandedAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  expandedAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00897B',
  },
  dividerToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  receiptButtonSmall: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E0F2F1',
    borderRadius: 6,
  },
  receiptButtonSmallText: {
    fontSize: 10,
    color: '#00897B',
    fontWeight: '600',
  },
  itemsTable: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  itemQty: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'right',
    minWidth: 80,
  },
});
