import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, COLORS as THEME_COLORS } from '../../constants/theme';

interface RegistrationProgressProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = [
  'Validasi Rekening',
  'Verifikasi Email', 
  'Kode OTP',
  'Buat Akun',
  'Set PIN'
];

export default function RegistrationProgress({ 
  currentStep, 
  totalSteps = 5 
}: RegistrationProgressProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.stepText}>
        Langkah {currentStep} dari {totalSteps}: {STEP_LABELS[currentStep - 1]}
      </Text>
      <Text style={styles.progressText}>{Math.round(progress)}% selesai</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME_COLORS.teal,
    borderRadius: 3,
  },
  stepText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: '#374151',
    marginBottom: 2,
  },
  progressText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: '#6B7280',
  },
});