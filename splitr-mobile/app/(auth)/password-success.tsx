import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const isIOS = Platform.OS === 'ios';

export default function PasswordSuccessScreen() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FF8A50" />

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Password Berhasil Diubah</Text>
      </View>

      {/* Main Form Container */}
      <View style={styles.formWrapper}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Password Berhasil Diubah</Text>

          <View style={styles.successIconContainer}>
            <Ionicons name="checkmark-circle" size={200} color="#5DDBD3" />
          </View>
          
          <Text style={styles.description}>
            Password Anda telah berhasil diubah. Sekarang Anda dapat menggunakan password baru untuk masuk ke akun Anda.
          </Text>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>Lanjutkan ke Aplikasi</Text>
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
  titleContainer: {
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 20 : 30,
    paddingTop: isIOS ? 80 : 60,
  },
  title: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: '600',
    color: '#000',
    letterSpacing: 0.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
    paddingHorizontal: 20,
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
    paddingTop: isSmallScreen ? 80 : 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: isSmallScreen ? 30 : 40,
    marginTop: isSmallScreen ? 20 : 30,
  },
  subtitle: {
    fontSize: isSmallScreen ? 20 : 24,
    fontWeight: '700',
    color: '#000000ff',
    marginBottom: isSmallScreen ? 15 : 20,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  description: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '400',
    color: '#666666',
    marginBottom: isSmallScreen ? 40 : 50,
    textAlign: 'justify',
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  continueButton: {
    backgroundColor: '#5DDBD3',
    borderRadius: 8,
    paddingVertical: isSmallScreen ? 15 : 18,
    alignItems: 'center',
    marginHorizontal: 5,
    marginTop: height * 0.15,
    marginBottom: isIOS ? 30 : 20,
    width: '100%',
  },
  continueButtonText: {
    color: '#000',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});