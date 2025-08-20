import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, FONTS } from '../../../../../constants/theme';

export default function PinScreen() {
  const params = useLocalSearchParams();
  const { nominal = '0', transactionId, title = 'TIKET KONSER COLDPLAY', from = 'Hans Sye' } = params;
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberPress = (number: string) => {
    if (pin.length < 6) {
      setPin(pin + number);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleConfirm = async () => {
    if (pin.length === 6) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        router.push(`/monitoring/transaction/bayarSekarang/berhasil?nominal=${encodeURIComponent(nominal as string)}&transactionId=${transactionId}&title=${encodeURIComponent(title as string)}&from=${encodeURIComponent(from as string)}`);
      }, 1500);
    }
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled,
            ]}
          >
            {index < pin.length && <Text style={styles.pinDotText}>*</Text>}
          </View>
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['Lupa?', '0', 'delete'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[
                  styles.numberButton,
                  item === 'Lupa?' && styles.forgotButton,
                  item === 'delete' && styles.deleteButton,
                ]}
                onPress={() => {
                  if (item === 'delete') {
                    handleDelete();
                  } else if (item === 'Lupa?') {
                    // Handle forgot PIN
                  } else {
                    handleNumberPress(item);
                  }
                }}
              >
                {item === 'delete' ? (
                  <Ionicons name="backspace" size={24} color={COLORS.white} />
                ) : (
                  <Text
                    style={[
                      styles.numberText,
                      item === 'Lupa?' && styles.forgotText,
                    ]}
                  >
                    {item}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Masukkan PIN</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <View style={styles.content}>
            <Text style={styles.pinTitle}>Pin saat ini</Text>
            
            {renderPinDots()}
            
            {renderNumberPad()}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                pin.length !== 6 && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={pin.length !== 6 || isLoading}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  pin.length !== 6 && styles.confirmButtonTextDisabled,
                ]}
              >
                {isLoading ? 'Memproses...' : 'Konfirmasi'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  purpleSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  pinTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 40,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 60,
    gap: 12,
  },
  pinDot: {
    width: 45,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotFilled: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  pinDotText: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  numberPad: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 40,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  numberButton: {
    width: 65,
    height: 65,
    borderRadius: 32,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotButton: {
    backgroundColor: 'transparent',
  },
  deleteButton: {
    backgroundColor: COLORS.orange,
  },
  numberText: {
    fontSize: 28,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  forgotText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 60,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  confirmButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});