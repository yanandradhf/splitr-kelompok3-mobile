import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS, FONTS } from "../../../constants/theme";
import { useApi } from "../../../hooks/useApi";
import SuccessModal from "../../../components/ui/SuccessModal";

const personImages = [
  require("../../../assets/images/person1.png"),
  require("../../../assets/images/person2.png"),
  require("../../../assets/images/person3.png"),
  require("../../../assets/images/person4.png"),
];

const mockUsers = [
  { id: "1", name: "Akmelia", username: "akmelia", avatar: personImages[0] },
  { id: "2", name: "Nanabila", username: "nanabila", avatar: personImages[1] },
  { id: "3", name: "Rizki Ahmad", username: "rizki", avatar: personImages[2] },
  { id: "4", name: "Sarah Putri", username: "sarah", avatar: personImages[3] },
  { id: "5", name: "Budi Santoso", username: "budi", avatar: personImages[0] },
  {
    id: "6",
    name: "Siti Nurhaliza",
    username: "siti",
    avatar: personImages[1],
  },
];

export default function CreateGroupScreen() {
  const [namaGrup, setNamaGrup] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [daftarTeman, setDaftarTeman] = useState<any[]>(mockUsers);
  const [temanTerpilih, setTemanTerpilih] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const api = useApi();

  const toggleFriend = (user: any) => {
    const isSelected = temanTerpilih.find((friend) => friend.id === user.id);
    if (isSelected) {
      setTemanTerpilih((prev) =>
        prev.filter((friend) => friend.id !== user.id)
      );
    } else {
      setTemanTerpilih((prev) => [...prev, user]);
    }
  };

  const isFormValid = namaGrup.trim().length > 0 && temanTerpilih.length > 0;

  const createGroup = async () => {
    if (!isFormValid) return;

    setLoading(true);
    try {
      const memberIds = temanTerpilih.map((friend) => friend.id);

      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new group object
      const newGroup = {
        groupId: "GRP" + Date.now(),
        groupName: namaGrup.trim(),
        isCreator: true,
        creatorName: "You",
        memberCount: temanTerpilih.length + 1, // +1 for creator (only active members)
        members: temanTerpilih.map((friend) => ({
          ...friend,
          status: "active",
        })),
        pendingMembers: [], // Initially no pending members
        createdAt: new Date().toISOString(),
      };

      // Store new group in global state
      if (typeof global === "undefined") {
        (globalThis as any).newGroup = newGroup;
      } else {
        (global as any).newGroup = newGroup;
      }

      console.log("New group created:", newGroup);

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Buat Grup</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Group Name Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nama Grup</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama grup"
                  value={namaGrup}
                  onChangeText={setNamaGrup}
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              {/* Friends List with Search */}
              <View style={styles.friendsSection}>
                <Text style={styles.sectionTitle}>Daftar teman</Text>

                {/* Search Input */}
                <View style={styles.searchInputContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cari teman berdasarkan username"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                {/* Filtered Friends List */}
                {daftarTeman
                  .filter(
                    (friend) =>
                      friend.username
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      friend.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((friend) => {
                    const isSelected = temanTerpilih.find(
                      (selected) => selected.id === friend.id
                    );
                    return (
                      <TouchableOpacity
                        key={friend.id}
                        style={styles.friendItem}
                        onPress={() => toggleFriend(friend)}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={friend.avatar}
                          style={styles.friendAvatar}
                        />
                        <View style={styles.friendInfo}>
                          <Text style={styles.friendName}>{friend.name}</Text>
                          <Text style={styles.friendUsername}>
                            @{friend.username}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusIcon,
                            isSelected
                              ? styles.selectedIcon
                              : styles.unselectedIcon,
                          ]}
                        >
                          <Ionicons
                            name={isSelected ? "checkmark" : "add"}
                            size={16}
                            color={COLORS.white}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}

                {/* No Results */}
                {searchQuery &&
                  daftarTeman.filter(
                    (friend) =>
                      friend.username
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      friend.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <View style={styles.noResultsContainer}>
                      <Ionicons
                        name="search"
                        size={32}
                        color={COLORS.textSecondary}
                      />
                      <Text style={styles.noResultsText}>
                        Tidak ada teman ditemukan
                      </Text>
                      <Text style={styles.noResultsSubtext}>
                        Coba kata kunci lain
                      </Text>
                    </View>
                  )}
              </View>

              {/* Create Group Button */}
              <TouchableOpacity
                style={[
                  styles.createButton,
                  !isFormValid && styles.createButtonDisabled,
                ]}
                onPress={createGroup}
                disabled={!isFormValid || loading}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.createButtonText,
                    !isFormValid && styles.createButtonTextDisabled,
                  ]}
                >
                  {loading ? "Membuat Grup..." : "Buat Grup"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Success Modal */}
        <SuccessModal
          visible={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            router.back();
          }}
          groupName={namaGrup}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A6D3CE",
  },
  safeArea: {
    flex: 1,
  },
  purpleSection: {
    backgroundColor: "#A6D3CE",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },

  friendsSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIcon: {
    backgroundColor: "#00897B",
  },
  unselectedIcon: {
    backgroundColor: COLORS.teal,
  },

  emptyFriendsState: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderStyle: "dashed",
  },
  emptyFriendsText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyFriendsSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    marginTop: 8,
  },
  noResultsText: {
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    marginTop: 8,
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  createButton: {
    backgroundColor: "#00897B",
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  createButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});
