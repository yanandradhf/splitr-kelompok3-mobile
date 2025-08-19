import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isIOS = Platform.OS === 'ios';

export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = React.useRef<(TextInput | null)[]>([]);
  
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FF8A50" />
      
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Lupa Password</Text>
      </View>

      {/* Main Form Container */}
      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
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
            style={styles.verifyButton}
            onPress={handleVerifyOTP}
            activeOpacity={0.9}
          >
            <Text style={styles.verifyButtonText}>Verifikasi Kode OTP</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.resendButton}
            onPress={handleResendOTP}
            activeOpacity={0.7}
          >
            <Text style={styles.resendButtonText}>Kirim Ulang Kode</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF8736',
  },
  backButton: {
    position: 'absolute',
    top: isIOS ? 90 : 70,
    left: 20,
    width: 40,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 20 : 30,
    paddingTop: isIOS ? 80 : 60,
  },
  title: {
    fontSize: isSmallScreen ? 20 : 22,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  formWrapper: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: isSmallScreen ? 10 : 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    flex: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: isSmallScreen ? 30 : 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  subtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    color: '#000000ff',
    marginBottom: isSmallScreen ? 15 : 20,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    lineHeight: 22,
  },
  description: {
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: '400',
    color: '#666666',
    marginBottom: isSmallScreen ? 20 : 25,
    textAlign: 'left',
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 18,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.47,
    paddingHorizontal: 10,
  },
  otpBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    width: 45,
    height: 50,
    fontSize: isSmallScreen ? 18 : 20,
    color: '#333',
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  verifyButton: {
    backgroundColor: '#5DDBD3',
    borderRadius: 8,
    paddingVertical: isSmallScreen ? 15 : 18,
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: 10,
  },
  verifyButtonText: {
    color: '#000',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: isIOS ? 30 : 20,
  },
  resendButtonText: {
    color: '#FF8736',
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textDecorationLine: 'underline',
  },
});