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
import { authAPI } from '../../../services/api';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import { useLocalSearchParams } from 'expo-router';

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { tempToken } = useLocalSearchParams<{ tempToken: string }>();

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Masukkan password baru dan konfirmasi password');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Password dan konfirmasi password tidak sama');
      return;
    }

    if (!tempToken) {
      Alert.alert('Error', 'Token tidak valid. Silakan ulangi proses dari awal.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.resetPassword({
        tempToken: tempToken as string,
        newPassword,
        confirmPassword
      });
      
      if (response.status === 200) {
        router.push('/forgot-password/password-succes');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
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
            <Text style={styles.title}>Reset Password</Text>
            <View style={styles.placeholder} />
          </View>

          {/* White Panel */}
          <View style={styles.panel}>
            <View style={styles.panelContent}>
              <Text style={styles.subtitle}>Masukkan Password Baru</Text>
              
              <Text style={styles.description}>
                Buat password baru yang aman untuk akun Anda. Pastikan password minimal 6 karakter.
              </Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password Baru</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Masukkan password baru"
                    placeholderTextColor="#6B7280"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons 
                      name={showNewPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Konfirmasi Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Konfirmasi password baru"
                    placeholderTextColor="#6B7280"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity 
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off" : "eye"} 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.primaryBtn, (!newPassword || !confirmPassword || newPassword.length < 6 || isLoading) && styles.primaryBtnDisabled]}
                onPress={handleResetPassword}
                disabled={!newPassword || !confirmPassword || newPassword.length < 6 || isLoading}
              >
                <Text style={[styles.primaryBtnText, (!newPassword || !confirmPassword || newPassword.length < 6 || isLoading) && styles.primaryBtnTextDisabled]}>
                  {isLoading ? 'Mengubah...' : 'Ubah Password'}
                </Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF1F5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
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