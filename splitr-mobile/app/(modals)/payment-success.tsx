import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';

export default function PaymentSuccessScreen() {
  const params = useLocalSearchParams();
  
  console.log('🎉 SUCCESS SCREEN PARAMS:', params);
  
  // Parse receiptData if it exists
  let receiptData = null;
  try {
    if (params.receiptData && typeof params.receiptData === 'string') {
      receiptData = JSON.parse(params.receiptData);
    }
  } catch (error) {
    console.error('Error parsing receiptData:', error);
  }
  
  // Extract data from either params or receiptData
  const transactionId = receiptData?.transactionId || params.transactionId;
  const amount = receiptData?.amount || params.nominal;
  const billName = receiptData?.bill?.billName || params.title || params.billName;
  const billCode = receiptData?.bill?.billCode || params.billCode || 'BILL001';
  const hostName = receiptData?.bill?.hostName || params.from || params.hostName;
  const recipientAccount = receiptData?.recipient?.account || params.recipientAccount || '0987654321';
  const paymentType = params.paymentType || 'instant';

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundMain} />
      <SafeAreaView style={styles.container}>


        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons 
              name={paymentType === 'scheduled' ? "calendar" : "checkmark-circle"} 
              size={80} 
              color={COLORS.teal} 
            />
          </View>
          
          <Text style={styles.successTitle}>
            {paymentType === 'scheduled' ? 'Pembayaran Dijadwalkan!' : 'Pembayaran Berhasil!'}
          </Text>
          <Text style={styles.successMessage}>
            {paymentType === 'scheduled' 
              ? 'Pembayaran Anda telah dijadwalkan dan akan diproses otomatis'
              : 'Transaksi Anda telah berhasil diproses'
            }
          </Text>
          
          <View style={styles.detailCard}>
            {transactionId && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>ID Transaksi</Text>
                <Text style={styles.detailValue}>{transactionId}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nominal</Text>
              <Text style={styles.detailValue}>Rp {amount?.toLocaleString('id-ID') || '0'}</Text>
            </View>
            {billName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Nama Tagihan</Text>
                <Text style={styles.detailValue}>{billName}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Kode Tagihan</Text>
              <Text style={styles.detailValue}>{billCode}</Text>
            </View>
            {hostName && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Host</Text>
                <Text style={styles.detailValue}>{hostName}</Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rekening Tujuan</Text>
              <Text style={styles.detailValue}>BNI - {recipientAccount}</Text>
            </View>
            <View style={[styles.detailRow, styles.lastRow]}>
              <Text style={styles.detailLabel}>Jenis Pembayaran</Text>
              <Text style={styles.detailValue}>
                {paymentType === 'instant' ? 'Bayar Sekarang' : 'Pembayaran Terjadwal'}
              </Text>
            </View>
            {paymentType === 'scheduled' && receiptData?.scheduledDate && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tanggal Eksekusi</Text>
                <Text style={styles.detailValue}>
                  {new Date(receiptData.scheduledDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.homeButton}
              onPress={() => router.replace('/(tabs)/monitoring')}
            >
              <Text style={styles.homeButtonText}>Kembali</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 60,
    marginTop: -40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: 12,
  },

  homeButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
};