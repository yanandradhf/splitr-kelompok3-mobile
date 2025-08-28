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
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useProfileStore } from "../../../store";
import LoadingScreen from "../../../components/ui/LoadingScreen";
import { SkeletonProfile, SkeletonForm } from "../../../components/ui/Skeleton";
import UserAvatar from "../../../components/ui/UserAvatar";
import { COLORS, FONTS } from "../../../constants/theme";

const EditProfileScreen = () => {
  const {
    user,
    isLoading,
    isUpdating,
    isUploadingPhoto,
    updateProfile,
    uploadProfilePhoto,
    fetchProfile,
  } = useProfileStore();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [originalData, setOriginalData] = useState({
    name: "",
    phone: "",
    email: "",
  });

  React.useEffect(() => {
    if (!user) fetchProfile();
  }, []);

  // Debug profile photo URL changes
  React.useEffect(() => {
    console.log("Profile photo URL updated:", user?.profilePhotoUrl);
  }, [user?.profilePhotoUrl]);

  React.useEffect(() => {
    if (user) {
      const data = {
        name: user.name,
        phone: user.phone,
        email: user.email,
      };
      setUsername(data.name);
      setPhoneNumber(data.phone);
      setEmail(data.email);
      setOriginalData(data);
    }
  }, [user]);

  // Validation functions
  const isValidEmail = (email: string) => {
    return email.includes('@') && email.includes('.');
  };

  const isValidPhone = (phone: string) => {
    return /^\+[0-9]+$/.test(phone);
  };

  const hasValidChanges = () => {
    // Check if any field has meaningful changes (not just spaces)
    const nameChanged = username.trim() !== originalData.name.trim() && username.trim() !== '';
    const phoneChanged = phoneNumber.trim() !== originalData.phone.trim() && phoneNumber.trim() !== '';
    const emailChanged = email.trim() !== originalData.email.trim() && email.trim() !== '';
    
    const hasChanges = nameChanged || phoneChanged || emailChanged;
    
    // If email changed, validate it
    if (emailChanged && !isValidEmail(email.trim())) {
      return false;
    }
    
    // If phone changed, validate it (only if not empty)
    if (phoneChanged && phoneNumber.trim() !== '' && !isValidPhone(phoneNumber.trim())) {
      return false;
    }
    
    return hasChanges;
  };

  // Check if data has changed
  const hasChanges = hasValidChanges();

  const handleUpdateProfile = async () => {
    if (!hasChanges) return;

    // Validate email if it was changed
    if (email.trim() !== originalData.email.trim() && !isValidEmail(email.trim())) {
      Alert.alert('Email Tidak Valid', 'Masukkan alamat email yang valid dengan @ dan domain.');
      return;
    }

    // Validate phone if it was changed
    if (phoneNumber.trim() !== originalData.phone.trim() && !isValidPhone(phoneNumber.trim())) {
      Alert.alert('Nomor Telepon Tidak Valid', 'Nomor telepon hanya boleh berisi angka dan tanda + saja.');
      return;
    }

    // Trim all values before sending
    const success = await updateProfile({
      name: username.trim(),
      phone: phoneNumber.trim(),
      email: email.trim(),
    });

    if (success) {
      router.back();
    }
  };

  const handlePhotoUpload = async () => {
    Alert.alert("Pilih Foto Profil", "Pilih sumber foto untuk profil Anda", [
      { text: "Batal", style: "cancel" },
      { text: "Kamera", onPress: () => openCamera() },
      { text: "Galeri", onPress: () => openGallery() },
    ]);
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Diperlukan",
          "Aplikasi memerlukan izin kamera untuk mengambil foto profil."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Error", "Gagal membuka kamera");
    }
  };

  const openGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Diperlukan",
          "Aplikasi memerlukan izin galeri untuk memilih foto profil."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error("Error opening gallery:", error);
      Alert.alert("Error", "Gagal membuka galeri");
    }
  };

  const uploadPhoto = async (asset: any) => {
    try {
      // Resize image to max 800x800 and compress to 80% quality
      const resizedImage = await manipulateAsync(
        asset.uri,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      const imageFile = {
        uri: resizedImage.uri,
        type: "image/jpeg",
        name: "profile.jpg",
      };

      const success = await uploadProfilePhoto(imageFile);
      if (success) {
        Alert.alert("Berhasil", "Foto profil berhasil diperbarui!");
        setTimeout(() => {
          fetchProfile();
        }, 1000);
      }
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Gagal memproses gambar");
    }
  };

  if (isLoading) {
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
              <Text style={styles.headerTitle}>Ubah Profil</Text>
              <View style={styles.placeholder} />
            </View>
            <SkeletonProfile />
          </View>
          <View style={styles.whiteModalContainer}>
            <View style={styles.scrollContent}>
              <SkeletonForm />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
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
            <Text style={styles.headerTitle}>Ubah Profil</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Image */}
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <UserAvatar
                photoUrl={user?.profilePhotoUrl}
                name={user?.name || "User"}
                size={100}
              />
              <TouchableOpacity
                style={styles.editIconContainer}
                onPress={handlePhotoUpload}
              >
                <Ionicons name="camera" size={16} color={COLORS.teal} />
              </TouchableOpacity>
            </View>
            <Text style={styles.profileName}>{user?.name || "User"}</Text>
            <Text style={styles.profileUsername}>
              @{user?.username || "username"}
            </Text>
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Form Fields */}
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nama Akun Splitr</Text>
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
                  <Text style={styles.inputLabel}>Alamat E-mail</Text>
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
                  style={[
                    styles.updateButton,
                    !hasChanges && styles.updateButtonDisabled,
                  ]}
                  onPress={handleUpdateProfile}
                  disabled={!hasChanges || isUpdating}
                >
                  <Text
                    style={[
                      styles.updateButtonText,
                      !hasChanges && styles.updateButtonTextDisabled,
                    ]}
                  >
                    {isUpdating ? "Updating..." : "Update Profile"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
        {(isUpdating || isUploadingPhoto) && <LoadingScreen />}
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
    paddingTop: 16,
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
  editIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
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
    backgroundColor: COLORS.orange,
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
