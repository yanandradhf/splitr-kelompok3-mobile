import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSendOTP = () => {
    if (!email) {
      Alert.alert('Error', 'Masukkan email anda terlebih dahulu');
      return;
    }
    
    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Format email tidak valid');
      return;
    }

    Alert.alert('Berhasil', 'Kode OTP telah dikirim ke email anda');
    router.push('/forgot-password/verify-otp');
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
          <Text style={styles.subtitle}>Masukan Email anda</Text>
          
          <TextInput
            style={styles.emailInput}
            placeholder="Email"
            placeholderTextColor="#CCCCCC"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity 
            style={styles.otpButton}
            onPress={handleSendOTP}
            activeOpacity={0.9}
          >
            <Text style={styles.otpButtonText}>Kirim OTP</Text>
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
    fontWeight: '700',
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
    fontWeight: '500',
    color: '#000000ff',
    marginBottom: isSmallScreen ? 20 : 30,
    textAlign: 'left',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  emailInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: isSmallScreen ? 15 : 18,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
    marginBottom: height * 0.58,
    borderWidth: 0,
  },
  otpButton: {
    backgroundColor: '#5DDBD3',
    borderRadius: 8,
    paddingVertical: isSmallScreen ? 15 : 18,
    alignItems: 'center',
    marginHorizontal: 5,
    marginBottom: isIOS ? 30 : 20,
  },
  otpButtonText: {
    color: '#000',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});