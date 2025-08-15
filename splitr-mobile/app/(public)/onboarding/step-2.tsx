import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, Poppins_900Black } from '@expo-google-fonts/poppins';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Onboarding2() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image 
          source={require('../../../assets/images/onboarding2.png')} 
          style={styles.onboardingImage}
          resizeMode="contain"
        />
        <Text style={styles.titleText}>Pembayaran dengan sistem auto-payment</Text>
        <Text style={styles.descriptionText}>Monitor semua pengeluaran grup Anda dengan mudah dan transparan untuk semua anggota.</Text>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => router.push('/onboarding/step-3')}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF8736',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  onboardingImage: {
    width: 250,
    height: 200,
    marginBottom: 30,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8736',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins_700Bold',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: 'Poppins_400Regular',
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
    fontFamily: 'Poppins_600SemiBold',
  },
});