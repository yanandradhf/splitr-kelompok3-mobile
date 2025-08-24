import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../../../../constants/theme';

export default function RincianBayarScreen() {
  const params = useLocalSearchParams();
  const { nominal = '0', transactionId, title, from } = params;

  const stepData = {
    title: 'Rincian Split Bill',
    nominal: nominal as string,
    showSummary: true,
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
            <Text style={styles.headerTitle}>{stepData.title}</Text>
            <View style={styles.placeholder} />
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
                  <Text style={styles.avatarText}>{(from as string)?.substring(0, 2)?.toUpperCase() || 'XX'}</Text>
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>{from}</Text>
                  <Text style={styles.userBank}>BNI • ****</Text>
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
                  <Text style={styles.nominalText}>{stepData.nominal}</Text>
                </View>
              </View>

              {/* Sumber Dana */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sumber Dana</Text>
                <View style={styles.sourceContainer}>
                  <Text style={styles.sourceText}>BNI Taplus</Text>
                  <Text style={styles.sourceSubtext}>Rekening Utama</Text>
                  <Text style={styles.sourceBalance}>Saldo tersedia</Text>
                </View>
              </View>

              {/* Pembayaran */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pembayaran</Text>
                <View style={styles.paymentContainer}>
                  <Text style={styles.paymentText}>{(title as string).toUpperCase()}</Text>
                </View>
              </View>

              {stepData.showSummary && (
                <View style={styles.summarySection}>
                  <Text style={styles.summaryTitle}>Penerima</Text>
                  <Text style={styles.summaryName}>{(from as string)?.toUpperCase()}</Text>
                  
                  <Text style={styles.summaryTitle}>Sumber Dana</Text>
                  <Text style={styles.summaryText}>BNI Taplus</Text>
                  <Text style={styles.summarySubtext}>Rekening Utama</Text>
                  
                  <Text style={styles.summaryTitle}>Pembayaran</Text>
                  <Text style={styles.summaryText}>{(title as string)?.toUpperCase() || 'PEMBAYARAN'}</Text>
                  
                  <View style={styles.amountSection}>
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Jumlah Nominal</Text>
                      <Text style={styles.amountValue}>Rp {stepData.nominal}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Konfirmasi Button */}
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={() => {
                // Navigate to PIN verification screen
                router.push({
                  pathname: '/pin-verification',
                  params: {
                    title: 'Konfirmasi Pembayaran',
                    subtitle: `Bayar Rp ${stepData.nominal}`,
                    billId: transactionId,
                    amount: stepData.nominal,
                    paymentMethod: 'instant',
                    hostName: from,
                    billName: title
                  }
                });
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
  nominalText: {
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
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
  summarySection: {
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 4,
  },
  summaryName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  summarySubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountSection: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  amountValue: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
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