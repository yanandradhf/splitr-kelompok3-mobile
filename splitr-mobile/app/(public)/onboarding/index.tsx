import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { COLORS as THEME_COLORS } from '../../../constants/theme';

const { width } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    image: require('../../../assets/images/step1.png'),
    title: 'Split Bill ',
    titleHighlight: 'jadi mudah !',
    description: 'Fitur grup dalam aplikasi yang memudahkan kita untuk membagikan bill dengan teman-teman tanpa malu untuk menagih utang!',
    welcomeText: 'Welcome to Splitr !'
  },
  {
    id: 2,
    image: require('../../../assets/images/step2.png'),
    title: 'Pembayaran dengan sistem ',
    titleHighlight: 'auto-payment',
    description: 'Monitor semua pengeluaran grup Anda dengan mudah dan transparan untuk semua anggota.'
  },
  {
    id: 3,
    image: require('../../../assets/images/onboarding3.png'),
    title: 'Pantau Tagihan dalam ',
    titleHighlight: 'Satu Layar',
    description: 'Selesaikan pembayaran dengan cepat dan dapatkan notifikasi otomatis untuk semua transaksi.'
  }
];

export default function OnboardingSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const goToNext = () => {
    if (currentIndex < 2) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      scrollViewRef.current?.scrollTo({ x: prevIndex * width, animated: true });
    }
  };

  const handleBelumPunyaPress = () => {
    const wondrUrl = 'https://apps.apple.com/id/app/wondr-by-bni/id6499518320';
    const wondrUrlAndroid = 'https://play.google.com/store/apps/details?id=com.bni.wondr';
    Linking.openURL(wondrUrl).catch(() => {
      Linking.openURL(wondrUrlAndroid);
    });
  };

  const handleSudahPunyaPress = () => {
    router.replace('/(auth)/login');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {onboardingData.map((item, index) => (
          <View key={item.id} style={styles.slide}>
            <View style={styles.content}>
              {index === 0 && (
                <Text style={styles.welcomeText}>{item.welcomeText}</Text>
              )}
              <Image 
                source={item.image} 
                style={styles.onboardingImage}
                resizeMode="contain"
              />
              <Text style={styles.titleText}>
                <Text style={styles.titleBlack}>{item.title}</Text>
                <Text style={styles.titleOrange}>{item.titleHighlight}</Text>
              </Text>
              <Text style={styles.descriptionText}>{item.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.dotsContainer}>
        {onboardingData.map((_, index) => (
          <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
        ))}
      </View>
      
      {currentIndex < 2 ? (
        <View style={styles.buttonContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={goToPrevious}
            >
              <Text style={styles.backButtonText}>Kembali</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={[styles.nextButton, currentIndex === 0 && styles.fullWidthButton]}
            onPress={goToNext}
          >
            <Text style={styles.nextButtonText}>Lanjut</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.finalButtonContainer}>
          <TouchableOpacity
            style={styles.belumPunyaButton}
            onPress={handleSudahPunyaPress}
          >
            <Text style={styles.belumPunyaText}>Sudah Punya Rekening BNI</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sudahPunyaButton}
            onPress={handleBelumPunyaPress}
          >
            <Text style={styles.sudahPunyaText}>Belum Punya Rekening BNI</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width: width,
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 33,
    fontWeight: 'bold',
    color: '#070707ff',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
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
    fontFamily: 'PlusJakartaSans_400Regular',
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
    paddingBottom: 50,
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
  fullWidthButton: {
    flex: 1,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
  finalButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  belumPunyaButton: {
    backgroundColor: THEME_COLORS.teal,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15,
  },
  belumPunyaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
  sudahPunyaButton: {
    backgroundColor: '#D1D5DB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  sudahPunyaText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
  },
});