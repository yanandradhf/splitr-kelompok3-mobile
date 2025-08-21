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
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
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
  const [deskripsiGrup, setDeskripsiGrup] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [daftarTeman, setDaftarTeman] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [temanTerpilih, setTemanTerpilih] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [buttonAnimation] = useState(new Animated.Value(0));
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
  const showButton = temanTerpilih.length > 0;

  // Animate button when friends are selected
  useEffect(() => {
    if (showButton) {
      Animated.spring(buttonAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(buttonAnimation, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [showButton]);

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
        groupDescription: deskripsiGrup.trim(),
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          <View style={styles.contentWrapper}>
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Form Section */}
              <View style={styles.formSection}>
              {/* Group Name Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Nama Grup</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama grup"
                  value={namaGrup}
                  onChangeText={setNamaGrup}
                  placeholderTextColor={COLORS.placeholder}
                />
              </View>

              {/* Group Description Input */}
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Text style={styles.label}>Deskripsi Grup</Text>
                  <Text style={styles.optional}>(Opsional)</Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  placeholder="Jelaskan tujuan grup ini..."
                  value={deskripsiGrup}
                  onChangeText={setDeskripsiGrup}
                  placeholderTextColor={COLORS.placeholder}
                  multiline={true}
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              {/* Selected Members Preview */}
              {temanTerpilih.length > 0 && (
                <View style={styles.selectedSection}>
                <Text style={styles.selectedTitle}>
                  Anggota Grup ({temanTerpilih.length + 1})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.selectedMembers}>
                    {/* Host (Creator) - Always First */}
                    <View style={styles.hostMember}>
                      <Image source={personImages[0]} style={styles.hostAvatar} />
                      <Text style={styles.hostName}>You (Host)</Text>
                    </View>
                    
                    {/* Separator */}
                    {temanTerpilih.length > 0 && (
                      <View style={styles.memberSeparator}>
                        <View style={styles.separatorLine} />
                      </View>
                    )}
                    
                    {/* Selected Friends */}
                    {temanTerpilih.map((friend) => (
                      <View key={friend.id} style={styles.selectedFriend}>
                        <Image source={friend.avatar} style={styles.selectedAvatar} />
                        <Text style={styles.selectedName} numberOfLines={1}>{friend.name}</Text>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => toggleFriend(friend)}
                        >
                          <Ionicons name="close" size={12} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                </View>
              )}

              {/* Smart Button Above Friends Section */}
              {showButton && (
                <Animated.View 
                  style={[
                    styles.compactButtonContainer,
                    {
                      transform: [
                        {
                          translateY: buttonAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-30, 0],
                          }),
                        },
                      ],
                      opacity: buttonAnimation,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.compactButton}
                    onPress={createGroup}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <Text style={styles.compactButtonText}>Membuat...</Text>
                    ) : (
                      <View style={styles.compactButtonContent}>
                        <Ionicons name="people" size={14} color={COLORS.white} />
                        <Text style={styles.compactButtonText}>
                          Buat Grup ({temanTerpilih.length + 1})
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Friends List with Search */}
              <View style={styles.friendsSection}>
                <Text style={styles.sectionTitle}>Pilih Anggota</Text>

                {/* Search Input */}
                <View style={styles.searchInputContainer}>
                  <Ionicons
                    name="search"
                    size={getIconSize(20)}
                    color={COLORS.textSecondary}
                  />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cari teman..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={COLORS.placeholder}
                  />
                </View>

                {/* Scrollable Friends List */}
                <ScrollView 
                  style={styles.friendsListContainer}
                  contentContainerStyle={styles.friendsListContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {loadingFriends ? (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>Memuat daftar teman...</Text>
                    </View>
                  ) : (
                    <>
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
                            style={[
                              styles.friendItem,
                              isSelected && styles.friendItemSelected
                            ]}
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
                        })}

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
                    </>
                  )}
                </ScrollView>
              </View>
            </View>
            </ScrollView>


          </View>
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
    </KeyboardAvoidingView>
  );
}

