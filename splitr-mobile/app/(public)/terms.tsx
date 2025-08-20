import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';

export default function TermsScreen() {
  const [isAgreed, setIsAgreed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const progress = contentOffset.y / (contentSize.height - layoutMeasurement.height);
    setScrollProgress(Math.max(0, Math.min(1, progress)));
    
    // Real-time bottom detection with 5px tolerance
    const isBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 5;
    
    if (isBottom !== isAtBottom) {
      setIsAtBottom(isBottom);
      
      if (isBottom) {
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Reset checkbox when not at bottom
        setIsAgreed(false);
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  const handleCheckboxToggle = () => {
    setIsAgreed(!isAgreed);
  };

  const handleContinue = () => {
    if (isAtBottom && isAgreed) {
      router.push('/(auth)/login');
    }
  };

  const canProceed = isAtBottom && isAgreed;

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.backgroundSection}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Syarat & Ketentuan</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <View style={styles.whiteModalContainer}>
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>A. Ketentuan Umum</Text>
              <Text style={styles.sectionNumber}>1. Aplikasi:</Text>
              <Text style={styles.sectionText}>
                Dengan menggunakan aplikasi Splitr by BNI ("Aplikasi"), kamu dianggap telah membaca, memahami, dan menyetujui seluruh Syarat & Ketentuan ini.
              </Text>
              <Text style={styles.sectionNumber}>2. Kerjasama:</Text>
              <Text style={styles.sectionText}>
                Aplikasi ini merupakan hasil kerjasama antara BNI dengan pihak ketiga untuk memberikan layanan pembagian pembayaran yang mudah dan aman.
              </Text>
              <Text style={styles.sectionNumber}>3. Perubahan:</Text>
              <Text style={styles.sectionText}>
                BNI berhak mengubah Syarat & Ketentuan ini setiap saat. Perubahan akan diumumkan melalui Aplikasi atau media resmi BNI.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>B. Pendaftaran & Akun</Text>
              <Text style={styles.sectionNumber}>1. Persyaratan:</Text>
              <Text style={styles.sectionText}>
                Pengguna perlu memiliki rekening BNI yang aktif dan berusia minimal 17 tahun.
              </Text>
              <Text style={styles.sectionNumber}>2. Verifikasi Identitas:</Text>
              <Text style={styles.sectionText}>
                Proses pendaftaran mencakup verifikasi identitas, pembuatan PIN, dan pengisian data pribadi. Pastikan semua informasi benar dan terbaru.
              </Text>
              <Text style={styles.sectionNumber}>3. Keamanan Akun:</Text>
              <Text style={styles.sectionText}>
                Kerahasiaan akun dan PIN sepenuhnya tanggung jawab pengguna. Jangan bagikan informasi akun kepada siapapun.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>C. Fitur Split Pembayaran</Text>
              <Text style={styles.sectionNumber}>1. Penggunaan:</Text>
              <Text style={styles.sectionText}>
                Fitur memungkinkan membagi pembayaran (tagihan, pembelian, dsb.) menjadi beberapa bagian sesuai kebutuhan pengguna.
              </Text>
              <Text style={styles.sectionNumber}>2. Pembagian Biaya:</Text>
              <Text style={styles.sectionText}>
                Pengguna bisa membuat jadwal atau reminder pembayaran: tiap tanggal tertentu, jumlah tertentu, atau frekuensi tertentu (misalnya, bulanan).
              </Text>
              <Text style={styles.sectionNumber}>3. Transaksi:</Text>
              <Text style={styles.sectionText}>
                Semua instruksi split dijalankan otomatis oleh Aplikasi sesuai jadwal yang telah ditentukan.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>D. Biaya & Limit</Text>
              <Text style={styles.sectionNumber}>1. Penggunaan Gratis:</Text>
              <Text style={styles.sectionText}>
                Penggunaan fitur dasar gratis, kecuali disebutkan biaya tertentu untuk layanan premium.
              </Text>
              <Text style={styles.sectionNumber}>2. Biaya Tambahan:</Text>
              <Text style={styles.sectionText}>
                Bank dapat mengenakan biaya tambahan sesuai jenis transaksi dengan ketentuan jelas yang diberitahukan sebelumnya.
              </Text>
              <Text style={styles.sectionNumber}>3. Limit Transaksi:</Text>
              <Text style={styles.sectionText}>
                Terdapat limit harian dan bulanan untuk transaksi sesuai dengan ketentuan BNI yang berlaku.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>E. Tanggung Jawab & Risiko</Text>
              <Text style={styles.sectionNumber}>1. Tanggung Jawab Pengguna:</Text>
              <Text style={styles.sectionText}>
                Pengguna bertanggung jawab memastikan saldo cukup sebelum jadwal pembayaran dan menggunakan aplikasi sesuai ketentuan.
              </Text>
              <Text style={styles.sectionNumber}>2. Pembayaran Tepat Waktu:</Text>
              <Text style={styles.sectionText}>
                Keterlambatan atau kegagalan pembayaran karena saldo tidak mencukupi atau faktor teknis, menjadi tanggung jawab pengguna.
              </Text>
              <Text style={styles.sectionNumber}>3. Kerugian:</Text>
              <Text style={styles.sectionText}>
                BNI tidak bertanggung jawab atas kerugian akibat kegagalan sistem di luar kendali bank atau kesalahan pengguna.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>F. Pemeliharaan Sistem</Text>
              <Text style={styles.sectionNumber}>1. Gangguan Sistem:</Text>
              <Text style={styles.sectionText}>
                BNI berhak melakukan pemeliharaan sistem yang dapat menyebabkan gangguan sementara pada layanan.
              </Text>
              <Text style={styles.sectionNumber}>2. Pemeliharaan Terjadwal:</Text>
              <Text style={styles.sectionText}>
                Pemeliharaan terjadwal akan diinformasikan sebelumnya melalui aplikasi atau media resmi BNI.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>G. Privasi & Keamanan</Text>
              <Text style={styles.sectionNumber}>1. Perlindungan Data:</Text>
              <Text style={styles.sectionText}>
                Data pengguna dilindungi sesuai kebijakan privasi BNI dan peraturan perlindungan data yang berlaku.
              </Text>
              <Text style={styles.sectionNumber}>2. Kebijakan Privasi:</Text>
              <Text style={styles.sectionText}>
                Penggunaan data pribadi mengikuti kebijakan privasi BNI yang dapat diakses melalui aplikasi atau website resmi.
              </Text>
            </View>
          </ScrollView>

          {/* Scroll Indicator */}
          <View style={styles.scrollIndicator}>
            <View style={styles.scrollTrack}>
              <Animated.View
                style={[
                  styles.scrollThumb,
                  {
                    transform: [
                      {
                        translateY: scrollProgress * (200 - 40), // 200 = track height, 40 = thumb height
                      },
                    ],
                  },
                ]}
              />
            </View>
          </View>
        </View>
        
        {/* Footer - Only show when at bottom */}
        {isAtBottom && (
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.checkboxContainer} onPress={handleCheckboxToggle}>
              <View style={[styles.checkbox, isAgreed && styles.checkboxChecked]}>
                {isAgreed && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
              </View>
              <Text style={styles.checkboxText}>
                Saya telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku untuk penggunaan aplikasi Splitr By BNI
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.continueBtn, !canProceed && styles.continueBtnDisabled]}
              onPress={handleContinue}
              disabled={!canProceed}
            >
              <Text style={[styles.continueBtnText, !canProceed && styles.continueBtnTextDisabled]}>
                Setuju & Lanjutkan
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
  backgroundSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    textAlign: 'justify',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  whiteModalContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 200,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  sectionNumber: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 8,
  },
  scrollIndicator: {
    width: 20,
    paddingVertical: 24,
    paddingRight: 8,
    alignItems: 'center',
  },
  scrollTrack: {
    width: 4,
    height: 200,
    backgroundColor: COLORS.inputBg,
    borderRadius: 2,
    position: 'relative',
  },
  scrollThumb: {
    width: 4,
    height: 40,
    backgroundColor: COLORS.teal,
    borderRadius: 2,
    position: 'absolute',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  continueBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: COLORS.inputBg,
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  continueBtnTextDisabled: {
    color: COLORS.textSecondary,
  },
});