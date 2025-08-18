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

/** Stepper: setiap step punya slot; circle di tengah; konektor = garis (width tetap) */
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

export default function RegisterEmail() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (value: string) => {
    if (value.length === 0) return "";
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    return gmailRegex.test(value) ? "" : "Format email salah";
  };

  const handleNext = () => {
    if (!email) {
      setError("Masukkan email");
      return;
    }
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    router.push("/(auth)/register/regist_otp");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Registrasi</Text>
          <Stepper current={2} />
        </View>

        <View style={styles.panel}>
          <View style={{ gap: 14 }}>
            <Text style={styles.label}>Masukan Email anda</Text>
            <TextInput
              placeholder="email"
              placeholderTextColor={COLORS.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                const lowerEmail = text.toLowerCase();
                setEmail(lowerEmail);
                setError(validateEmail(lowerEmail));
              }}
              style={[styles.input, error && styles.inputError]}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>



          <Pressable onPress={handleNext} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Kirim OTP</Text>
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
    width: 12,                 // panjang garis tetap
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
    height: 44,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
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
