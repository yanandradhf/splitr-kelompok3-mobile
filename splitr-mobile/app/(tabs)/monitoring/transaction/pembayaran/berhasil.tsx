import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import React from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { COLORS, FONTS } from '../../../../../constants/theme';
import { useTransactionStore } from '../../../../../store/transaction.store';

export default function BerhasilScreen() {
  const params = useLocalSearchParams();
  const { nominal = '0', transactionId, title = 'TIKET KONSER COLDPLAY', from = 'Hans Sye', paymentMethod, note } = params;
  const { completeTransaction } = useTransactionStore();
  
  const receiptRef = React.useRef();

  const handleDownload = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Permission to access media library is required!');
        return;
      }

      // Add delay to ensure component is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));

      const uri = await captureRef(receiptRef, {
        format: 'png',
        quality: 1,
        result: 'file',
      });

      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Splitr', asset, false);
      
      Alert.alert('Berhasil', 'Bukti transfer berhasil disimpan ke galeri');
    } catch (error) {
      console.log('Download error:', error);
      Alert.alert('Error', 'Gagal menyimpan bukti transfer');
    }
  };
  
  console.log('=== BERHASIL SCREEN PARAMS ===');
  console.log('transactionId:', transactionId);
  console.log('nominal:', nominal);
  console.log('title:', title);
  console.log('from:', from);
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View ref={receiptRef} style={styles.receiptContainer} collapsable={false}>
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
                <Text style={styles.successTitle}>Pembayaran Berhasil!</Text>
                <Text style={styles.paymentTitle}>{title}</Text>
                <Text style={styles.amount}>{nominal}</Text>
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

                {note && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Catatan</Text>
                    </View>
                    <View style={styles.noteInfo}>
                      <Text style={styles.noteText}>{note}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                  <Ionicons name="download-outline" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.downloadText}>Unduh</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton}>
                  <Ionicons name="share-outline" size={20} color={COLORS.textPrimary} />
                  <Text style={styles.shareText}>Bagikan</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Done Button */}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => {
                // Complete the transaction if transactionId exists
                if (transactionId) {
                  console.log('Completing transaction with ID:', transactionId);
                  console.log('Paid amount:', nominal);
                  console.log('Payment method:', paymentMethod);
                  completeTransaction(transactionId as string, nominal as string, paymentMethod as string);
                }
                // Use replace to force refresh
                router.replace('/monitoring');
              }}
            >
              <Text style={styles.doneButtonText}>Selesai</Text>
            </TouchableOpacity>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  illustration: {
    width: 120,
    height: 100,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.orange,
    marginBottom: 12,
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
    marginBottom: 0,
  },
  detailRow: {
    marginBottom: 8,
    marginTop: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
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
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sourceBank: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  noteInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  noteText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 40,
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
    paddingVertical: 14,
    paddingHorizontal: 120,
    alignItems: 'center',
    marginBottom: 40,
  },
  doneButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  receiptContainer: {
    backgroundColor: COLORS.white,
    width: '100%',
    alignItems: 'center',
    flex: 1,
  },
});