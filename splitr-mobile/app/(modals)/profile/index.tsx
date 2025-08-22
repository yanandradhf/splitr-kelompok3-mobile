import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LoadingScreen from "../../../components/ui/LoadingScreen";
import { SkeletonProfile } from "../../../components/ui/Skeleton";
import { COLORS, FONTS } from "../../../constants/theme";
import { authAPI } from "../../../services/api";
import { useProfileStore } from "../../../store";

export default function ProfileScreen() {
  const { user, stats, isLoading, fetchProfile } = useProfileStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [forceLoading, setForceLoading] = useState(true);

  React.useEffect(() => {
    if (!user) fetchProfile();
    setTimeout(() => setForceLoading(false), 1600);
  }, []);

  if (isLoading || forceLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.backgroundSection}>
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
            <SkeletonProfile />
          </View>
          <View style={styles.whiteModalContainer}>
            <View style={styles.scrollContent}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.menuItem}>
                  <View
                    style={[
                      styles.menuIconContainer,
                      { backgroundColor: "#E1E5E9" },
                    ]}
                  />
                  <View
                    style={{
                      flex: 1,
                      height: 16,
                      backgroundColor: "#E1E5E9",
                      borderRadius: 4,
                      marginRight: 12,
                    }}
                  />
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      backgroundColor: "#E1E5E9",
                      borderRadius: 4,
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.backgroundMain}
        barStyle="light-content"
      />

      {/* Background Section */}
      <View style={[styles.backgroundSection, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://picsum.photos/id/64/120/120",
              }}
              style={styles.profileImage}
            />
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{user?.name || "User"}</Text>
          <Text style={styles.profileUsername}>
            @{user?.username || "username"}
          </Text>
        </View>
      </View>

      {/* White Modal Container */}
      <View style={styles.whiteModalContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Bank Account Card */}
          <View style={styles.bankSection}>
            <Text style={styles.sectionTitle}>Rekening Bank</Text>
            <TouchableOpacity
              style={styles.bankCard}
              onPress={() => router.push("/(modals)/profile/bank-account")}
            >
              <View style={styles.bankHeader}>
                <View style={styles.bankTitleRow}>
                  <Ionicons
                    name="card-outline"
                    size={24}
                    color={COLORS.white}
                  />
                  <Text style={styles.bankTitle}> BNI</Text>
                </View>
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Splitr</Text>
                </View>
              </View>
              <Text style={styles.bankNumber}>
                {user?.bniAccountNumber || "-"}
              </Text>
              <View style={styles.bankFooter}>
                <Text style={styles.accountHolderName}>
                  {user?.name || "Nama Pemegang Rekening"}
                </Text>
                <Text style={styles.bankBranch}>
                  Cabang {user?.bniBranchCode || "-"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Menu List */}
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(modals)/profile/edit")}
            >
              <View style={styles.menuLeft}>
                <Ionicons name="person-outline" size={22} color={COLORS.teal} />
                <Text style={styles.menuText}>Edit Profile</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(modals)/profile/settings")}
            >
              <View style={styles.menuLeft}>
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={COLORS.teal}
                />
                <Text style={styles.menuText}>Pengaturan</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(modals)/profile/help")}
            >
              <View style={styles.menuLeft}>
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color={COLORS.teal}
                />
                <Text style={styles.menuText}>Bantuan</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, styles.lastMenuItem]}
              onPress={() => setShowLogoutModal(true)}
            >
              <View style={styles.menuLeft}>
                <Ionicons name="log-out-outline" size={22} color={COLORS.red} />
                <Text style={[styles.menuText, { color: COLORS.red }]}>
                  Keluar
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
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
                  {isLoggingOut ? "Keluar..." : "Ya, Keluar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {isLoggingOut && <LoadingScreen />}
        </View>
      </Modal>
    </View>
  );

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await authAPI.logout();
      if (response.status === 200) {
        await SecureStore.deleteItemAsync("auth_token");
        await SecureStore.deleteItemAsync("user_data");
        router.replace("/(auth)/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Gagal keluar dari aplikasi. Silakan coba lagi.");
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
  backgroundSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 10,
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
    marginBottom: 20,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  profileName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  profileUsername: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  whiteModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },

  // Bank Section
  bankSection: {
    marginBottom: 24,
  },
  bankCard: {
    backgroundColor: COLORS.teal,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  bankHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bankTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bankTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  bankNumber: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 12,
    letterSpacing: 1,
  },
  bankFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountHolderName: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    opacity: 0.85,
  },
  bankBranch: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    opacity: 0.85,
  },
  paymentMethod: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    opacity: 0.8,
  },
  defaultBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },

  // Menu Section
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    width: "80%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.gray,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
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
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});
