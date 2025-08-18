import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TermsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bantuan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.pageTitle}>Syarat dan Ketentuan</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>A. Ketentuan Umum</Text>
            <Text style={styles.sectionNumber}>1. Pengguna:</Text>
            <Text style={styles.sectionText}>
              Dengan menggunakan aplikasi Splitr by BNI ("Aplikasi"), kamu dianggap telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan ini.
            </Text>
            
            <Text style={styles.sectionNumber}>2. Perubahan:</Text>
            <Text style={styles.sectionText}>
              BNI berhak mengubah Syarat & Ketentuan ini setiap saat. Perubahan akan diumumkan melalui Aplikasi atau media resmi BNI. Penggunaan lebih lanjut dianggap sebagai persetujuan atas ketentuan baru.
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
              Proses pendaftaran mencakup verifikasi identitas, pembuatan PIN, dan pengisian data pribadi. Pastikan semua informasi benar dan terbaru.
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
              Fitur memungkinkan membagi pembayaran (tagihan, pembelian, dsb.) menjadi beberapa bagian sesuai kebutuhan pengguna.
            </Text>
            
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              Pengguna bisa bikin jadwal atau reminder pembayaran: tiap tanggal tertentu, jumlah tertentu, atau frekuensi tertentu (misalnya, bulanan).
            </Text>
            
            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionText}>
              Semua instruksi split dijalankan otomatis oleh Aplikasi sesuai jadwal.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>D. Biaya & Limit</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Penggunaan fitur gratis, kecuali disebutkan biaya tertentu (jika ada).
            </Text>
            
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              Bank dapat mengenakan biaya tambahan sesuai jenis transaksi—dengan ketentuan jelas yang diberitahukan sebelumnya.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>E. Tanggung Jawab & Risiko</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Pengguna bertanggung jawab memastikan saldo cukup sebelum jadwal pembayaran.
            </Text>
            
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              Keterlambatan atau kegagalan pembayaran karena saldo tidak mencukupi atau faktor teknis, jadi tanggung jawab pengguna.
            </Text>
            
            <Text style={styles.sectionNumber}>3.</Text>
            <Text style={styles.sectionText}>
              BNI tidak bertanggung jawab atas kerugian akibat kegagalan sistem di luar kendali bank.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>F. Penghentian Layanan</Text>
            <Text style={styles.sectionNumber}>1.</Text>
            <Text style={styles.sectionText}>
              Pengguna dapat menghentikan jadwal split kapan saja melalui aplikasi.
            </Text>
            
            <Text style={styles.sectionNumber}>2.</Text>
            <Text style={styles.sectionText}>
              BNI dapat menghentikan atau menangguhkan akses fitur jika ditemukan pelanggaran hukum, atau keamanan.
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF7A00',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  contentContainer: {
    padding: 25,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 25,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  sectionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 5,
  },
  bottomSpacing: {
    height: 30,
  },
});

export default TermsScreen;