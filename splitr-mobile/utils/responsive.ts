import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Screen size breakpoints
export const SCREEN_SIZES = {
  SMALL: 320,
  MEDIUM: 375,
  LARGE: 414,
  EXTRA_LARGE: 480,
};

// Check if device is tablet
export const isTablet = screenWidth >= 768;

// Check platform
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Responsive width function
export const wp = (percentage: number): number => {
  return (screenWidth * percentage) / 100;
};

// Responsive height function
export const hp = (percentage: number): number => {
  return (screenHeight * percentage) / 100;
};

// Responsive font size
export const rf = (size: number): number => {
  const scale = screenWidth / SCREEN_SIZES.MEDIUM;
  const newSize = size * scale;
  
  if (Platform.OS === 'ios') {
    return Math.max(12, Math.min(newSize, 30));
  } else {
    return Math.max(12, Math.min(newSize * 0.95, 28));
  }
};

// Get responsive padding/margin
export const getSpacing = (size: number): number => {
  if (screenWidth <= SCREEN_SIZES.SMALL) {
    return size * 0.8;
  } else if (screenWidth >= SCREEN_SIZES.LARGE) {
    return size * 1.1;
  }
  return size;
};

// Get responsive border radius
export const getBorderRadius = (size: number): number => {
  return getSpacing(size);
};

// Get responsive icon size
export const getIconSize = (size: number): number => {
  if (screenWidth <= SCREEN_SIZES.SMALL) {
    return size * 0.9;
  } else if (screenWidth >= SCREEN_SIZES.LARGE) {
    return size * 1.1;
  }
  return size;
};

// Safe area padding for different devices
export const getSafeAreaPadding = () => {
  if (isIOS) {
    return {
      top: screenHeight > 800 ? 44 : 20, // iPhone X and newer vs older
      bottom: screenHeight > 800 ? 34 : 0,
    };
  } else {
    return {
      top: 0,
      bottom: 0,
    };
  }
};

export const deviceInfo = {
  screenWidth,
  screenHeight,
  isTablet,
  isIOS,
  isAndroid,
};