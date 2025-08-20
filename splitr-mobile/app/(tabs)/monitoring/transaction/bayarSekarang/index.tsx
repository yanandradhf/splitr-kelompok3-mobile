import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../../../../constants/theme';

export default function BayarSekarangScreen() {
  const params = useLocalSearchParams();
  const { transactionId, title = 'TIKET KONSER COLDPLAY', from = 'Hans Sye', amount = '0' } = params;
  const [nominal, setNominal] = useState((amount as string).replace('Rp ', ''));
  const [catatan, setCatatan] = useState('');
  
  console.log('=== BAYAR SEKARANG SCREEN PARAMS ===');
  console.log('transactionId:', transactionId);
  console.log('title:', title);
  console.log('from:', from);
  console.log('amount:', amount);

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return '';
    return new Intl.NumberFormat('id-ID').format(parseInt(numericValue));
  };

  const handleNominalChange = (text: string) => {
    const formatted = formatCurrency(text);
    setNominal(formatted);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Metode Bayar Sekarang</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Bank BNI Card */}
          <View style={styles.bankCard}>
            <View style={styles.bankInfo}>
              <View style={styles.bankIcon}>
                <Text style={styles.bankIconText}>BNI</Text>
              </View>
              <Text style={styles.bankName}>Bank BNI</Text>
            </View>
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* User Info */}
            <View style={styles.userSection}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>HS</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>Hans Sye</Text>
                  <Text style={styles.userBank}>BNI • 1902489737</Text>
                </View>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Nominal */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nominal</Text>
                <View style={styles.nominalContainer}>
                  <Text style={styles.currencyPrefix}>Rp</Text>
                  <TextInput
                    value={nominal}
                    onChangeText={handleNominalChange}
                    placeholder="0"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="numeric"
                    style={styles.nominalInput}
                    editable={false}
                  />
                </View>
              </View>

              {/* Sumber Dana */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sumber Dana</Text>
                <View style={styles.sourceContainer}>
                  <Text style={styles.sourceText}>TAPLUS PEGAWAI BNI • 1918292749</Text>
                  <Text style={styles.sourceSubtext}>IVANA ILHAMSYAH</Text>
                  <Text style={styles.sourceBalance}>Rp ****************</Text>
                </View>
              </View>

              {/* Pembayaran */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pembayaran</Text>
                <View style={styles.paymentContainer}>
                  <Text style={styles.paymentText}>{(title as string).toUpperCase()}</Text>
                </View>
              </View>

              {/* Catatan */}
              <View style={styles.inputGroup}>
                <TextInput
                  value={catatan}
                  onChangeText={setCatatan}
                  placeholder="Catatan (opsional)"
                  placeholderTextColor={COLORS.placeholder}
                  multiline
                  style={styles.catatanInput}
                />
              </View>
            </View>

            {/* Konfirmasi Button */}
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => {
                router.push(`/monitoring/transaction/bayarSekarang/rincian?nominal=${encodeURIComponent(nominal)}&transactionId=${transactionId}&title=${encodeURIComponent(title as string)}&from=${encodeURIComponent(from as string)}`);
              }}
            >
              <Text style={styles.confirmButtonText}>Konfirmasi</Text>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  bankCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.orange,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bankIconText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  bankName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
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
  },
  userSection: {
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  userBank: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  nominalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  currencyPrefix: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginRight: 8,
  },
  nominalInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    padding: 0,
  },
  sourceContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  sourceText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sourceSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  sourceBalance: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  paymentContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  paymentText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  catatanInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});