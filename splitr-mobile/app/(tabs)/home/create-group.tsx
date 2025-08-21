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
import {
  wp,
  hp,
  rf,
  getSpacing,
  getBorderRadius,
  getIconSize,
} from "../../../utils/responsive";

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
  const [daftarTeman, setDaftarTeman] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [temanTerpilih, setTemanTerpilih] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { getFriends, createGroup: apiCreateGroup } = useApi();

  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoadingFriends(true);
        
        // TODO: Replace with actual API call
        // const response = await getFriends();
        // setDaftarTeman(response.friends || []);
        
        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 500));
        setDaftarTeman(mockUsers);
        
      } catch (error) {
        console.error("Error fetching friends:", error);
        setDaftarTeman(mockUsers); // Fallback to mock data
      } finally {
        setLoadingFriends(false);
      }
    };

    fetchFriends();
  }, []);

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
      
      // TODO: Replace with actual API call
      // const response = await api.post('/api/mobile/groups', {
      //   groupName: namaGrup.trim(),
      //   memberIds: memberIds
      // });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Create new group object with proper member structure
      const newGroup = {
        groupId: "GRP" + Date.now(),
        groupName: namaGrup.trim(),
        isCreator: true,
        creatorName: "You",
        memberCount: temanTerpilih.length + 1, // +1 for creator
        members: [
          // Add creator as first member
          {
            id: "creator",
            name: "You",
            username: "you",
            status: "active",
            avatar: personImages[0],
          },
          // Add selected friends
          ...temanTerpilih.map((friend) => ({
            ...friend,
            status: "active",
          }))
        ],
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
                size={getIconSize(24)}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Buat Grup</Text>
            <View style={{ width: getIconSize(24) }} />
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
                    size={getIconSize(20)}
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

                {/* Loading State */}
                {loadingFriends ? (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>Memuat daftar teman...</Text>
                  </View>
                ) : (
                  /* Filtered Friends List */
                  daftarTeman
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
                            size={getIconSize(16)}
                            color={COLORS.white}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                    })
                )}

                {/* No Results */}
                {!loadingFriends && searchQuery &&
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
                        size={getIconSize(32)}
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

                {/* Empty Friends State */}
                {!loadingFriends && daftarTeman.length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <Ionicons
                      name="people-outline"
                      size={getIconSize(32)}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.noResultsText}>
                      Belum ada teman
                    </Text>
                    <Text style={styles.noResultsSubtext}>
                      Tambahkan teman terlebih dahulu
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
    paddingBottom: getSpacing(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getSpacing(24),
    paddingTop: getSpacing(16),
    paddingBottom: getSpacing(20),
  },
  headerTitle: {
    fontSize: rf(20),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: getBorderRadius(24),
    borderTopRightRadius: getBorderRadius(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -hp(6),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(6),
  },
  formSection: {
    paddingHorizontal: getSpacing(24),
    paddingTop: getSpacing(40),
  },
  inputGroup: {
    marginBottom: getSpacing(20),
  },
  label: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: getSpacing(8),
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: getSpacing(16),
    marginBottom: getSpacing(16),
  },
  searchIcon: {
    marginRight: getSpacing(8),
  },
  searchInput: {
    flex: 1,
    paddingVertical: getSpacing(16),
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },

  friendsSection: {
    marginTop: getSpacing(20),
    marginBottom: getSpacing(40),
  },
  sectionTitle: {
    fontSize: rf(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: getSpacing(16),
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getSpacing(14),
    paddingHorizontal: getSpacing(16),
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(8),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  friendAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: getSpacing(12),
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: getSpacing(2),
  },
  friendUsername: {
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  statusIcon: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
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
    paddingVertical: getSpacing(30),
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderStyle: "dashed",
  },
  emptyFriendsText: {
    fontSize: rf(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    marginTop: getSpacing(8),
    marginBottom: getSpacing(4),
  },
  emptyFriendsSubtext: {
    fontSize: rf(12),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: getSpacing(30),
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    marginTop: getSpacing(8),
  },
  noResultsText: {
    fontSize: rf(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
    marginTop: getSpacing(8),
    marginBottom: getSpacing(4),
  },
  noResultsSubtext: {
    fontSize: rf(12),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  createButton: {
    backgroundColor: "#00897B",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(18),
    alignItems: "center",
    marginTop: getSpacing(20),
  },
  createButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: rf(18),
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  createButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
});
