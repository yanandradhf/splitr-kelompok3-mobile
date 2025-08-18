import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Onboarding1 from './step-1';
import Onboarding2 from './step-2';
import Onboarding3 from './step-3';

const { width } = Dimensions.get('window');

export default function OnboardingSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      style={styles.container}
    >
      <View style={styles.slide}>
        <Onboarding1 currentIndex={currentIndex} onNext={goToNext} />
      </View>
      <View style={styles.slide}>
        <Onboarding2 currentIndex={currentIndex} onNext={goToNext} />
      </View>
      <View style={styles.slide}>
        <Onboarding3 currentIndex={currentIndex} onGetStarted={handleGetStarted} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  slide: {
    width: width,
    height: '100%',
  },
});