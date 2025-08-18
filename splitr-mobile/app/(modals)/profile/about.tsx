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

const AboutScreen = () => {
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
          <Text style={styles.pageTitle}>Tentang Splitr</Text>
          
          <Text style={styles.description}>
            Splitr adalah aplikasi pembagi tagihan yang memudahkan Anda untuk:
          </Text>

          <View style={styles.featureList}>
            <Text style={styles.bulletPoint}>
              • Membagi biaya bersama teman, keluarga, atau rekan kerja secara instan.
            </Text>
            <Text style={styles.bulletPoint}>
              • Mengelola pembayaran secara transparan.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Fitur Utama:</Text>
          
          <View style={styles.featureSection}>
            <View style={styles.featureItem}>
              <Ionicons name="scan" size={20} color="#6EDCD9" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Scan Struk Otomatis</Text>
                <Text style={styles.featureDesc}>
                  Ambil foto struk, sistem akan membaca dan membagi secara otomatis.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color="#6EDCD9" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Kelola Grup</Text>
                <Text style={styles.featureDesc}>
                  Buat grup untuk acara, liburan, atau kebutuhan rutin.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="card" size={20} color="#6EDCD9" />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Metode Pembayaran Fleksibel</Text>
                <Text style={styles.featureDesc}>
                  Pilih bayar sekarang atau nanti.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color="#6EDCD9" />
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
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 15,
  },
  featureList: {
    marginBottom: 25,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  featureSection: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  featureContent: {
    flex: 1,
    marginLeft: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 5,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default AboutScreen;