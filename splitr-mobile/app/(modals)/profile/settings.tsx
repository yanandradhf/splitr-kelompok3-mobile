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

const SettingsScreen = () => {
  const { profile, isLoading } = useProfile();
  const [emailNotifications, setEmailNotifications] = useState(false);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#EDEAFC" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
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
          <Ionicons name="camera" size={16} color="#FF7A00" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              <Ionicons name="lock-closed" size={20} color="#FF7A00" />
            </View>
            <Text style={styles.menuText}>Ubah Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(modals)/profile/changepin")}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="keypad" size={20} color="#FF7A00" />
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
              <Ionicons name="notifications" size={20} color="#FF7A00" />
            </View>
            <Text style={styles.menuText}>Aktifkan Notifikasi Email</Text>
            <Switch
              trackColor={{ false: "#E0E0E0", true: "#FF7A00" }}
              thumbColor={emailNotifications ? "#FFF" : "#FFF"}
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
    backgroundColor: "#EDEAFC",
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
  content: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 80,
    paddingHorizontal: 20,
    marginTop: -120,
    zIndex: 1,
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
    fontWeight: "bold",
    color: "#000",
    // marginTop: 15,
  },
  profileId: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
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
    color: "#000",
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  bottomSpacing: {
    height: 50,
  },
});

export default SettingsScreen;
