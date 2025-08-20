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

const TermsScreen = () => {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="dark-content" />

        {/* Background Section */}
        <View style={styles.backgroundSection}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Syarat dan Ketentuan</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>A. Ketentuan Umum</Text>
            <Text style={styles.sectionNumber}>1. Pengguna:</Text>
            <Text style={styles.sectionText}>
              Dengan menggunakan aplikasi Splitr by BNI ("Aplikasi"), kamu
              dianggap telah membaca, memahami, dan menyetujui seluruh Syarat &
              Ketentuan ini.
            </Text>

            <Text style={styles.sectionNumber}>2. Perubahan:</Text>
            <Text style={styles.sectionText}>
              BNI berhak mengubah Syarat & Ketentuan ini setiap saat. Perubahan
              akan diumumkan melalui Aplikasi atau media resmi BNI. Penggunaan
              lebih lanjut dianggap sebagai persetujuan atas ketentuan baru.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>B. Pendaftaran & Akun</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Pengguna perlu memiliki rekening BNI yang aktif.
            </Text>

            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              Proses pendaftaran mencakup verifikasi identitas, pembuatan PIN,
              dan pengisian data pribadi. Pastikan semua informasi benar dan
              terbaru.
            </Text>

            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionText}>
              Kerahasiaan akun dan PIN sepenuhnya tanggung jawab pengguna.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>C. Fitur Split Pembayaran</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Fitur memungkinkan membagi pembayaran (tagihan, pembelian, dsb.)
              menjadi beberapa bagian sesuai kebutuhan pengguna.
            </Text>

            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              Pengguna bisa bikin jadwal atau reminder pembayaran: tiap tanggal
              tertentu, jumlah tertentu, atau frekuensi tertentu (misalnya,
              bulanan).
            </Text>

            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionText}>
              Semua instruksi split dijalankan otomatis oleh Aplikasi sesuai
              jadwal.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>D. Biaya & Limit</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Penggunaan fitur gratis, kecuali disebutkan biaya tertentu (jika
              ada).
            </Text>

            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              Bank dapat mengenakan biaya tambahan sesuai jenis transaksi—dengan
              ketentuan jelas yang diberitahukan sebelumnya.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>E. Tanggung Jawab & Risiko</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Pengguna bertanggung jawab memastikan saldo cukup sebelum jadwal
              pembayaran.
            </Text>

            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              Keterlambatan atau kegagalan pembayaran karena saldo tidak
              mencukupi atau faktor teknis, jadi tanggung jawab pengguna.
            </Text>

            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionText}>
              BNI tidak bertanggung jawab atas kerugian akibat kegagalan sistem
              di luar kendali bank.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>F. Penghentian Layanan</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Pengguna dapat menghentikan jadwal split kapan saja melalui
              aplikasi.
            </Text>

            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              BNI dapat menghentikan atau menangguhkan akses fitur jika
              ditemukan pelanggaran hukum, atau keamanan.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>G. Privasi & Keamanan</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Data pengguna dilindungi sesuai kebijakan privasi BNI.
            </Text>
          </View>

          <View style={styles.bottomSpacing} />
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
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
    fontWeight: "bold",
    color: "#000",
    marginBottom: 25,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 15,
    marginTop: 5,
  },
  sectionNumber: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 24,
    textAlign: "justify",
    marginBottom: 12,
    paddingLeft: 8,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default TermsScreen;
