// app/(auth)/login.tsx
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Screen from '../../components/layout/Screen';

const COLORS = {
  white: '#FFFFFF',
  primary: '#ffffffff',    // oranye panel
  title: '#1A1A1A',
  label: '#1F2937',
  inputBg: '#F2F4F7',
  inputBorder: '#E5E7EB',
  placeholder: '#9AA0A6',
  teal: '#7ADFD6',       // tombol "Masuk"
  tealText: '#FFFFFF',
  link: '#458af8ff',
  subtle: '#6B7280',
};

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <Screen style={{ padding: 0, backgroundColor: COLORS.white }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView bounces={false} contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header putih dengan LOGO gambar saja */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/logo-splitr.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Panel oranye */}
          <View style={styles.orangePanel}>
            <Text style={styles.title}>Masuk</Text>

            {/* Username */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Password */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry
                style={styles.input}
              />
            </View>

            {/* Link registrasi & lupa password */}
            <View style={styles.linksWrap}>
              <Text style={styles.subtle}>Belum memiliki akun? </Text>
              <Link href="/(auth)/register" style={styles.link}>Registrasi</Link>
            </View>
            <View style={{ alignItems: 'center', marginTop: 4 }}>
              <Link href="/(auth)/forgot-password" style={styles.link}>Lupa password?</Link>
            </View>

            {/* Tombol Masuk */}
            <Pressable onPress={handleLogin} style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}>
              <Text style={styles.buttonText}>Masuk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 76,
    paddingBottom: 60,
    alignItems: 'center',
  },
  logoImage: {
    width:320,   // perbesar agar seperti mockup
    height: 96,
  },

  orangePanel: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 54,        // lebih besar supaya konten mulai dari tengah ke bawah
    paddingBottom: 28,
  },

  title: {
    textAlign: 'center',
    color: COLORS.title,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },

  label: {
    color: COLORS.label,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 14,
    color: COLORS.title,
  },

  linksWrap: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: { color: COLORS.link, fontWeight: '400' },
  subtle: { color: COLORS.subtle, fontSize: 12, fontWeight: '400' },

  button: {
    position: 'absolute',
    bottom: 55,
    left: 20,
    right: 20,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.tealText,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
  },
});
