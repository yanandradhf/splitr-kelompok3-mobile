import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { COLORS as THEME_COLORS } from '../../../constants/theme';

const { width } = Dimensions.get('window');

interface Onboarding2Props {
  currentIndex: number;
  onNext: () => void;
  onPrevious?: () => void;
}

export default function Onboarding2({ currentIndex, onNext, onPrevious }: Onboarding2Props) {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* <Image 
        source={require('../../../assets/images/splitr.png')} 
        style={styles.logoTop}
        resizeMode="contain"
      /> */}
      <Image 
        source={require('../../../assets/images/step2.png')} 
        style={styles.onboardingImage}
        resizeMode="contain"
      />
      <Text style={styles.titleText}>
        <Text style={styles.titleBlack}>Pembayaran dengan sistem </Text>
        <Text style={styles.titleOrange}>auto-payment</Text>
      </Text>
      <Text style={styles.descriptionText}>Monitor semua pengeluaran grup Anda dengan mudah dan transparan untuk semua anggota.</Text>
      
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, currentIndex === 0 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 1 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 2 && styles.activeDot]} />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onPrevious}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={onNext}
        >
          <Text style={styles.nextButtonText}>Lanjut</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  logoTop: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 80,
    height: 40,
  },
  onboardingImage: {
    width: 300,
    height: 250,
    marginBottom: 20,
  },
  titleText: {
    fontSize: 29,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 29,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  titleBlack: {
    color: '#000000',
  },
  titleOrange: {
    color: '#FF8736',
  },
  descriptionText: {
    fontSize: 13,
    color: '#000000ff',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 50,
    fontFamily: 'PlusJakartaSans_400Regular',
    paddingHorizontal: 20,
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: THEME_COLORS.teal,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 50,
  },
  backButton: {
    backgroundColor: '#D1D5DB',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    flex: 0.45,
  },
  backButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: THEME_COLORS.teal,
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    flex: 0.45,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
});