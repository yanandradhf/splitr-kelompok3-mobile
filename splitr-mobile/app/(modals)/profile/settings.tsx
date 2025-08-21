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
import { useProfileStore } from "../../../store";
import LoadingScreen from "../../../components/ui/LoadingScreen";
import { COLORS, FONTS } from "../../../constants/theme";

const SettingsScreen = () => {
  const { user, isLoading, fetchProfile } = useProfileStore();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [forceLoading, setForceLoading] = useState(true);

  React.useEffect(() => {
    if (!user) fetchProfile();
    setTimeout(() => setForceLoading(false), 1200);
  }, []);

  if (isLoading || forceLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={COLORS.backgroundMain}
          barStyle="dark-content"
        />

        {/* Background Section */}
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
            <Text style={styles.headerTitle}>Pengaturan</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

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
  backgroundSection: {
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
  whiteModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
    marginBottom: -50,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
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
