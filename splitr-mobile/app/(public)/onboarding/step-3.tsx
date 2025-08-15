import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, Poppins_900Black } from '@expo-google-fonts/poppins';

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 350;
const isMediumDevice = width >= 350 && width < 400;
const isLargeDevice = width >= 400;

interface Onboarding3Props {
  onGetStarted?: () => void;
  onPrevious?: () => void;
}

export default function Onboarding3({ onGetStarted, onPrevious }: Onboarding3Props) {
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
          source={require('../../../assets/images/onboarding3.png')} 
          style={styles.onboardingImage}
          resizeMode="contain"
        />
        <Text style={styles.titleText}>Pantau Tagihan dalam Satu Layar</Text>
        <Text style={styles.descriptionText}>Selesaikan pembayaran dengan cepat dan dapatkan notifikasi otomatis untuk semua transaksi.</Text>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.belumPunyaButton}
            onPress={onGetStarted}
          >
            <Text style={styles.belumPunyaText}>Belum Punya Rekening Wondr</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sudahPunyaButton}
            onPress={onGetStarted}
          >
            <Text style={styles.sudahPunyaText}>Sudah Punya Rekening Wondr</Text>
          </TouchableOpacity>
        </View>
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
    fontFamily: 'Poppins_800ExtraBold',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: 'Poppins_400Regular',
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  belumPunyaButton: {
    backgroundColor: '#71DBD1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
    width: '100%',
  },
  belumPunyaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  sudahPunyaButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#71DBD1',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
  },
  sudahPunyaText: {
    color: '#71DBD1',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },

});