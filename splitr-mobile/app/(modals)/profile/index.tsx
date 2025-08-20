import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../constants/theme";
import { useProfile } from "../../../hooks/useProfile";
import LoadingScreen from "../../../components/ui/LoadingScreen";
import { authAPI } from "../../../services/api";
import * as SecureStore from 'expo-secure-store';

export default function ProfileScreen() {
  const { profile, isLoading } = useProfile();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={COLORS.backgroundMain}
          barStyle="light-content"
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
            <Text style={styles.headerTitle}>Profil</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <Image
              source={{
                uri: "https://picsum.photos/id/64/120/120",
              }}
              style={styles.profileImage}
            />
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={16} color={COLORS.teal} />
            </View>
            <Text style={styles.profileName}>
              {profile?.user?.username || "User"}
            </Text>
            <Text style={styles.profileId}>
              {profile?.user?.bniAccountNumber || "-"}
            </Text>
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(modals)/profile/edit")}
            >
              <View style={[styles.menuIcon, { backgroundColor: COLORS.teal }]}>
                <Ionicons
                  name="person-outline"
                  size={24}
                  color={COLORS.white}
                />
              </View>
              <Text style={styles.menuText}>Edit Profil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(modals)/profile/settings")}
            >
              <View style={[styles.menuIcon, { backgroundColor: COLORS.teal }]}>
                <Ionicons
                  name="settings-outline"
                  size={24}
                  color={COLORS.white}
                />
              </View>
              <Text style={styles.menuText}>Pengaturan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(modals)/profile/help")}
            >
              <View style={[styles.menuIcon, { backgroundColor: COLORS.teal }]}>
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color={COLORS.white}
                />
              </View>
              <Text style={styles.menuText}>Bantuan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setShowLogoutModal(true)}
            >
              <View style={[styles.menuIcon, { backgroundColor: COLORS.teal }]}>
                <Ionicons
                  name="log-out-outline"
                  size={24}
                  color={COLORS.white}
                />
              </View>
              <Text style={styles.menuText}>Keluar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Konfirmasi Keluar</Text>
              <Text style={styles.modalMessage}>
                Apakah Anda yakin ingin keluar dari aplikasi?
              </Text>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowLogoutModal(false)}
                  disabled={isLoggingOut}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                >
                  <Text style={styles.confirmButtonText}>
                    {isLoggingOut ? 'Keluar...' : 'Ya, Keluar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {isLoggingOut && <LoadingScreen />}
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await authAPI.logout();
      if (response.status === 200) {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
        router.replace('/(auth)/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Gagal keluar dari aplikasi. Silakan coba lagi.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  }
}

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
  profileSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 25,
    backgroundColor: "#4A90E2",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  editIconContainer: {
    position: "absolute",
    right: "35%",
    top: 90,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 15,
  },
  profileId: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 5,
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
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  menuText: {
    fontSize: 17,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.gray,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.teal,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});
