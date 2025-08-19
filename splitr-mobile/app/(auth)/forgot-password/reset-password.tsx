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

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleResetPassword = () => {
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

    router.push('/forgot-password/password-succes');
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
                placeholderTextColor="#CCCCCC"
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
                  color="#666" 
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
                placeholderTextColor="#CCCCCC"
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
                  color="#666" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetPassword}
            activeOpacity={0.9}
          >
            <Text style={styles.resetButtonText}>Ubah Password</Text>
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
    fontWeight: '600',
    color: '#000000ff',
    marginBottom: isSmallScreen ? 15 : 20,
    textAlign: 'left',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    lineHeight: 22,
  },
  description: {
    fontSize: isSmallScreen ? 12 : 13,
    fontWeight: '400',
    color: '#666666',
    marginBottom: isSmallScreen ? 25 : 30,
    textAlign: 'left',
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: isSmallScreen ? 20 : 25,
  },
  label: {
    fontSize: isSmallScreen ? 13 : 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: isSmallScreen ? 15 : 18,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#333',
  },
  eyeButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  resetButton: {
    backgroundColor: '#5DDBD3',
    borderRadius: 8,
    paddingVertical: isSmallScreen ? 15 : 18,
    alignItems: 'center',
    marginHorizontal: 5,
    marginTop: height * 0.30,
    marginBottom: isIOS ? 30 : 20,
  },
  resetButtonText: {
    color: '#000',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});