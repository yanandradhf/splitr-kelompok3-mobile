import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../../constants/theme';
import { profileAPI, authAPI } from '../../../services';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import * as SecureStore from 'expo-secure-store';

type PasswordStep = 'current' | 'new' | 'success';

const ChangePasswordScreen = () => {
  const [step, setStep] = useState<PasswordStep>('current');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleNext = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Semua field harus diisi');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi tidak cocok');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password baru minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    try {
      const response = await profileAPI.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      if (response.status === 200) {
        setStep('success');
      }
    } catch (error: any) {
      console.error('Change password error:', error.response?.data?.error || error.message);
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Gagal mengubah password. Silakan coba lagi.';
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'current': return 'Masukkan password saat ini';
      case 'new': return 'Masukkan password Baru';
      case 'success': return 'SELESAI!';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'current': return 'Masukkan password saat ini';
      case 'new': return 'Masukkan password baru';
      case 'success': return 'Password Berhasil Diubah';
    }
  };

  const getButtonText = () => {
    return 'Ubah Password';
  };

  const handleLogoutAfterSuccess = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.log('Logout API error:', error);
    } finally {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      router.replace('/(auth)/login');
    }
  };

  if (step === 'success') {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="light-content" />
        
        <View style={[styles.backgroundSection, { paddingTop: insets.top }]}>
            <View style={styles.header}>
              <View style={styles.placeholder} />
              <Text style={styles.headerTitle}>Password Berhasil Diubah</Text>
              <View style={styles.placeholder} />
            </View>
        </View>
      
      <View style={styles.successContainer}>
          <Text style={styles.successSubtitle}>Password Anda telah berhasil diubah. Silakan login kembali dengan password baru.</Text>
          
          <View style={styles.successIcon}>
            <View style={styles.checkmarkOuter}>
              <View style={styles.checkmarkInner}>
                <Ionicons name="checkmark" size={40} color={COLORS.white} />
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogoutAfterSuccess}
          >
            <Text style={styles.logoutButtonText}>Login Kembali</Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="light-content" />
      
      <View style={[styles.backgroundSection, { paddingTop: insets.top }]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ubah Password</Text>
            <View style={styles.placeholder} />
          </View>
      </View>
    
    <View style={styles.formContainer}>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password Saat Ini</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Masukkan password saat ini"
                placeholderTextColor="#B0B0B0"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password Baru</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.textInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Masukkan password baru"
                placeholderTextColor="#B0B0B0"
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
            <Text style={styles.inputLabel}>Konfirmasi Password Baru</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.textInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Konfirmasi password baru"
                placeholderTextColor="#B0B0B0"
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
            style={[
              styles.nextButton,
              (!currentPassword || !newPassword || !confirmPassword || newPassword.length < 6) 
                ? styles.nextButtonDisabled : null
            ]}
            onPress={handleNext}
            disabled={!currentPassword || !newPassword || !confirmPassword || newPassword.length < 6 || isLoading}
          >
            <Text style={styles.nextButtonText}>
              {isLoading ? 'Mengubah...' : getButtonText()}
            </Text>
          </TouchableOpacity>
      </View>
      
      {isLoading && <LoadingScreen />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  backgroundSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },

  formContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 30,
    flex: 1,
    marginBottom: -50,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingRight: 50,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },

  nextButton: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  nextButtonDisabled: {
    backgroundColor: '#AAA',
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  successContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 30,
    alignItems: 'center',
    flex: 1,
    marginBottom: -50,
    justifyContent: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 60,
  },
  successIcon: {
    marginBottom: 80,
  },
  checkmarkOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 137, 123, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});

export default ChangePasswordScreen;