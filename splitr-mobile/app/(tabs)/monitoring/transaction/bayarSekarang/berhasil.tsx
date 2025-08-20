import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../../../../constants/theme';
import { useTransactionStore } from '../../../../../store/transaction.store';

export default function BerhasilScreen() {
  const params = useLocalSearchParams();
  const { nominal = '0', transactionId, title = 'TIKET KONSER COLDPLAY', from = 'Hans Sye' } = params;
  const { completeTransaction } = useTransactionStore();
  
  console.log('=== BERHASIL SCREEN PARAMS ===');
  console.log('transactionId:', transactionId);
  console.log('nominal:', nominal);
  console.log('title:', title);
  console.log('from:', from);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <View style={styles.placeholder} />
            <Text style={styles.headerTitle}>Berhasil</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Success Illustration */}
            <View style={styles.illustrationContainer}>
              <Image
                source={require('../../../../../assets/images/transaksi berhasil icon.png')}
                style={styles.illustration}
                resizeMode="contain"
              />
            </View>

            {/* Success Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.successTitle}>Pembayaran Berhasil</Text>
              <Text style={styles.paymentTitle}>{title}</Text>
              <Text style={styles.amount}>Rp {nominal}</Text>
            </View>

            {/* Payment Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Penerima</Text>
              </View>
              <View style={styles.recipientInfo}>
                <Text style={styles.recipientName}>{(from as string).toUpperCase()}</Text>
                <Text style={styles.recipientBank}>BNI • 1902489737</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sumber Dana</Text>
              </View>
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceName}>IVANA ILHAMSYAH</Text>
                <Text style={styles.sourceBank}>TAPLUS PEGAWAI BNI • 1918292749</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.downloadButton}>
                <Ionicons name="download-outline" size={20} color={COLORS.textPrimary} />
                <Text style={styles.downloadText}>Unduh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-outline" size={20} color={COLORS.textPrimary} />
                <Text style={styles.shareText}>Bagikan</Text>
              </TouchableOpacity>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                // Complete the transaction if transactionId exists
                if (transactionId) {
                  console.log('Completing transaction with ID:', transactionId);
                  console.log('Paid amount:', nominal);
                  completeTransaction(transactionId as string, nominal as string);
                }
                // Use replace to force refresh
                router.replace('/monitoring');
              }}
            >
              <Text style={styles.doneButtonText}>Selesai</Text>
            </TouchableOpacity>

            <View style={{ height: 50 }} />
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
  purpleSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
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
    marginBottom: -50,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
    alignItems: 'center',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  illustration: {
    width: 250,
    height: 200,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.orange,
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  amount: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  detailRow: {
    marginBottom: 8,
    marginTop: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  recipientInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  recipientBank: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  sourceInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  sourceName: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sourceBank: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  downloadButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
  },
  downloadText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  shareButton: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
  },
  shareText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  doneButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 60,
    alignItems: 'center',
    marginTop: 20,
  },
  doneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});