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

type PinStep = 'current' | 'new' | 'confirm' | 'success';

const ChangePinScreen = () => {
  const [step, setStep] = useState<PinStep>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['Lupa?', '0', '×']
  ];

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

  const getTitle = () => {
    switch (step) {
      case 'current': return 'Masukkan pin splitr anda';
      case 'new': return 'Masukkan pin splitr baru';
      case 'confirm': return 'Masukkan pin splitr baru';
      case 'success': return 'SELESAI!';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'current': return 'Pin saat ini';
      case 'new': return 'Buat Pin Baru';
      case 'confirm': return 'Buat Pin Baru';
      case 'success': return 'Pin Berhasil Diubah';
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 'current': return 'Done';
      case 'new': return 'Done';
      case 'confirm': return 'Ubah Pin';
      default: return 'Done';
    }
  };

  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FF7A00" barStyle="light-content" />
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>SELESAI!</Text>
        
        <View style={styles.successContainer}>
          <Text style={styles.successSubtitle}>Pin Berhasil Diubah</Text>
          
          <View style={styles.successIcon}>
            <View style={styles.checkmarkOuter}>
              <View style={styles.checkmarkInner}>
                <Ionicons name="checkmark" size={40} color="#6EDCD9" />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" />
      
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>{getTitle()}</Text>
      
      <View style={styles.pinContainer}>
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
          {keypadNumbers.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((num, numIndex) => (
                <TouchableOpacity
                  key={numIndex}
                  style={styles.keypadButton}
                  onPress={() => handleNumberPress(num)}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF7A00',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 100,
    marginBottom: 40,
  },
  pinContainer: {
    backgroundColor: '#FF7A00',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    flex: 1,
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 30,
    fontWeight: '600',
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
    borderColor: '#FFF',
  },
  pinDotFilled: {
    backgroundColor: '#FFF',
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
    color: '#000',
    fontWeight: '500',
  },
  keypadSpecialText: {
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  nextButton: {
    backgroundColor: '#6EDCD9',
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
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#FF7A00',
    borderRadius: 25,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    flex: 1,
    marginBottom: 40,
    justifyContent: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 60,
    fontWeight: '600',
  },
  successIcon: {
    marginBottom: 80,
  },
  checkmarkOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(110, 220, 217, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6EDCD9',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChangePinScreen;