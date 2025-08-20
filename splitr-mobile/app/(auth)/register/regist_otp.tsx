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
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { FONTS, COLORS as THEME_COLORS } from "../../../constants/theme";

const COLORS = {
  primary: THEME_COLORS.backgroundMain,
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

  const otpString = otp.join("");
  const isComplete = otpString.length === 6;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Registrasi</Text>
            <Stepper current={3} />
          </View>

          <ScrollView 
            style={styles.panel}
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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

            <View style={styles.resendContainer}>
              <Text style={{ color: COLORS.muted }}>Tidak menerima kode? </Text>
              <Pressable onPress={() => {}}>
                <Text style={{ color: "#DC2626", fontWeight: "600" }}>
                  Kirim Ulang
                </Text>
              </Pressable>
            </View>

            <Pressable 
              onPress={handleNext} 
              style={[styles.primaryBtn, !isComplete && styles.primaryBtnDisabled]}
              disabled={!isComplete}
            >
              <Text style={[styles.primaryBtnText, !isComplete && styles.primaryBtnTextDisabled]}>Verifikasi Kode OTP</Text>
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.stepInactive,
    alignItems: "center",
    justifyContent: "center",
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
  },
  headline: { fontSize: 22, fontFamily: FONTS.extraBold, color: "#0F172A", marginBottom: 4 },
  subtitle: { color: "#374151", marginBottom: 18 },
  otpRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  otpBox: {
    width: 48, height: 56, borderRadius: 10, borderWidth: 1, borderColor: COLORS.line,
    textAlign: "center", fontSize: 20, fontFamily: FONTS.bold, backgroundColor: COLORS.inputBg,
  },

  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: THEME_COLORS.teal,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 14, color: "#EF4444", textAlign: "center", marginTop: 20, fontFamily: FONTS.semiBold,
  },
  primaryBtnText: { fontSize: 16, fontFamily: FONTS.extraBold, color: "#FFFFFF" },
  primaryBtnDisabled: { backgroundColor: "#D1D5DB" },
  primaryBtnTextDisabled: { color: "#9CA3AF" },
});
