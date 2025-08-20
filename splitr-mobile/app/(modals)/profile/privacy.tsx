import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../constants/theme";

const PrivacyScreen = () => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={COLORS.backgroundMain}
          barStyle="dark-content"
        />

        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Pemberitahuan Privasi</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              <Text style={styles.description}>
                Selamat datang di halaman Pemberitahuan Privasi kami. Kami ingin
                memberikan kejelasan dan keyakinan kepada Pengguna tentang
                bagaimana kami mengumpulkan, menggunakan, dan melindungi
                Informasi dan Data Pribadi Pengguna. Dengan membaca
                Pemberitahuan Privasi ini, diharapkan Pengguna merasa tenang dan
                yakin bahwa keamanan Data Pribadi dan privasi Pengguna adalah
                prioritas utama bagi kami.
              </Text>
            </View>
          </ScrollView>
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
  purpleSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: 34,
  },
  whiteModalContainer: {
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  contentContainer: {
    padding: 25,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 25,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 26,
    textAlign: "justify",
  },
});

export default PrivacyScreen;
