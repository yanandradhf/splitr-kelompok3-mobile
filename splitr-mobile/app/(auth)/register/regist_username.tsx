import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { FONTS, COLORS as THEME_COLORS } from "../../../constants/theme";

const COLORS = {
  primary: "#B2DBD7",
  text: "#111827",
  muted: "#6B7280",
  inputBg: "#EEF1F5",
  line: "#E5E7EB",
  stepInactive: "#D1D5DB",
};

function Stepper({ current }: { current: number }) {
  const steps = [1, 2, 3, 4, 5];
  return (
    <View style={styles.stepper}>
      {steps.map((s, idx) => (
        <View key={s} style={styles.stepSlot}>
          <View
            style={[
              styles.halfLine,
              idx === 0 && styles.invisible,
              s - 1 < current && idx !== 0 && { backgroundColor: THEME_COLORS.teal },
            ]}
          />
          <View
            style={[
              styles.stepCircle,
              s <= current && { backgroundColor: THEME_COLORS.teal },
            ]}
          >
            <Text
              style={[
                styles.stepLabel,
                s <= current && { color: "#FFFFFF" },
              ]}
            >
              {s}
            </Text>
          </View>
          <View
            style={[
              styles.halfLine,
              idx === steps.length - 1 && styles.invisible,
              s < current && idx !== steps.length - 1 && { backgroundColor: THEME_COLORS.teal },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export default function RegisterUsername() {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({ username: "", pwd: "", confirm: "" });

  const validateUsername = (value: string) => {
    if (value.length === 0) return "";
    if (value.length < 3) return "Username minimal 3 karakter";
    return "";
  };
  const validatePassword = (value: string) => {
    if (value.length === 0) return "";
    if (value.length < 8) return "Password minimal 8 karakter";
    return "";
  };
  const validateConfirm = (value: string) => {
    if (value.length === 0) return "";
    if (value !== pwd) return "Password tidak sama";
    return "";
  };

  const isUsernameValid = username.length >= 3 && !validateUsername(username);
  const isPwdValid = pwd.length >= 8 && !validatePassword(pwd);

  const handleNext = () => {
    const newErrors = { username: "", pwd: "", confirm: "" };
    
    if (!username) newErrors.username = "Masukkan username";
    else if (username.length < 3) newErrors.username = "Username minimal 3 karakter";
    
    if (!pwd) newErrors.pwd = "Masukkan password";
    else if (pwd.length < 8) newErrors.pwd = "Password minimal 8 karakter";
    
    if (!confirm) newErrors.confirm = "Masukkan konfirmasi password";
    else if (confirm !== pwd) newErrors.confirm = "Password tidak sama";
    
    setErrors(newErrors);
    
    if (!newErrors.username && !newErrors.pwd && !newErrors.confirm) {
      router.push("/(auth)/register/regist_set-pin");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Registrasi</Text>
            <Stepper current={4} />
          </View>

          <ScrollView 
            style={styles.panel}
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <View style={{ gap: 14 }}>
            <Text style={styles.label}>Buat Username Baru</Text>
            <TextInput
              placeholder="username"
              placeholderTextColor={COLORS.muted}
              autoCapitalize="none"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setErrors((prev) => ({
                  ...prev,
                  username: validateUsername(text),
                }));
              }}
              style={[styles.input, errors.username && styles.inputError]}
            />
            {errors.username ? (
              <Text style={styles.errorText}>{errors.username}</Text>
            ) : null}

            <Text style={styles.label}>Buat Password Baru</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="password baru"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showPwd}
                value={pwd}
                onChangeText={(text) => {
                  setPwd(text);
                  setErrors((prev) => ({
                    ...prev,
                    pwd: validatePassword(text),
                    confirm: text === confirm ? "" : "Password tidak sama",
                  }));
                }}
                style={[styles.passwordInput, errors.pwd && styles.inputError]}
                passwordRules=""
                textContentType="none"
                autoComplete="off"
                autoCorrect={false}
                spellCheck={false}
              />
              <TouchableOpacity 
                onPress={() => setShowPwd(!showPwd)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPwd ? "eye-off" : "eye"} 
                  size={20} 
                  color={COLORS.muted} 
                />
              </TouchableOpacity>
            </View>
            {errors.pwd ? <Text style={styles.errorText}>{errors.pwd}</Text> : null}

            <Text style={styles.label}>Masukkan Konfirmasi Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="konfirmasi password"
                placeholderTextColor={COLORS.muted}
                secureTextEntry={!showConfirm}
                value={confirm}
                onChangeText={(text) => {
                  setConfirm(text);
                  setErrors((prev) => ({
                    ...prev,
                    confirm: text === pwd ? "" : "Password tidak sama",
                  }));
                }}
                style={[styles.passwordInput, errors.confirm && styles.inputError]}
                passwordRules=""
                textContentType="none"
                autoComplete="off"
                autoCorrect={false}
                spellCheck={false}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirm(!showConfirm)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showConfirm ? "eye-off" : "eye"} 
                  size={20} 
                  color={COLORS.muted} 
                />
              </TouchableOpacity>
            </View>
            {errors.confirm ? (
              <Text style={styles.errorText}>{errors.confirm}</Text>
            ) : null}
          </View>



            <Pressable 
              onPress={handleNext} 
              style={[styles.primaryBtn, (!username || !pwd || !confirm) && styles.primaryBtnDisabled]}
              disabled={!username || !pwd || !confirm}
            >
              <Text style={[styles.primaryBtnText, (!username || !pwd || !confirm) && styles.primaryBtnTextDisabled]}>Konfirmasi</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 70, paddingHorizontal: 20 },
  title: {
    fontSize: 32,
    fontFamily: FONTS.extraBold,
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 28,
  },

  /** stepper centered + garis */
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  stepSlot: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  halfLine: {
    width: 12,
    height: 4,
    backgroundColor: COLORS.stepInactive,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  invisible: { opacity: 0 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.stepInactive,
    alignItems: "center", justifyContent: "center",
  },
  stepLabel: { fontFamily: FONTS.bold, color: "#374151" },

  panel: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -50,
  },
  panelContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 200,
    gap: 8,
  },
  label: { fontSize: 14, color: COLORS.text, fontFamily: FONTS.semiBold },
  input: {
    height: 44, backgroundColor: COLORS.inputBg, borderRadius: 10,
    paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.line,
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 44, 
    backgroundColor: COLORS.inputBg, 
    borderRadius: 10,
    paddingHorizontal: 14, 
    paddingRight: 50,
    borderWidth: 1, 
    borderColor: COLORS.line,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    padding: 4,
  },
  primaryBtn: {
    backgroundColor: THEME_COLORS.teal,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },

  primaryBtnText: { fontSize: 18, fontFamily: FONTS.extraBold, color: "#FFFFFF" },
  primaryBtnDisabled: { backgroundColor: "#D1D5DB" },
  primaryBtnTextDisabled: { color: "#9CA3AF" },
  inputError: { borderColor: "#EF4444", borderWidth: 2 },
  errorText: { fontSize: 12, color: "#EF4444", marginTop: 4 },
});
