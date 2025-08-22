import React from 'react';
import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import { COLORS } from '../../constants/theme';

interface SpinnerProps extends Omit<ActivityIndicatorProps, 'color'> {
  color?: string;
}

export default function Spinner({ color = COLORS.teal, ...props }: SpinnerProps) {
  return <ActivityIndicator color={color} {...props} />;
}