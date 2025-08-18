import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';

const { width } = Dimensions.get('window');

interface Onboarding1Props {
  currentIndex: number;
  onNext: () => void;
}

export default function Onboarding1({ currentIndex, onNext }: Onboarding1Props) {
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
      <Image 
        source={require('../../../assets/images/splitr.png')} 
        style={styles.logoTop}
        resizeMode="contain"
      />
      <Text style={styles.welcomeText}>Welcome to Splitr !</Text>
      <Image 
        source={require('../../../assets/images/onboarding1.png')} 
        style={styles.onboardingImage}
        resizeMode="contain"
      />
      <Text style={styles.titleText}>
        <Text style={styles.titleBlack}>Split Bill </Text>
        <Text style={styles.titleOrange}>jadi mudah !</Text>
      </Text>
      <Text style={styles.descriptionText}>Fitur grup dalam aplikasi yang memudahkan kita untuk membagikan bill dengan teman-teman tanpa malu untuk menagih utang!</Text>
      
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, currentIndex === 0 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 1 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 2 && styles.activeDot]} />
      </View>
      
      <TouchableOpacity 
        style={styles.nextButton}
        onPress={onNext}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
    padding: 10,
  },
  logoTop: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 80,
    height: 40,
  },
  welcomeText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#070707ff',
    textAlign: 'center',
    marginBottom: 0,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  onboardingImage: {
    width: 250,
    height: 250,
    marginBottom: 0,
  },
  titleText: {
    fontSize: 30,
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
    textAlign: 'justify',
    lineHeight: 20,
    marginBottom: 50,
    fontFamily: 'PlusJakartaSans_400Regular',
    paddingHorizontal: 20,
    width: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF8736',
  },
  nextButton: {
    backgroundColor: '#FF8736',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
});