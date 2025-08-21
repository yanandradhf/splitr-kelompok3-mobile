import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../constants/theme";
import { useRegisterStore } from "../../../store";

const RegisterSuccessScreen = () => {
  const { data, clearData } = useRegisterStore();

  const handleGoToLogin = () => {
    clearData(); // Clear registration data when going to login
    router.replace("/(auth)/login");
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={COLORS.backgroundMain}
          barStyle="light-content"
        />

        <View style={styles.backgroundSection}>
          <View style={styles.header}>
            <View style={styles.placeholder} />

            <View style={styles.placeholder} />
          </View>
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <View style={styles.checkmarkOuter}>
              <View style={styles.checkmarkInner}>
                <Ionicons name="checkmark" size={20} color={COLORS.white} />
              </View>
            </View>
          </View>
          <Text style={styles.successTitle}>Registrasi Berhasil!</Text>

          <View style={styles.userInfoContainer}>
            <Text style={styles.infoLabel}>Username:</Text>
            <Text style={styles.infoValue}>{data.username}</Text>

            <Text style={styles.infoLabel}>Nama:</Text>
            <Text style={styles.infoValue}>{data.namaRekening}</Text>

            <Text style={styles.infoLabel}>Nomor Rekening:</Text>
            <Text style={styles.infoValue}>{data.nomorRekening}</Text>

            <Text style={styles.infoLabel}>Nomor HP:</Text>
            <Text style={styles.infoValue}>{data.phone}</Text>
          </View>

          <Text style={styles.successSubtitle}>
            Silakan login dengan username dan password yang telah didaftarkan.
          </Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleGoToLogin}
          >
            <Text style={styles.loginButtonText}>Login Sekarang</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  backgroundSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  successContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    padding: 30,
    paddingTop: 40,
    alignItems: "center",
    flex: 1,
    marginBottom: -50,
    justifyContent: "flex-start",
  },
  successIcon: {
    marginBottom: 10,
  },
  checkmarkOuter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 137, 123, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 30,
  },
  userInfoContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    marginBottom: 30,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  successSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});

export default RegisterSuccessScreen;
