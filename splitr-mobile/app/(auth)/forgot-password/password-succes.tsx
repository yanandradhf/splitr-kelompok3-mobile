import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS, FONTS } from "../../../constants/theme";

export default function PasswordSuccessScreen() {
  const handleContinue = () => {
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={COLORS.backgroundMain}
          barStyle="dark-content"
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.placeholder} />

          <View style={styles.placeholder} />
        </View>

        {/* White Panel */}
        <View style={styles.panel}>
          <View style={styles.panelContent}>
            <Text style={styles.subtitle}>Password Berhasil Diubah</Text>

            <View style={styles.successIcon}>
              <View style={styles.checkmarkOuter}>
                <View style={styles.checkmarkInner}>
                  <Ionicons name="checkmark" size={40} color={COLORS.white} />
                </View>
              </View>
            </View>

            <Text style={styles.description}>
              Password Anda telah berhasil diubah. Sekarang Anda dapat
              menggunakan password baru untuk masuk ke akun Anda.
            </Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                Lanjutkan ke Aplikasi
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
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
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 40,
  },
  successIcon: {
    marginBottom: 40,
  },
  checkmarkOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(0, 137, 123, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.teal,
    justifyContent: "center",
    alignItems: "center",
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: COLORS.teal,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});
