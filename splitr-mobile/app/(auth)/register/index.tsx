import { Link, router } from "expo-router";
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
} from "react-native";
import { COLORS as THEME_COLORS, FONTS } from "../../../constants/theme";

const COLORS = {
  primary: "rgb(237, 234, 252)", // violet background
  accent: "#73E0D1",    // teal button / step active
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
          {/* garis kiri (setengah) */}
          <View
            style={[
              styles.halfLine,
              idx === 0 && styles.invisible,                         // step pertama: tanpa garis kiri
              s - 1 < current && idx !== 0 && { backgroundColor: COLORS.accent },
            ]}
          />
          {/* lingkaran angka */}
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
          {/* garis kanan (setengah) */}
          <View
            style={[
              styles.halfLine,
              idx === steps.length - 1 && styles.invisible,          // step terakhir: tanpa garis kanan
              s < current && idx !== steps.length - 1 && { backgroundColor: COLORS.accent },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export default function RegisterStep1() {
  const [accNo, setAccNo] = useState("");
  const [accName, setAccName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({ accNo: "", accName: "", phone: "" });

  const validateAccNo = (value: string) => {
    if (value.length === 0) return "";
    if (value.length < 10) return "Nomor rekening tidak valid";
    return "";
  };

  const validateAccName = (value: string) => {
    if (value.length === 0) return "";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Nama hanya boleh berisi huruf";
    return "";
  };

  const validatePhone = (value: string) => {
    if (value.length === 0) return "";
    if (!/^[0-9]+$/.test(value)) return "Nomor HP hanya boleh berisi angka";
    return "";
  };

  const isAccNoValid = accNo.length === 10 && !validateAccNo(accNo);
  const isAccNameValid = accName.length > 0 && !validateAccName(accName);

  const handleNext = () => {
    const newErrors = { accNo: "", accName: "", phone: "" };
    
    if (!accNo) newErrors.accNo = "Masukkan nomor rekening";
    else if (accNo.length < 10) newErrors.accNo = "Nomor rekening tidak valid";
    
    if (!accName) newErrors.accName = "Masukkan nama rekening";
    else if (!/^[a-zA-Z\s]+$/.test(accName)) newErrors.accName = "Nama hanya boleh berisi huruf";
    
    if (!phone) newErrors.phone = "Masukkan nomor handphone";
    else if (!/^[0-9]+$/.test(phone)) newErrors.phone = "Nomor HP hanya boleh berisi angka";
    
    setErrors(newErrors);
    
    if (!newErrors.accNo && !newErrors.accName && !newErrors.phone) {
      router.push("/(auth)/register/regist_email");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.primary }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: "height" })}
          style={{ flex: 1 }}
        >
          {/* Header violet */}
          <View style={styles.header}>
            <Text style={styles.title}>Registrasi</Text>
            <Stepper current={1} />
          </View>

          {/* White panel */}
          <ScrollView 
            style={styles.panel}
            contentContainerStyle={styles.panelContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <View style={{ gap: 14 }}>
            <Text style={styles.label}>Masukan Nomor Rekening</Text>
            <TextInput
              placeholder="No Rekening"
              placeholderTextColor={COLORS.muted}
              keyboardType="number-pad"
              value={accNo}
              onChangeText={(text) => {
                if (text.length <= 10) {
                  setAccNo(text);
                  setErrors(prev => ({ ...prev, accNo: validateAccNo(text) }));
                }
              }}
              style={[styles.input, errors.accNo && styles.inputError]}
            />
            {errors.accNo ? <Text style={styles.errorText}>{errors.accNo}</Text> : null}

            <Text style={styles.label}>Masukan nama pemilik rekening</Text>
            <TextInput
              placeholder="Nama Rekening"
              placeholderTextColor={COLORS.muted}
              value={accName}
              onChangeText={(text) => {
                setAccName(text);
                setErrors(prev => ({ ...prev, accName: validateAccName(text) }));
              }}

              style={[styles.input, errors.accName && styles.inputError]}
            />
            {errors.accName ? <Text style={styles.errorText}>{errors.accName}</Text> : null}

            <Text style={styles.label}>Masukan Nomor Handphone</Text>
            <TextInput
              placeholder="Nomor Handphone"
              placeholderTextColor={COLORS.muted}
              keyboardType="number-pad"
              value={phone}
              onChangeText={(text) => {
                const numericText = text.replace(/[^0-9]/g, "");
                setPhone(numericText);
                setErrors(prev => ({ ...prev, phone: validatePhone(numericText) }));
              }}

              style={[styles.input, errors.phone && styles.inputError]}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

            <View style={styles.linkContainer}>
              <Text style={{ color: COLORS.muted, fontSize: 13 }}>
                Sudah memiliki akun?{" "}
              </Text>
              <Link href="/(auth)/login" style={{ color: "#73E0D1", fontSize: 13, fontFamily: FONTS.semiBold }}>
                Masuk
              </Link>
            </View>

            <Pressable 
              onPress={handleNext} 
              style={[styles.primaryBtn, (!accNo || !accName || !phone) && styles.primaryBtnDisabled]}
              disabled={!accNo || !accName || !phone}
            >
              <Text style={[styles.primaryBtnText, (!accNo || !accName || !phone) && styles.primaryBtnTextDisabled]}>Lanjut</Text>
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

  /*** STEPPER — centered + garis antar step (BUKAN titik) ***/
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  stepSlot: {
    flex: 1,                      // membagi header jadi 5 bagian sama
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",     // lingkaran berada di tengah slot
  },
  halfLine: {
    width: 12,                    // panjang garis antar step (tetap)
    height: 4,
    backgroundColor: COLORS.stepInactive,
    borderRadius: 2,
    marginHorizontal: 6,
  },
  invisible: { opacity: 0 },      // sembunyikan garis di ujung kiri/kanan
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.stepInactive,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontFamily: FONTS.bold, color: "#374151" },

  /*** PANEL ***/
  panel: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
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
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  primaryBtnText: { fontSize: 18, fontFamily: FONTS.extraBold, color: "#0F172A" },
  primaryBtnDisabled: { backgroundColor: "#D1D5DB" },
  primaryBtnTextDisabled: { color: "#9CA3AF" },
  inputError: { borderColor: "#EF4444", borderWidth: 2 },
  errorText: { fontSize: 12, color: "#EF4444", marginTop: 4, fontFamily: FONTS.medium },
});
