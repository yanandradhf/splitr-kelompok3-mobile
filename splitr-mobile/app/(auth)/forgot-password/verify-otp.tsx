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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../../constants/theme';
import { authAPI } from '../../../services/api';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { useLocalSearchParams } from 'expo-router';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef<(TextInput | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { email } = useLocalSearchParams<{ email: string }>();

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

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (!otpString || otpString.length !== 6) {
      Alert.alert('Error', 'Masukkan kode OTP lengkap');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email tidak ditemukan');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.verifyResetOTP({ 
        email: email as string, 
        otp: otpString 
      });
      
      if (response.status === 200) {
        const { tempToken } = response.data;
        router.push({
          pathname: '/forgot-password/reset-password',
          params: { tempToken }
        });
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Kode OTP tidak valid. Silakan coba lagi.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Email tidak ditemukan');
      return;
    }

    try {
      const response = await authAPI.sendResetOTP({ email: email as string });
      if (response.status === 200) {
        Alert.alert('Berhasil', 'Kode OTP baru telah dikirim');
        setOtp(['', '', '', '', '', '']); // Clear current OTP
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Gagal mengirim ulang OTP.';
      Alert.alert('Error', errorMessage);
    }
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
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
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
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                  ))}
                </View>

                <TouchableOpacity 
                  style={[styles.primaryBtn, (otp.join('').length !== 6 || isLoading) && styles.primaryBtnDisabled]}
                  onPress={handleVerifyOTP}
                  disabled={otp.join('').length !== 6 || isLoading}
                >
                  <Text style={[styles.primaryBtnText, (otp.join('').length !== 6 || isLoading) && styles.primaryBtnTextDisabled]}>
                    {isLoading ? 'Memverifikasi...' : 'Verifikasi Kode OTP'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={handleResendOTP}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendButtonText}>Kirim Ulang Kode</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      
      {isLoading && <LoadingScreen />}
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    gap: 14,
    minHeight: 500,
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
    marginBottom: 30,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.teal,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  resendButtonText: {
    color: COLORS.teal,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
});