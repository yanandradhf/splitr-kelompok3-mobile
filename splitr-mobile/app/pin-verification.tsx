import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants/theme';
import { API_CONFIG } from '../constants/config';
import api from '../services/api';

interface PinVerificationProps {
  onSuccess?: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  subtitle?: string;
}

export default function PinVerificationScreen() {
  const params = useLocalSearchParams();
  const { title, subtitle, billId, amount, paymentMethod, scheduledDate, hostName, billName } = params;
  
  console.log('🔍 PIN VERIFICATION PARAMS:');
  console.log('amount:', amount, 'type:', typeof amount);
  console.log('billName:', billName);
  console.log('hostName:', hostName);
  console.log('All params:', JSON.stringify(params, null, 2));
  
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (key: string | number) => {
    if (key === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (key !== '' && pin.length < 6) {
      setPin(prev => prev + key);
    }
  };

  const handleConfirm = async () => {
    if (pin.length !== 6) return;
    
    try {
      setLoading(true);
      
      const requestBody: any = {
        billId: billId as string,
        amount: parseInt(amount as string),
        pin: pin
      };

      if (paymentMethod === 'scheduled' && scheduledDate) {
        requestBody.scheduledDate = scheduledDate;
      }

      console.log('🚀 Payment request:', requestBody);
      
      const response = await api.post(API_CONFIG.ENDPOINTS.PAYMENT_CREATE, requestBody);
      
      console.log('✅ Payment response:', JSON.stringify(response.data, null, 2));
      console.log('✅ Full response object keys:', Object.keys(response.data));
      if (response.data.data) {
        console.log('✅ Response.data.data keys:', Object.keys(response.data.data));
      }
      
      if (response.data.success) {
        // Use the actual API response structure
        const receiptData = response.data.receipt;
        
        console.log('=== BERHASIL SCREEN PARAMS ===');
        console.log('transactionId:', receiptData.transactionId);
        console.log('nominal:', receiptData.amount);
        console.log('title:', receiptData.bill.billName);
        console.log('from:', receiptData.bill.hostName);
        console.log('=== RECEIPT DATA TO SEND ===');
        console.log(JSON.stringify(receiptData, null, 2));
        
        console.log('🚀 NAVIGATING TO SUCCESS SCREEN');
        console.log('Path: /(tabs)/monitoring/transaction/pembayaran/berhasil');
        
        router.replace({
          pathname: '/(tabs)/monitoring/transaction/pembayaran/berhasil',
          params: {
            receiptData: JSON.stringify(receiptData),
            paymentType: response.data.paymentType
          }
        });
        console.log('✅ Navigation called');
      } else {
        Alert.alert('Pembayaran Gagal', response.data.message || 'Terjadi kesalahan.');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      Alert.alert('Pembayaran Gagal', error.response?.data?.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={handleCancel} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </Pressable>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.lockIcon}>
              <Ionicons name="lock-closed" size={32} color={COLORS.teal} />
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>
            {title as string || 'Masukkan PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {subtitle as string || 'Masukkan PIN 6 digit untuk melanjutkan'}
          </Text>

          {/* PIN Dots */}
          <View style={styles.pinContainer}>
            {[...Array(6)].map((_, index) => (
              <View key={index} style={[
                styles.pinDot,
                pin.length > index && styles.pinDotFilled
              ]} />
            ))}
          </View>

          {/* Keypad */}
          <View style={styles.keypad}>
            {[1,2,3,4,5,6,7,8,9,'',0,'backspace'].map((key, index) => (
              <Pressable
                key={index}
                style={[
                  styles.key,
                  key === '' && styles.keyEmpty,
                  key === 'backspace' && styles.keySpecial
                ]}
                onPress={() => handleKeyPress(key)}
                disabled={key === ''}
              >
                {key === 'backspace' ? (
                  <Ionicons name="backspace-outline" size={24} color={COLORS.textPrimary} />
                ) : (
                  <Text style={styles.keyText}>{key}</Text>
                )}
              </Pressable>
            ))}
          </View>

          {/* Confirm Button */}
          <Pressable 
            style={[
              styles.confirmButton,
              (pin.length !== 6 || loading) && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={pin.length !== 6 || loading}
          >
            <Text style={styles.confirmButtonText}>
              {loading ? 'Memverifikasi...' : 'Konfirmasi'}
            </Text>
          </Pressable>


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
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FFFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E0F2F1',
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  pinDotFilled: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    maxWidth: 300,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  },
  keySpecial: {
    backgroundColor: '#F8F9FA',
  },
  keyText: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minWidth: 200,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
  },

});