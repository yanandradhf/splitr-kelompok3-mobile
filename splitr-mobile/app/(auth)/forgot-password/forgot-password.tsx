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
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONTS } from '../../../constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

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
            <Text style={styles.title}>Lupa Password</Text>
            <View style={styles.placeholder} />
          </View>

          {/* White Panel */}
          <View style={styles.panel}>
            <View style={styles.panelContent}>
              <Text style={styles.label}>Masukan Email Anda</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#6B7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity 
                style={[styles.primaryBtn, !email && styles.primaryBtnDisabled]}
                onPress={handleSendOTP}
                disabled={!email}
              >
                <Text style={[styles.primaryBtnText, !email && styles.primaryBtnTextDisabled]}>Kirim OTP</Text>
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
  label: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
  },
  input: {
    height: 44,
    backgroundColor: '#EEF1F5',
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.textPrimary,
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
});