import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [emailNotifications, setEmailNotifications] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=Ivana' }}
            style={styles.profileImage}
          />
          <View style={styles.editIconContainer}>
            <Ionicons name="camera" size={14} color="#FF7A00" />
          </View>
          <Text style={styles.profileName}>Ivana</Text>
          <Text style={styles.profileId}>1927786544</Text>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keamanan</Text>
          
          <Link href="/profile/change-password" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="lock-closed" size={20} color="#FF7A00" />
              </View>
              <Text style={styles.menuText}>Ubah Password</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </Link>

          <Link href="/profile/change-pin" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="keypad" size={20} color="#FF7A00" />
              </View>
              <Text style={styles.menuText}>Ubah PIN</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifikasi & Preferensi Tampilan</Text>
          
          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications" size={20} color="#FF7A00" />
            </View>
            <Text style={styles.menuText}>Aktifkan Notifikasi Email</Text>
            <Switch
              trackColor={{ false: '#E0E0E0', true: '#FF7A00' }}
              thumbColor={emailNotifications ? '#FFF' : '#FFF'}
              ios_backgroundColor="#E0E0E0"
              onValueChange={setEmailNotifications}
              value={emailNotifications}
              style={styles.switch}
            />
          </View>
        </View>

        <View style={styles.bottomSpacing} />
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
  profileSection: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
  },
  editIconContainer: {
    position: 'absolute',
    right: '38%',
    top: 85,
    backgroundColor: '#FFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  profileId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  bottomSpacing: {
    height: 50,
  },
});

export default SettingsScreen;