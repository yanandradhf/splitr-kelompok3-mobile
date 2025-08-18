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
} from "react-native";

const COLORS = {
  primary: "#ff9a56ff",
  accent: "#73E0D1",
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
              s - 1 < current && idx !== 0 && { backgroundColor: COLORS.accent },
            ]}
          />
          <View
            style={[
              styles.stepCircle,
              s <= current && { backgroundColor: COLORS.accent },
            ]}
          >
            <Text
              style={[
                styles.stepLabel,
                s <= current && { color: "#0F172A" },
              ]}
            >
              {s}
            </Text>
          </View>
          <View
            style={[
              styles.halfLine,
              idx === steps.length - 1 && styles.invisible,
              s < current && idx !== steps.length - 1 && { backgroundColor: COLORS.accent },
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
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Registrasi</Text>
          <Stepper current={4} />
        </View>

        <View style={styles.panel}>
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
            <TextInput
              placeholder="password baru"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
              value={pwd}
              onChangeText={(text) => {
                setPwd(text);
                setErrors((prev) => ({
                  ...prev,
                  pwd: validatePassword(text),
                  confirm: text === confirm ? "" : "Password tidak sama",
                }));
              }}
              editable={isUsernameValid}
              style={[styles.input, errors.pwd && styles.inputError]}
            />
            {errors.pwd ? <Text style={styles.errorText}>{errors.pwd}</Text> : null}

            <Text style={styles.label}>Masukkan Konfirmasi Password</Text>
            <TextInput
              placeholder="konfirmasi password"
              placeholderTextColor={COLORS.muted}
              secureTextEntry
              value={confirm}
              onChangeText={(text) => {
                setConfirm(text);
                setErrors((prev) => ({
                  ...prev,
                  confirm: text === pwd ? "" : "Password tidak sama",
                }));
              }}
              editable={isUsernameValid && isPwdValid}
              style={[styles.input, errors.confirm && styles.inputError]}
            />
            {errors.confirm ? (
              <Text style={styles.errorText}>{errors.confirm}</Text>
            ) : null}
          </View>



          <Pressable onPress={handleNext} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Konfirmasi</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 70, paddingHorizontal: 20 },
  title: {
    fontSize: 32,
    fontWeight: "800",
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
  stepLabel: { fontWeight: "700", color: "#374151" },

  panel: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 36,
    gap: 8,
  },
  label: { fontSize: 14, color: COLORS.text, fontWeight: "600" },
  input: {
    height: 44, backgroundColor: COLORS.inputBg, borderRadius: 10,
    paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.line,
  },
  primaryBtn: {
    position: "absolute",
    bottom: 55,
    left: 20,
    right: 20,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  primaryBtnText: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  inputError: { borderColor: "#EF4444", borderWidth: 2 },
  errorText: { fontSize: 12, color: "#EF4444", marginTop: 4 },
});
