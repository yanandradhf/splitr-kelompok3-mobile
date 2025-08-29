import React from 'react';
import { Text, TextProps } from 'react-native';
import { FONTS, FALLBACK_FONTS } from '../../constants/theme';
import { useFonts } from '../../hooks/useFonts';

interface SafeTextProps extends TextProps {
  fontWeight?: keyof typeof FONTS;
}

export const SafeText: React.FC<SafeTextProps> = ({ 
  style, 
  fontWeight = 'regular', 
  ...props 
}) => {
  const { fontsLoaded } = useFonts();
  
  const fontFamily = fontsLoaded ? FONTS[fontWeight] : FALLBACK_FONTS[fontWeight];
  
  return (
    <Text 
      {...props} 
      style={[
        { fontFamily },
        style
      ]} 
    />
  );
};