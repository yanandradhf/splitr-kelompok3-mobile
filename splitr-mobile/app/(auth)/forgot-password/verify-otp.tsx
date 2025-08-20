import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../../constants/theme';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto focus ke box selanjutnya
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Auto focus ke box sebelumnya saat backspace
    if (e.nativeEvent.key === 'Backspace') {
      const newOtp = [...otp];
      if (otp[index]) {
        // Jika ada digit, hapus dan tetap di box ini
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        // Jika box kosong, hapus box sebelumnya dan pindah ke sana
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    
    if (!otpString || otpString.length !== 6) {
      Alert.alert('Error', 'Masukkan kode OTP lengkap');
      return;
    }

    router.push('/forgot-password/reset-password');
  };

  const handleResendOTP = () => {
    Alert.alert('Berhasil', 'Kode OTP baru telah dikirim');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>Verifikasi OTP</Text>
            <View style={styles.placeholder} />
          </View>

          {/* White Panel */}
          <View style={styles.panel}>
            <View style={styles.panelContent}>
              <Text style={styles.subtitle}>Masukkan kode OTP</Text>
              
              <Text style={styles.description}>
                Kami telah mengirimkan kode verifikasi ke email Anda. Masukkan kode tersebut untuk pergantian password.
              </Text>
              
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={styles.otpBox}
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"
                    autoFocus={index === 0}
                  />
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, otp.join('').length !== 6 && styles.primaryBtnDisabled]}
                onPress={handleVerifyOTP}
                disabled={otp.join('').length !== 6}
              >
                <Text style={[styles.primaryBtnText, otp.join('').length !== 6 && styles.primaryBtnTextDisabled]}>Verifikasi Kode OTP</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.resendButton}
                onPress={handleResendOTP}
              >
                <Text style={styles.resendButtonText}>Kirim Ulang Kode</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
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
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -50,
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 200,
    gap: 14,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  otpBox: {
    backgroundColor: '#EEF1F5',
    borderRadius: 10,
    width: 45,
    height: 50,
    fontSize: 20,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  primaryBtn: {
    backgroundColor: COLORS.teal,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    color: COLORS.white,
  },
  primaryBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  primaryBtnTextDisabled: {
    color: '#9CA3AF',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  resendButtonText: {
    color: COLORS.teal,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    textDecorationLine: 'underline',
  },
});