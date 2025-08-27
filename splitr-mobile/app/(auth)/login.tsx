import { useState } from "react";
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
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Link, router } from "expo-router";
import { Alert } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
} from "../../constants/theme";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Username dan password harus diisi");
      return;
    }
    await login(username, password);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.select({ ios: "padding", android: "height" })}
        >
        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require("../../assets/images/splitr.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Form Section */}
            <View style={styles.formSection}>
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
                    name={showPassword ? "eye-off" : "eye"}
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
                <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.blueLink}>Registrasi</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => router.push('/forgot-password/forgot-password')}>
                <Text style={styles.blueLink}>Lupa password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading || !username.trim() || !password.trim()}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && { opacity: 0.9 },
                (isLoading || !username.trim() || !password.trim()) && styles.loginButtonDisabled,
              ]}
            >
              <Text style={[
                styles.loginButtonText,
                (isLoading || !username.trim() || !password.trim()) && styles.loginButtonTextDisabled,
              ]}>
                {isLoading ? "Login..." : "Login"}
              </Text>
            </Pressable>

            {/* Debug Reset - Development Only */}
            {__DEV__ && (
              <TouchableOpacity 
                style={styles.debugLink}
                onPress={() => router.push('/debug-reset')}
              >
                <Text style={styles.debugText}>🔧 Reset Onboarding (Dev)</Text>
              </TouchableOpacity>
            )}
            </View>
          </ScrollView>
        </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      {isLoading && <LoadingScreen />}
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

  logoSection: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 60,
  },

  logoImage: {
    width: 250,
    height: 100,
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

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },

  formSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  title: {
    fontSize: 40,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
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
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
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
    position: "absolute",
    right: 16,
    padding: 4,
  },

  linksContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },

  registerLink: {
    flexDirection: "row",
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
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
  },

  loginButtonDisabled: {
    backgroundColor: COLORS.gray,
  },

  loginButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },

  loginButtonTextDisabled: {
    color: COLORS.textSecondary,
  },

  debugLink: {
    alignItems: 'center',
    marginTop: 20,
    padding: 10,
  },

  debugText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});
