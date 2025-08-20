import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useProfile } from "../../../hooks/useProfile";
import LoadingScreen from "../../../components/ui/LoadingScreen";
import { COLORS, FONTS } from "../../../constants/theme";

const EditProfileScreen = () => {
  const { profile, isLoading, isUpdating, updateProfile } = useProfile();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [originalData, setOriginalData] = useState({ name: "", phone: "", email: "" });

  // Update state when profile data loads
  React.useEffect(() => {
    if (profile?.user) {
      const data = {
        name: profile.user.name,
        phone: profile.user.phone,
        email: profile.user.email
      };
      setUsername(data.name);
      setPhoneNumber(data.phone);
      setEmail(data.email);
      setOriginalData(data);
    }
  }, [profile]);

  // Check if data has changed
  const hasChanges = username !== originalData.name || 
                    phoneNumber !== originalData.phone || 
                    email !== originalData.email;

  const handleUpdateProfile = async () => {
    if (!hasChanges) return;
    
    const success = await updateProfile({
      name: username,
      phone: phoneNumber,
      email: email
    });
    
    if (success) {
      router.back();
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="dark-content" />

        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profil</Text>
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
            <TouchableOpacity style={styles.editIconContainer}>
              <Ionicons name="camera" size={16} color={COLORS.teal} />
            </TouchableOpacity>
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.user?.username || 'User'}</Text>
          <Text style={styles.profileId}>{profile?.user?.bniAccountNumber || '-'}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama</Text>
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Masukkan username"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nomor HP</Text>
            <TextInput
              style={styles.textInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Masukkan nomor HP"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Masukkan email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.updateButton, !hasChanges && styles.updateButtonDisabled]}
            onPress={handleUpdateProfile}
            disabled={!hasChanges || isUpdating}
          >
            <Text style={[styles.updateButtonText, !hasChanges && styles.updateButtonTextDisabled]}>
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
        {isUpdating && <LoadingScreen />}
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
    flex: 1,
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
  formContainer: {
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  updateButton: {
    backgroundColor: COLORS.teal,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  updateButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  updateButtonTextDisabled: {
    color: "#999",
  },
});

export default EditProfileScreen;
