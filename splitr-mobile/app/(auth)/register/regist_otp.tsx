import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
  inputBg: "#FFFFFF",
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

export default function RegisterOTP() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<Array<TextInput | null>>([]);
  const [error, setError] = useState("");

  const setDigit = (val: string, idx: number) => {
    const v = val.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[idx] = v;
    setOtp(next);
    setError("");
    if (v && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleNext = () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setError("Masukkan kode OTP lengkap");
      return;
    }
    
    router.push("/(auth)/register/regist_username");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Registrasi</Text>
          <Stepper current={3} />
        </View>

        <View style={styles.panel}>
          <Text style={styles.headline}>Masukkan Kode OTP</Text>
          <Text style={styles.subtitle}>
            Kami telah mengirimkan kode verifikasi ke email Anda. Masukkan kode
            tersebut untuk mengaktifkan akun.
          </Text>

          <View style={styles.otpRow}>
            {otp.map((d, i) => (
              <TextInput
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                style={styles.otpBox}
                keyboardType="number-pad"
                value={d}
                onChangeText={(t) => setDigit(t, i)}
                maxLength={1}
                returnKeyType="next"
              />
            ))}
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <Pressable onPress={handleNext} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Verifikasi Kode OTP</Text>
          </Pressable>

          <View style={styles.resendContainer}>
            <Text style={{ color: COLORS.muted }}>Tidak menerima kode? </Text>
            <Pressable onPress={() => {}}>
              <Text style={{ color: "#DC2626", fontWeight: "600" }}>
                Kirim Ulang
              </Text>
            </Pressable>
          </View>
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.stepInactive,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontWeight: "700", color: "#374151" },

  panel: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  headline: { fontSize: 22, fontWeight: "800", color: "#0F172A", marginBottom: 4 },
  subtitle: { color: "#374151", marginBottom: 18 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  otpBox: {
    width: 48, height: 56, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line,
    textAlign: "center", fontSize: 20, fontWeight: "700", backgroundColor: COLORS.inputBg,
  },

  resendContainer: {
    position: "absolute",
    bottom: 115,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
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
  errorText: {
    fontSize: 14, color: "#EF4444", textAlign: "center", marginTop: 20, fontWeight: "600",
  },
  primaryBtnText: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  primaryBtnDisabled: { backgroundColor: "#D1D5DB" },
  primaryBtnTextDisabled: { color: "#9CA3AF" },
});
