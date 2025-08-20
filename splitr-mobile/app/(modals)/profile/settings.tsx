import React, { useState } from "react";
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
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../../../hooks/useProfile";
import LoadingScreen from "../../../components/ui/LoadingScreen";
import { COLORS, FONTS } from "../../../constants/theme";

const SettingsScreen = () => {
  const { profile, isLoading } = useProfile();
  const [emailNotifications, setEmailNotifications] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={COLORS.backgroundMain}
          barStyle="dark-content"
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
            <Text style={styles.headerTitle}>Pengaturan</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Image */}
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
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.user?.username || "User"}
              </Text>
              <Text style={styles.profileId}>
                {profile?.user?.bniAccountNumber || "-"}
              </Text>
            </View>

            {/* Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Keamanan</Text>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/(modals)/profile/changepassword")}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="lock-closed" size={20} color={COLORS.teal} />
                </View>
                <Text style={styles.menuText}>Ubah Password</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => router.push("/(modals)/profile/changepin")}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name="keypad" size={20} color={COLORS.teal} />
                </View>
                <Text style={styles.menuText}>Ubah PIN</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Notifikasi & Preferensi Tampilan
              </Text>

              <View style={styles.menuItem}>
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name="notifications"
                    size={20}
                    color={COLORS.teal}
                  />
                </View>
                <Text style={styles.menuText}>Aktifkan Notifikasi Email</Text>
                <Switch
                  trackColor={{ false: "#E0E0E0", true: COLORS.teal }}
                  thumbColor={emailNotifications ? COLORS.white : COLORS.white}
                  ios_backgroundColor="#E0E0E0"
                  onValueChange={setEmailNotifications}
                  value={emailNotifications}
                  style={styles.switch}
                />
              </View>
            </View>

            <View style={styles.bottomSpacing} />
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    fontFamily: FONTS.bold,
  },
  placeholder: {
    width: 34,
  },
  profileSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 60,
    zIndex: 2,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 25,
    backgroundColor: "#4A90E2",
    borderWidth: 3,
    borderColor: "#FFF",
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
  profileInfo: {
    alignItems: "center",
    paddingBottom: 20,
  },
  editIconContainer: {
    position: "absolute",
    right: "35%",
    top: 90,
    backgroundColor: "#FFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileName: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  profileId: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  bottomSpacing: {
    height: 50,
  },
});

export default SettingsScreen;
