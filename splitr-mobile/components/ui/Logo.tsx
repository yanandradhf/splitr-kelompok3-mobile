import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES } from '../../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export default function Logo({ size = 'medium', style }: LogoProps) {
  const logoStyles = {
    small: { fontSize: FONT_SIZES['3xl'] },
    medium: { fontSize: FONT_SIZES['5xl'] },
    large: { fontSize: FONT_SIZES['6xl'] },
  };

  const subtitleStyles = {
    small: { fontSize: FONT_SIZES.sm },
    medium: { fontSize: FONT_SIZES.base },
    large: { fontSize: FONT_SIZES.xl },
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.splitrText, logoStyles[size]]}>SPLITR</Text>
      <Text style={[styles.byBNIText, subtitleStyles[size]]}>
        by <Text style={styles.bniOrange}>BNI</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  splitrText: {
    fontFamily: FONTS.extraBold,
    color: COLORS.orange,
    letterSpacing: 2,
    marginBottom: 8,
  },
  byBNIText: {
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
  },
  bniOrange: {
    color: COLORS.orange,
    fontFamily: FONTS.bold,
  },
});