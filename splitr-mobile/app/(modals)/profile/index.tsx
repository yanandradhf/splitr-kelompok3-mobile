import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../../constants/theme";
import { useProfile } from "../../../hooks/useProfile";
import LoadingScreen from "../../../components/ui/LoadingScreen";

export default function ProfileScreen() {
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF7A00" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: "https://via.placeholder.com/120x120/4A90E2/FFFFFF?text=Ivana",
          }}
          style={styles.profileImage}
        />
        <View style={styles.editIconContainer}>
          <Ionicons name="camera" size={16} color="#FF7A00" />
        </View>
        <Text style={styles.profileName}>{profile?.user?.username || 'User'}</Text>
        <Text style={styles.profileId}>{profile?.user?.bniAccountNumber || '-'}</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(modals)/profile/edit")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#6EDCD9" }]}>
            <Ionicons name="person-outline" size={24} color="#FFF" />
          </View>
          <Text style={styles.menuText}>Edit Profil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(modals)/profile/settings")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#6EDCD9" }]}>
            <Ionicons name="settings-outline" size={24} color="#FFF" />
          </View>
          <Text style={styles.menuText}>Pengaturan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/(modals)/profile/help")}
        >
          <View style={[styles.menuIcon, { backgroundColor: "#6EDCD9" }]}>
            <Ionicons name="help-circle-outline" size={24} color="#FFF" />
          </View>
          <Text style={styles.menuText}>Bantuan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIcon, { backgroundColor: "#6EDCD9" }]}>
            <Ionicons name="log-out-outline" size={24} color="#FFF" />
          </View>
          <Text style={styles.menuText}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.orange,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 34,
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
    marginTop: 15,
  },
  profileId: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
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
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
});
