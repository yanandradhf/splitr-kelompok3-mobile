import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';

interface OfflineScreenProps {
  onRetry: () => void;
}

export default function OfflineScreen({ onRetry }: OfflineScreenProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="wifi-outline" size={80} color={COLORS.textSecondary} />
      <Text style={styles.title}>Tidak ada koneksi</Text>
      <Text style={styles.message}>
        Pastikan WiFi atau data seluler aktif dan coba lagi
      </Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Coba Lagi</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 20,
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.tosca,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
});