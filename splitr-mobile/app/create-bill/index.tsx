import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONTS } from '../../constants/theme';

type Method = 'scan' | 'manual' | null;

export default function CreateBillIndex() {
  const [selectedMethod, setSelectedMethod] = useState<Method>(null);

  const handleContinue = () => {
    if (selectedMethod === 'scan') {
      router.push('/bill/scan-bill/camera');
    } else if (selectedMethod === 'manual') {
      router.push('/create-bill/manual');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buat Tagihan</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.whiteModalContainer}>
          <View style={styles.content}>
            <Text style={styles.subtitle}>Pilih metode untuk membuat tagihan</Text>

            <View style={styles.methodsContainer}>
              <TouchableOpacity
                style={[styles.methodCard, selectedMethod === 'scan' && styles.selectedCard]}
                onPress={() => setSelectedMethod('scan')}
                activeOpacity={0.8}
              >
                <View style={styles.methodIcon}>
                  <Ionicons name="camera" size={32} color={selectedMethod === 'scan' ? COLORS.white : COLORS.teal} />
                </View>
                <Text style={[styles.methodTitle, selectedMethod === 'scan' && styles.selectedText]}>
                  Scan Struk
                </Text>
                <Text style={[styles.methodDesc, selectedMethod === 'scan' && styles.selectedText]}>
                  Ambil foto struk untuk otomatis mengisi detail tagihan
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodCard, selectedMethod === 'manual' && styles.selectedCard]}
                onPress={() => setSelectedMethod('manual')}
                activeOpacity={0.8}
              >
                <View style={styles.methodIcon}>
                  <Ionicons name="create" size={32} color={selectedMethod === 'manual' ? COLORS.white : COLORS.teal} />
                </View>
                <Text style={[styles.methodTitle, selectedMethod === 'manual' && styles.selectedText]}>
                  Manual
                </Text>
                <Text style={[styles.methodDesc, selectedMethod === 'manual' && styles.selectedText]}>
                  Isi detail tagihan secara manual
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.continueButton, !selectedMethod && styles.disabledButton]}
              onPress={handleContinue}
              disabled={!selectedMethod}
              activeOpacity={0.8}
            >
              <Text style={[styles.continueText, !selectedMethod && styles.disabledText]}>
                Lanjut
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    width: 24,
  },
  whiteModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  methodsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  methodCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  methodIcon: {
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  methodDesc: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedText: {
    color: COLORS.white,
  },
  continueButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
});