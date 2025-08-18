import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, PlusJakartaSans_400Regular, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const handleLogin = () => {
    router.replace('/(tabs)/home');
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <ScrollView 
          bounces={false} 
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/images/splitr.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.title}>Masuk</Text>

            {/* Username Field */}
            <View style={styles.inputGroup}>
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

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor={COLORS.placeholder}
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Links */}
            <View style={styles.linksContainer}>
              <View style={styles.registerLink}>
                <Text style={styles.linkText}>Belum memiliki akun? </Text>
                <Link href="/(auth)/register">
                  <Text style={styles.blueLink}>Registrasi</Text>
                </Link>
              </View>
              <Link href="/(auth)/forgot-password">
                <Text style={styles.blueLink}>Lupa password?</Text>
              </Link>
            </View>

            {/* Login Button */}
            <Pressable 
              onPress={handleLogin} 
              style={({ pressed }) => [
                styles.loginButton, 
                pressed && { opacity: 0.9 }
              ]}
            >
              <Text style={styles.loginButtonText}>Masuk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  logoSection: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 60,
    backgroundColor: COLORS.background,
  },

  logoImage: {
    width: 250,
    height: 100,
  },

  formSection: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  title: {
    fontSize: 40,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },

  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },

  linksContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  registerLink: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  linkText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },

  blueLink: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.orange,
  },

  loginButton: {
    backgroundColor: COLORS.tosca,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 20,
  },

  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
});
