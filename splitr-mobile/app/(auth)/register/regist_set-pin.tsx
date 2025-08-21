import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { FONTS, COLORS as THEME_COLORS } from "../../../constants/theme";
import { useRegisterStore } from "../../../store/register.store";

const COLORS = {
  primary: THEME_COLORS.backgroundMain,
  text: "#111827",
  muted: "#6B7280",
  stepInactive: "#D1D5DB",
  boxBg: "#FFFFFF",
  boxBorder: "#E5E7EB",
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
              s - 1 < current &&
                idx !== 0 && { backgroundColor: THEME_COLORS.teal },
            ]}
          />
          <View
            style={[
              styles.stepCircle,
              s <= current && { backgroundColor: THEME_COLORS.teal },
            ]}
          >
            <Text
              style={[styles.stepLabel, s <= current && { color: "#FFFFFF" }]}
            >
              {s}
            </Text>
          </View>
          <View
            style={[
              styles.halfLine,
              idx === steps.length - 1 && styles.invisible,
              s < current &&
                idx !== steps.length - 1 && {
                  backgroundColor: THEME_COLORS.teal,
                },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export default function RegisterSetPin() {
  const [pin, setPin] = useState<string>("");
  const [error, setError] = useState("");

  const { completeRegister, isLoading, setStep5Data } = useRegisterStore();

  useEffect(() => {
    Keyboard.dismiss();
  }, []);

  const pressDigit = (d: string) => {
    if (pin.length < 6 && /^[0-9]$/.test(d)) {
      setPin((p) => p + d);
      setError("");
    }
  };
  const backspace = () => {
    setPin((p) => p.slice(0, -1));
    setError("");
  };

  const handleRegister = async () => {
    if (pin.length !== 6) {
      setError("Masukkan PIN 6 digit");
      return;
    }

    try {
      setStep5Data({ pin });
      await completeRegister();
      router.replace("/(auth)/register/success");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const numbers = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "⌫"],
  ];

  const isComplete = pin.length === 6;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Registrasi</Text>
            <Stepper current={5} />
          </View>

          <ScrollView
            style={styles.panel}
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.headline}>Buat Pin Baru</Text>

            <View style={styles.pinRow}>
              {Array.from({ length: 6 }).map((_, i) => {
                const filled = Boolean(pin[i]);
                return (
                  <View
                    key={i}
                    style={[
                      styles.pinBox,
                      filled && { borderColor: THEME_COLORS.inputBorder },
                    ]}
                  >
                    <Text style={styles.pinDot}>{filled ? "•" : " "}</Text>
                  </View>
                );
              })}
            </View>

            <View style={{ marginTop: 10 }}>
              {numbers.map((row, idx) => (
                <View key={idx} style={styles.keyRow}>
                  {row.map((n, index) => {
                    if (n === "")
                      return <View key={`empty-${index}`} style={styles.key} />;
                    const isBack = n === "⌫";
                    return (
                      <Pressable
                        key={n}
                        onPress={() => (isBack ? backspace() : pressDigit(n))}
                        style={styles.key}
                      >
                        <Text
                          style={[
                            styles.keyText,
                            isBack && { color: THEME_COLORS.teal },
                          ]}
                        >
                          {n}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable
              onPress={handleRegister}
              style={[
                styles.primaryBtn,
                (!isComplete || isLoading) && styles.primaryBtnDisabled,
              ]}
              disabled={!isComplete || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.primaryBtnText,
                    (!isComplete || isLoading) && styles.primaryBtnTextDisabled,
                  ]}
                >
                  Daftar
                </Text>
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
    shadowColor: "#000",
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
  headline: {
    fontSize: 20,
    fontFamily: FONTS.extraBold,
    color: "#0F172A",
    marginBottom: 16,
    textAlign: "center",
  },
  pinRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  pinBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.boxBg,
  },
  pinDot: {
    fontSize: 28,
    fontFamily: FONTS.extraBold,
    color: "#111827",
    textAlign: "center",
    lineHeight: 40,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  key: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 50,
    backgroundColor: "#F3F4F6",
    height: 60,
    width: 60,
  },
  keyText: { fontSize: 24, fontFamily: FONTS.bold, color: "#111827" },

  primaryBtn: {
    backgroundColor: THEME_COLORS.teal,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 40,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: "center",
    marginTop: 20,
    fontFamily: FONTS.semiBold,
  },
  primaryBtnText: {
    fontSize: 18,
    fontFamily: FONTS.extraBold,
    color: "#FFFFFF",
  },
  primaryBtnDisabled: { backgroundColor: "#D1D5DB", opacity: 1 },
  primaryBtnTextDisabled: { color: "#9CA3AF" },
});
