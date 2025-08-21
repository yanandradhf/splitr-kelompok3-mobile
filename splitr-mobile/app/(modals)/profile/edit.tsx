import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

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
      <StatusBar backgroundColor={COLORS.backgroundMain} barStyle="dark-content" />

      {/* Background Section */}
      <View style={[styles.backgroundSection, { paddingTop: insets.top }]}>
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
            <View style={styles.profileImageContainer}>
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
            <Text style={styles.profileName}>{profile?.user?.name || 'User'}</Text>
            <Text style={styles.profileUsername}>@{profile?.user?.username || 'username'}</Text>
          </View>
      </View>

      {/* White Modal Container */}
      <View style={styles.whiteModalContainer}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >

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
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 16,
    paddingBottom: 150,
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
