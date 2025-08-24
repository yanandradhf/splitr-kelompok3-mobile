import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatRp } from '@/lib/currency';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../../../../constants/theme';
import { API_CONFIG } from '../../../../../constants/config';
import api from '../../../../../services/api';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const {
    billId,
    billName,
    amount,
    hostName,
    hostAccount,
    paymentDeadline,
    canSchedule,
    isOverdue
  } = params;

  const [paymentMethod, setPaymentMethod] = useState<'instant' | 'scheduled'>('instant');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.MY_ACCOUNT);
      if (response.data) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching account:', error);
    }
  };

  const myAccount = userProfile ? {
    name: userProfile.accountName,
    accountNumber: userProfile.accountNumber,
    balance: userProfile.balance || 0
  } : {
    name: 'Loading...',
    accountNumber: '...',
    balance: 0
  };

  const paymentAmount = parseInt(amount as string);
  const deadline = paymentDeadline ? new Date(paymentDeadline as string) : null;
  const maxScheduleDate = deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const handlePayment = () => {
    if (!userProfile) {
      Alert.alert('Error', 'Data profil belum dimuat. Silakan coba lagi.');
      return;
    }

    if (paymentAmount > myAccount.balance) {
      Alert.alert('Saldo Tidak Cukup', 'Saldo Anda tidak mencukupi untuk melakukan pembayaran ini.');
      return;
    }

    if (paymentMethod === 'instant') {
      Alert.alert(
        'Konfirmasi Pembayaran',
        `Bayar ${formatRp(paymentAmount)} sekarang?`,
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Bayar', 
            onPress: () => {
              router.push('/monitoring/transaction/pembayaran/berhasil');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Konfirmasi Jadwal Pembayaran',
        `Jadwalkan pembayaran ${formatRp(paymentAmount)} pada ${selectedDate.toLocaleDateString('id-ID')}?`,
        [
          { text: 'Batal', style: 'cancel' },
          { 
            text: 'Jadwalkan', 
            onPress: () => {
              router.push('/monitoring/transaction/pembayaran/berhasil');
            }
          }
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Pembayaran</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Bill Info */}
            <View style={styles.billCard}>
              <Text style={styles.billName}>{billName}</Text>
              <Text style={styles.hostInfo}>Kepada: {hostName}</Text>
              {isOverdue === 'true' && (
                <View style={styles.overdueWarning}>
                  <Ionicons name="warning" size={16} color={COLORS.red} />
                  <Text style={styles.overdueText}>Pembayaran Terlambat</Text>
                </View>
              )}
            </View>

            {/* Amount */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Jumlah Pembayaran</Text>
              <Text style={styles.amountValue}>{formatRp(paymentAmount)}</Text>
            </View>

            {/* Destination Account */}
            <View style={styles.accountCard}>
              <Text style={styles.cardTitle}>Rekening Tujuan</Text>
              <View style={styles.accountInfo}>
                <View style={styles.accountIcon}>
                  <Ionicons name="card" size={24} color={COLORS.teal} />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{hostName}</Text>
                  <Text style={styles.accountNumber}>BNI - {hostAccount}</Text>
                </View>
              </View>
            </View>

            {/* Source Account */}
            <View style={styles.accountCard}>
              <Text style={styles.cardTitle}>Sumber Dana</Text>
              <View style={styles.accountInfo}>
                <View style={styles.accountIcon}>
                  <Ionicons name="wallet" size={24} color={COLORS.teal} />
                </View>
                <View style={styles.accountDetails}>
                  <Text style={styles.accountName}>{myAccount.name}</Text>
                  <Text style={styles.accountNumber}>BNI - {myAccount.accountNumber}</Text>
                  <Text style={styles.balance}>Saldo: {formatRp(myAccount.balance)}</Text>
                </View>
              </View>
            </View>

            {/* Payment Method */}
            {canSchedule === 'true' && (
              <View style={styles.methodCard}>
                <Text style={styles.cardTitle}>Metode Pembayaran</Text>
                
                <Pressable 
                  style={[styles.methodOption, paymentMethod === 'instant' && styles.methodOptionActive]}
                  onPress={() => setPaymentMethod('instant')}
                >
                  <View style={styles.methodInfo}>
                    <Ionicons name="flash" size={20} color={paymentMethod === 'instant' ? COLORS.teal : COLORS.textSecondary} />
                    <Text style={[styles.methodText, paymentMethod === 'instant' && styles.methodTextActive]}>
                      Bayar Sekarang
                    </Text>
                  </View>
                  <View style={[styles.radio, paymentMethod === 'instant' && styles.radioActive]} />
                </Pressable>

                <Pressable 
                  style={[styles.methodOption, paymentMethod === 'scheduled' && styles.methodOptionActive]}
                  onPress={() => setPaymentMethod('scheduled')}
                >
                  <View style={styles.methodInfo}>
                    <Ionicons name="calendar" size={20} color={paymentMethod === 'scheduled' ? COLORS.teal : COLORS.textSecondary} />
                    <Text style={[styles.methodText, paymentMethod === 'scheduled' && styles.methodTextActive]}>
                      Jadwalkan Pembayaran
                    </Text>
                  </View>
                  <View style={[styles.radio, paymentMethod === 'scheduled' && styles.radioActive]} />
                </Pressable>

                {paymentMethod === 'scheduled' && (
                  <View style={styles.dateSection}>
                    <Text style={styles.dateLabel}>Pilih Tanggal Pembayaran</Text>
                    <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                      <Ionicons name="calendar-outline" size={20} color={COLORS.teal} />
                      <Text style={styles.dateText}>{selectedDate.toLocaleDateString('id-ID')}</Text>
                      <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
                    </Pressable>
                    <Text style={styles.dateHint}>
                      Maksimal: {maxScheduleDate.toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Balance Warning */}
            {paymentAmount > myAccount.balance && (
              <View style={styles.warningCard}>
                <Ionicons name="warning" size={20} color={COLORS.warning} />
                <Text style={styles.warningText}>Saldo tidak mencukupi untuk pembayaran ini</Text>
              </View>
            )}
          </ScrollView>

          {/* Payment Button */}
          <View style={styles.buttonContainer}>
            <Pressable 
              style={[
                styles.payButton,
                paymentAmount > myAccount.balance && styles.payButtonDisabled
              ]} 
              onPress={handlePayment}
              disabled={paymentAmount > myAccount.balance}
            >
              <Text style={styles.payButtonText}>
                {paymentMethod === 'instant' ? 'Bayar Sekarang' : 'Jadwalkan Pembayaran'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
            maximumDate={maxScheduleDate}
          />
        )}
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
  billCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  billName: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  hostInfo: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    backgroundColor: '#FEF2F2',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  overdueText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.red,
  },
  amountCard: {
    backgroundColor: '#F8FFFE',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E0F2F1',
  },
  amountLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  amountValue: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.teal,
  },
  accountCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F8FFFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountDetails: {
    flex: 1,
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
    marginBottom: SPACING.xs,
  },
  balance: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
  },
  methodCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: SPACING.sm,
  },
  methodOptionActive: {
    borderColor: COLORS.teal,
    backgroundColor: '#F8FFFE',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  methodText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  methodTextActive: {
    color: COLORS.teal,
    fontFamily: FONTS.semiBold,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  radioActive: {
    borderColor: COLORS.teal,
    backgroundColor: COLORS.teal,
  },
  dateSection: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dateLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: SPACING.xs,
  },
  dateText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  dateHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: '#FFFBEB',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: SPACING.md,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
    flex: 1,
  },
  buttonContainer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  payButton: {
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  payButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },
});