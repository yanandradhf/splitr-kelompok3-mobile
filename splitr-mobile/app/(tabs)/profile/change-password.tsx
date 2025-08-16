import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type PasswordStep = 'current' | 'new' | 'success';

const ChangePasswordScreen = () => {
  const [step, setStep] = useState<PasswordStep>('current');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleNext = () => {
    if (step === 'current') {
      // TODO: Validate current password
      setStep('new');
    } else if (step === 'new') {
      if (newPassword === confirmPassword && newPassword.length >= 6) {
        setStep('success');
      } else {
        alert('Password tidak cocok atau terlalu pendek');
      }
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'current': return 'Masukkan password saat ini';
      case 'new': return 'Masukkan password Baru';
      case 'success': return 'SELESAI!';
    }
  };

  const getSubtitle = () => {
    switch (step) {
      case 'current': return 'Masukkan password saat ini';
      case 'new': return 'Masukkan password baru';
      case 'success': return 'Password Berhasil Diubah';
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 'current': return 'Done';
      case 'new': return 'Ubah Password';
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

        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>SELESAI!</Text>
          <Text style={styles.successSubtitle}>Password Berhasil Diubah</Text>
          
          <View style={styles.successIcon}>
            <View style={styles.checkmarkOuter}>
              <View style={styles.checkmarkInner}>
                <Ionicons name="checkmark" size={40} color="#6EDCD9" />
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Selesai</Text>
          </TouchableOpacity>
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

      <View style={styles.content}>
        <Text style={styles.title}>{getTitle()}</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>{getSubtitle()}</Text>
          
          {step === 'current' && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="password saat ini"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          )}

          {step === 'new' && (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="password baru"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons 
                    name={showNewPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.confirmLabel}>Konfirmasi password baru</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="konfirmasi password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#999" 
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity 
            style={[
              styles.nextButton,
              (step === 'current' && currentPassword.length < 6) ||
              (step === 'new' && (newPassword.length < 6 || confirmPassword.length < 6)) 
                ? styles.nextButtonDisabled : {}
            ]}
            onPress={handleNext}
            disabled={
              (step === 'current' && currentPassword.length < 6) ||
              (step === 'new' && (newPassword.length < 6 || confirmPassword.length < 6))
            }
          >
            <Text style={styles.nextButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: '#FF7A00',
    borderRadius: 25,
    padding: 30,
    marginHorizontal: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 30,
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: '#000',
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  confirmLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 10,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#6EDCD9',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 30,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#000',
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
  doneButton: {
    backgroundColor: '#6EDCD9',
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 15,
    width: '70%',
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ChangePasswordScreen;