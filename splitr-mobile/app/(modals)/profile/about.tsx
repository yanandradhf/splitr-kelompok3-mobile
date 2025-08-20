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

const AboutScreen = () => {
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
            <Text style={styles.headerTitle}>Tentang Splitr</Text>
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
                Splitr adalah aplikasi pembagi tagihan yang memudahkan Anda
                untuk:
              </Text>

              <View style={styles.featureList}>
                <Text style={styles.bulletPoint}>
                  • Membagi biaya bersama teman, keluarga, atau rekan kerja
                  secara instan.
                </Text>
                <Text style={styles.bulletPoint}>
                  • Mengelola pembayaran secara transparan.
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Fitur Utama:</Text>

              <View style={styles.featureSection}>
                <View style={styles.featureItem}>
                  <Ionicons name="scan" size={20} color={COLORS.teal} />
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Scan Struk Otomatis</Text>
                    <Text style={styles.featureDesc}>
                      Ambil foto struk, sistem akan membaca dan membagi secara
                      otomatis.
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="people" size={20} color={COLORS.teal} />
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Kelola Grup</Text>
                    <Text style={styles.featureDesc}>
                      Buat grup untuk acara, liburan, atau kebutuhan rutin.
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="card" size={20} color={COLORS.teal} />
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>
                      Metode Pembayaran Fleksibel
                    </Text>
                    <Text style={styles.featureDesc}>
                      Pilih bayar sekarang atau nanti.
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Ionicons name="analytics" size={20} color={COLORS.teal} />
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>Riwayat Transaksi</Text>
                    <Text style={styles.featureDesc}>
                      Pantau semua tagihan dengan mudah.
                    </Text>
                  </View>
                </View>
              </View>
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
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 15,
  },
  featureList: {
    marginBottom: 25,
  },
  bulletPoint: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  featureSection: {
    gap: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 5,
  },
  featureContent: {
    flex: 1,
    marginLeft: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  featureDesc: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default AboutScreen;
