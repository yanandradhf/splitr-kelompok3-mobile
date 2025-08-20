import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../../constants/theme';

function Stepper({ current }: { current: number }) {
  const steps = [1, 2, 3];

  return (
    <View style={styles.stepper}>
      {steps.map((s, idx) => (
        <View key={s} style={styles.stepSlot}>
          <View
            style={[
              styles.halfLine,
              idx === 0 && styles.invisible,
              s - 1 < current && idx !== 0 && { backgroundColor: COLORS.teal },
            ]}
          />
          <View
            style={[
              styles.stepCircle,
              s <= current && { backgroundColor: COLORS.teal },
            ]}
          >
            <Text
              style={[
                styles.stepLabel,
                s <= current && { color: COLORS.white },
              ]}
            >
              {s}
            </Text>
          </View>
          <View
            style={[
              styles.halfLine,
              idx === steps.length - 1 && styles.invisible,
              s < current && idx !== steps.length - 1 && { backgroundColor: COLORS.teal },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

type PinStep = 'current' | 'new' | 'confirm' | 'success';

const ChangePinScreen = () => {
  const [step, setStep] = useState<PinStep>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const getKeypadNumbers = () => {
    const baseNumbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9']
    ];
    
    if (step === 'current') {
      return [...baseNumbers, ['Lupa?', '0', '×']];
    } else {
      return [...baseNumbers, ['', '0', '×']];
    }
  };

  const getCurrentPin = () => {
    switch (step) {
      case 'current': return currentPin;
      case 'new': return newPin;
      case 'confirm': return confirmPin;
      default: return '';
    }
  };

  const setCurrentPinValue = (value: string) => {
    switch (step) {
      case 'current': setCurrentPin(value); break;
      case 'new': setNewPin(value); break;
      case 'confirm': setConfirmPin(value); break;
    }
  };

  const handleNumberPress = (num: string) => {
    if (num === '×') {
      const current = getCurrentPin();
      setCurrentPinValue(current.slice(0, -1));
    } else if (num === 'Lupa?') {
      // Handle forgot PIN
      return;
    } else {
      const current = getCurrentPin();
      if (current.length < 6) {
        setCurrentPinValue(current + num);
      }
    }
  };

  const handleNext = () => {
    if (step === 'current') {
      // TODO: Validate current PIN
      setStep('new');
    } else if (step === 'new') {
      setStep('confirm');
    } else if (step === 'confirm') {
      if (newPin === confirmPin) {
        setStep('success');
      } else {
        // Show error
        alert('PIN tidak cocok');
      }
    }
  };

  const getStepNumber = () => {
    switch (step) {
      case 'current': return 1;
      case 'new': return 2;
      case 'confirm': return 3;
      default: return 1;
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'current': return 'Masukkan PIN Lama';
      case 'new': return 'Buat PIN Baru';
      case 'confirm': return 'Konfirmasi PIN Baru';
      case 'success': return 'SELESAI!';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'current': return 'Masukkan PIN lama Anda untuk melanjutkan';
      case 'new': return 'Buat PIN baru yang mudah diingat';
      case 'confirm': return 'Masukkan ulang PIN baru Anda';
      case 'success': return 'PIN Berhasil Diubah';
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 'current': return 'Konfirmasi';
      case 'new': return 'Lanjut';
      case 'confirm': return 'Ubah PIN';
      default: return 'Konfirmasi';
    }
  };

  if (step === 'success') {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="light-content" />
          
          <View style={styles.backgroundSection}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Ubah PIN</Text>
              <View style={styles.placeholder} />
            </View>
          </View>
        
        <View style={styles.successContainer}>
          <Text style={styles.successSubtitle}>Pin Berhasil Diubah</Text>
          
          <View style={styles.successIcon}>
            <View style={styles.checkmarkOuter}>
              <View style={styles.checkmarkInner}>
                <Ionicons name="checkmark" size={40} color={COLORS.white} />
              </View>
            </View>
          </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="light-content" />
        
        <View style={styles.backgroundSection}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ubah PIN</Text>
            <View style={styles.placeholder} />
          </View>
          <Stepper current={getStepNumber()} />
        </View>
      
      <View style={styles.pinContainer}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
        
        <View style={styles.pinDisplay}>
          {[...Array(6)].map((_, index) => (
            <View 
              key={index}
              style={[
                styles.pinDot,
                index < getCurrentPin().length && styles.pinDotFilled
              ]}
            />
          ))}
        </View>

        <View style={styles.keypad}>
          {getKeypadNumbers().map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((num, numIndex) => (
                <TouchableOpacity
                  key={numIndex}
                  style={styles.keypadButton}
                  onPress={() => handleNumberPress(num)}
                  disabled={num === ''}
                >
                  <Text style={[
                    styles.keypadText,
                    num === 'Lupa?' && styles.keypadSpecialText
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            getCurrentPin().length < 6 && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={getCurrentPin().length < 6}
        >
          <Text style={styles.nextButtonText}>{getButtonText()}</Text>
        </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  backgroundSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  stepSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfLine: {
    width: 30,
    height: 3,
    backgroundColor: COLORS.gray,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  invisible: { opacity: 0 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLabel: { 
    fontFamily: FONTS.bold, 
    fontSize: 14,
    color: COLORS.textSecondary 
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },

  pinContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 30,
    alignItems: 'center',
    flex: 1,
    marginBottom: -50,
  },

  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 15,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.gray,
  },
  pinDotFilled: {
    backgroundColor: COLORS.teal,
  },
  keypad: {
    marginBottom: 30,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  keypadButton: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  keypadText: {
    fontSize: 24,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  keypadSpecialText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 15,
    width: '70%',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#AAA',
  },
  nextButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  successContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 30,
    alignItems: 'center',
    flex: 1,
    marginBottom: -50,
    justifyContent: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 60,
  },
  successIcon: {
    marginBottom: 80,
  },
  checkmarkOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 137, 123, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChangePinScreen;