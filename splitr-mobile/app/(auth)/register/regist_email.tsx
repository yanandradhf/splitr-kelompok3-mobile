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
  ActivityIndicator,
  Alert,
} from "react-native";
import { FONTS, COLORS as THEME_COLORS } from "../../../constants/theme";
import { useRegisterStore } from "../../../store/register.store";

const COLORS = {
  primary: THEME_COLORS.backgroundMain,
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

export default function RegisterEmail() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  
  const { sendOtp, isLoading, setStep2Data } = useRegisterStore();

  const validateEmail = (value: string) => {
    if (value.length === 0) return "";
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    return gmailRegex.test(value) ? "" : "Format email salah";
  };

  const handleNext = async () => {
    if (!email) {
      setError("Masukkan email");
      return;
    }
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    try {
      await sendOtp(email);
      setStep2Data({ email });
      router.push("/(auth)/register/regist_otp");
    } catch (error: any) {
      Alert.alert("Error", error.message);
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
            <Stepper current={2} />
          </View>

          <ScrollView 
            style={styles.panel}
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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



            <Pressable 
              onPress={handleNext} 
              style={[styles.primaryBtn, (!email || isLoading) && styles.primaryBtnDisabled]}
              disabled={!email || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.primaryBtnText, (!email || isLoading) && styles.primaryBtnTextDisabled]}>Kirim OTP</Text>
              )}
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
    height: 44,
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.line,
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
  errorText: { fontSize: 12, color: "#EF4444", marginTop: 4, fontFamily: FONTS.medium },
});
