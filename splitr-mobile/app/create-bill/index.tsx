// app/create-bill/index.tsx
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/Colors';

type Method = 'scan' | 'manual' | null;

export default function CreateBillIndex() {
  const [selectedMethod, setSelectedMethod] = useState<Method>(null);

  const handleContinue = () => {
    if (selectedMethod === 'scan') {
      router.push('/create-bill/camera');
    } else if (selectedMethod === 'manual') {
      router.push('/create-bill/manual');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Buat Tagihan</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Pilih metode untuk membuat tagihan</Text>

        <View style={styles.methodsContainer}>
          <Pressable
            style={[styles.methodCard, selectedMethod === 'scan' && styles.selectedCard]}
            onPress={() => setSelectedMethod('scan')}
          >
            <View style={styles.methodIcon}>
              <Ionicons name="camera" size={32} color={selectedMethod === 'scan' ? Colors.white : '#00897B'} />
            </View>
            <Text style={[styles.methodTitle, selectedMethod === 'scan' && styles.selectedText]}>
              Scan Struk
            </Text>
            <Text style={[styles.methodDesc, selectedMethod === 'scan' && styles.selectedText]}>
              Ambil foto struk untuk otomatis mengisi detail tagihan
            </Text>
          </Pressable>

          <Pressable
            style={[styles.methodCard, selectedMethod === 'manual' && styles.selectedCard]}
            onPress={() => setSelectedMethod('manual')}
          >
            <View style={styles.methodIcon}>
              <Ionicons name="create" size={32} color={selectedMethod === 'manual' ? Colors.white : '#00897B'} />
            </View>
            <Text style={[styles.methodTitle, selectedMethod === 'manual' && styles.selectedText]}>
              Manual
            </Text>
            <Text style={[styles.methodDesc, selectedMethod === 'manual' && styles.selectedText]}>
              Isi detail tagihan secara manual
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.continueButton, !selectedMethod && styles.disabledButton]}
          onPress={handleContinue}
          disabled={!selectedMethod}
        >
          <Text style={[styles.continueText, !selectedMethod && styles.disabledText]}>
            Lanjut
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F7F7FB',
  },
  header: {
    backgroundColor: '#00897B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  methodsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  methodCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    backgroundColor: '#00897B',
    borderColor: '#00897B',
  },
  methodIcon: {
    marginBottom: 16,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  methodDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedText: {
    color: Colors.white,
  },
  continueButton: {
    backgroundColor: '#00897B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  disabledButton: {
    backgroundColor: Colors.disabled,
  },
  continueText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: Colors.textSecondary,
  },
});