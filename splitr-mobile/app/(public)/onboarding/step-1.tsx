import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold, Poppins_800ExtraBold, Poppins_900Black } from '@expo-google-fonts/poppins';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Onboarding1() {
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
        <Text style={styles.welcomeText}>Welcome to Splitr!</Text>
        <Image 
          source={require('../../../assets/images/onboarding1.png')} 
          style={styles.onboardingImage}
          resizeMode="contain"
        />
        <Text style={styles.titleText}>Split Bill jadi lebih mudah!</Text>
        <Text style={styles.descriptionText}>Fitur grup dalam aplikasi yang memudahkan kita untuk membagikan bill dengan teman-teman tanpa malu untuk menagih utang!</Text>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={() => router.push('/onboarding/step-2')}
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
    position: 'relative',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#070707ff',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Poppins_900Black',
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
    fontFamily: 'Poppins_600SemiBold',
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