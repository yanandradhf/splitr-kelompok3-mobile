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
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://via.placeholder.com/120x120/4A90E2/FFFFFF?text=Ivana",
            }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editIconContainer}>
            <Ionicons name="camera" size={16} color="#FF7A00" />
          </TouchableOpacity>
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
      {isUpdating && <LoadingScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF7A00",
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
    fontWeight: "bold",
    color: "#000",
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  profileSection: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "#4A90E2",
  },
  editIconContainer: {
    position: "absolute",
    right: "35%",
    top: 105,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginTop: 15,
  },
  profileId: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 25,
  },
  inputLabel: {
    fontSize: 16,
    color: "#000",
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  updateButton: {
    backgroundColor: "#6EDCD9",
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
  },
  updateButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  updateButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  updateButtonTextDisabled: {
    color: "#999",
  },
});

export default EditProfileScreen;
