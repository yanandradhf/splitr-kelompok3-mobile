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
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../../constants/theme';

const HelpScreen = () => {
  const helpItems = [
    {
      title: 'Tentang Splitr',
      icon: 'information-circle-outline',
    },
    {
      title: 'Pemberitahuan Privasi',
      icon: 'shield-checkmark-outline',
    },
    {
      title: 'Syarat & Ketentuan',
      icon: 'document-text-outline',
    },
    {
      title: 'Hubungi Kami',
      icon: 'mail-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="dark-content" />
        
        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bantuan</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/profile/about')}>
            <View style={styles.iconContainer}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.teal} />
            </View>
            <Text style={styles.menuText}>Tentang Splitr</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/profile/privacy')}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.teal} />
            </View>
            <Text style={styles.menuText}>Pemberitahuan Privasi</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/profile/terms')}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={24} color={COLORS.teal} />
            </View>
            <Text style={styles.menuText}>Syarat & Ketentuan</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/profile/contact')}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={24} color={COLORS.teal} />
            </View>
            <Text style={styles.menuText}>Hubungi Kami</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
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
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F0F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
});

export default HelpScreen;