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
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/profile/about')}>
            <View style={styles.iconContainer}>
              <Ionicons name="information-circle-outline" size={24} color="#6EDCD9" />
            </View>
            <Text style={styles.menuText}>Tentang Splitr</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/profile/privacy')}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#6EDCD9" />
            </View>
            <Text style={styles.menuText}>Pemberitahuan Privasi</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/profile/terms')}>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text-outline" size={24} color="#6EDCD9" />
            </View>
            <Text style={styles.menuText}>Syarat & Ketentuan</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(modals)/profile/contact')}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={24} color="#6EDCD9" />
            </View>
            <Text style={styles.menuText}>Hubungi Kami</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
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
    color: '#000',
    fontWeight: '500',
  },
});

export default HelpScreen;