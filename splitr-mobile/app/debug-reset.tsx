import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { StorageService } from '../utils/storage';
import { handleSessionError } from '../utils/errorHandler';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONTS } from '../constants/theme';

export default function DebugReset() {
  const handleReset = async () => {
    try {
      await StorageService.resetOnboarding();
      Alert.alert('Success', 'Onboarding reset! App akan restart ke onboarding.', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Gagal reset onboarding');
    }
  };

  const testSessionReplaced = async () => {
    await handleSessionError('SESSION_REPLACED', 'Account accessed from another device');
  };

  const testSessionExpired = async () => {
    await handleSessionError('SESSION_EXPIRED', 'Session has expired');
  };

  const testTokens = async () => {
    const accessToken = await SecureStore.getItemAsync('access_token');
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    Alert.alert('Tokens', `Access: ${accessToken ? 'Found' : 'None'}\nRefresh: ${refreshToken ? 'Found' : 'None'}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Reset</Text>
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset Onboarding</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testSessionReplaced}>
        <Text style={styles.buttonText}>Test Session Replaced</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.testButton]} onPress={testSessionExpired}>
        <Text style={styles.buttonText}>Test Session Expired</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={testTokens}>
        <Text style={styles.buttonText}>Check Tokens</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 40,
  },
  button: {
    backgroundColor: COLORS.teal,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#ff6b6b',
  },
  infoButton: {
    backgroundColor: '#4ecdc4',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
});