const LOCAL_COLORS = {
  background: "#A6D3CE",
  cardBrown: COLORS.card,
  cardWhite: COLORS.white,
  orange: COLORS.orange,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  headerBrown: "#00897B",
  gray: COLORS.gray,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  purpleSection: {
    backgroundColor: LOCAL_COLORS.background,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: rf(FONT_SIZES.xl),
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
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
  contentWrapper: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(6),
  },
  formSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: getSpacing(SPACING.sm),
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getSpacing(SPACING.sm),
  },
  label: {
    fontSize: rf(FONT_SIZES.base),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  required: {
    fontSize: rf(FONT_SIZES.base),
    fontFamily: FONTS.semiBold,
    color: COLORS.red,
    marginLeft: 4,
  },
  optional: {
    fontSize: rf(FONT_SIZES.sm),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(10),
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(14),
    fontSize: rf(15),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(10),
    paddingVertical: getSpacing(10),
    paddingHorizontal: getSpacing(14),
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    minHeight: 60,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(10),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: getSpacing(14),
    marginBottom: getSpacing(12),
  },
  searchIcon: {
    marginRight: getSpacing(8),
  },
  searchInput: {
    flex: 1,
    paddingVertical: getSpacing(12),
    fontSize: rf(15),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },

  friendsSection: {
    flex: 1,
    marginTop: getSpacing(SPACING.md),
  },
  friendsListContainer: {
    flex: 1,
    maxHeight: hp(40),
  },
  friendsListContent: {
    paddingBottom: getSpacing(SPACING.xl),
  },
  sectionTitle: {
    fontSize: rf(FONT_SIZES.lg),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: getSpacing(SPACING.md),
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(14),
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(10),
    marginBottom: getSpacing(6),
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
    paddingVertical: getSpacing(20),
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(10),
    marginTop: getSpacing(6),
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
  compactButtonContainer: {
    marginBottom: getSpacing(SPACING.md),
    alignItems: "center",
  },
  compactButton: {
    backgroundColor: COLORS.teal,
    borderRadius: getBorderRadius(20),
    paddingVertical: getSpacing(10),
    paddingHorizontal: getSpacing(16),
    alignItems: "center",
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  compactButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  compactButtonText: {
    color: COLORS.white,
    fontSize: rf(FONT_SIZES.sm),
    fontFamily: FONTS.semiBold,
    marginLeft: 6,
  },
  createButtonTextDisabled: {
    color: COLORS.textSecondary,
  },

  // SELECTED FRIENDS PREVIEW
  selectedSection: {
    marginBottom: getSpacing(SPACING.md),
    backgroundColor: "rgba(0, 137, 123, 0.05)",
    borderRadius: getBorderRadius(10),
    padding: getSpacing(12),
    borderWidth: 1,
    borderColor: "rgba(0, 137, 123, 0.2)",
  },
  selectedTitle: {
    fontSize: rf(FONT_SIZES.base),
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
    marginBottom: getSpacing(SPACING.sm),
  },
  selectedMembers: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getSpacing(4),
  },
  hostMember: {
    alignItems: "center",
    marginRight: getSpacing(SPACING.md),
    width: wp(16),
  },
  hostAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    marginBottom: getSpacing(4),
    borderWidth: 2,
    borderColor: COLORS.orange,
  },
  hostName: {
    fontSize: rf(FONT_SIZES.xs),
    fontFamily: FONTS.semiBold,
    color: COLORS.orange,
    textAlign: "center",
  },
  memberSeparator: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: getSpacing(SPACING.sm),
  },
  separatorLine: {
    width: 1,
    height: wp(8),
    backgroundColor: COLORS.border,
  },
  selectedFriend: {
    alignItems: "center",
    marginRight: getSpacing(SPACING.md),
    position: "relative",
    width: wp(16),
  },
  selectedAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    marginBottom: getSpacing(4),
    borderWidth: 2,
    borderColor: COLORS.teal,
  },
  selectedName: {
    fontSize: rf(FONT_SIZES.xs),
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  removeButton: {
    position: "absolute",
    top: -4,
    right: 8,
    backgroundColor: COLORS.red,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  friendItemSelected: {
    backgroundColor: "rgba(0, 137, 123, 0.1)",
    borderColor: COLORS.teal,
    borderWidth: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
