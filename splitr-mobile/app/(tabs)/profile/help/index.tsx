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
      route: '/profile/help/about',
    },
    {
      title: 'Pemberitahuan Privasi',
      icon: 'shield-checkmark-outline',
      route: '/profile/help/privacy',
    },
    {
      title: 'Syarat & Ketentuan',
      icon: 'document-text-outline',
      route: '/profile/help/terms',
    },
    {
      title: 'Hubungi Kami',
      icon: 'mail-outline',
      route: '/profile/help/contact',
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
          {helpItems.map((item, index) => (
            <Link key={index} href={item.route as any} asChild>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={24} color="#6EDCD9" />
                </View>
                <Text style={styles.menuText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </Link>
          ))}
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