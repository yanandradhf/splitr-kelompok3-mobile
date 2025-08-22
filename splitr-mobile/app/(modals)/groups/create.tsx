import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
import { useApi, useFriends } from "../../../hooks/useApi";
import { useGroupsStore } from "../../../store";
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



export default function CreateGroupScreen() {
  const insets = useSafeAreaInsets();
  const [namaGrup, setNamaGrup] = useState("");
  const [deskripsiGrup, setDeskripsiGrup] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [temanTerpilih, setTemanTerpilih] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [buttonAnimation] = useState(new Animated.Value(0));
  const { createGroup: apiCreateGroup, isCreating } = useGroupsStore();
  const { friends, loading: loadingFriends } = useFriends();

  // Transform friends data for UI
  const daftarTeman = React.useMemo(() => {
    if (!friends || friends.length === 0) {
      return []; // Return empty array if no friends
    }
    
    return friends.map((friendItem: any, index: number) => ({
      id: friendItem.friend.userId,
      name: friendItem.friend.name,
      username: friendItem.friend.username || friendItem.friend.name.toLowerCase().replace(' ', ''),
      avatar: friendItem.friend.avatar || personImages[index % 4],
    }));
  }, [friends]);

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

    try {
      const memberIds = temanTerpilih.map((friend) => friend.id);
      
      const newGroup = await apiCreateGroup({
        groupName: namaGrup.trim(),
        description: deskripsiGrup.trim(),
        memberIds: memberIds
      });

      console.log("New group created:", newGroup);

      // Show success modal briefly then navigate back
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        if (router.canGoBack()) { router.back(); } else { router.replace("/(modals)/groups"); }
      }, 600);
    } catch (error) {
      console.error("Error creating group:", error);
      // Error is handled by the store
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        {/* Purple Background Section */}
        <View style={[styles.purpleSection, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => {
              if (router.canGoBack()) {
                if (router.canGoBack()) { router.back(); } else { router.replace("/(modals)/groups"); }
              } else {
                router.replace('/(modals)/groups');
              }
            }}>
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
                    style={[styles.compactButton, isCreating && styles.compactButtonDisabled]}
                    onPress={createGroup}
                    disabled={isCreating}
                    activeOpacity={0.8}
                  >
                    {isCreating ? (
                      <View style={styles.compactButtonContent}>
                        <Text style={styles.compactButtonText}>Membuat...</Text>
                      </View>
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
                            {isSelected ? (
                              <View style={styles.selectedIcon}>
                                <Ionicons
                                  name="checkmark-circle"
                                  size={getIconSize(24)}
                                  color="#00897B"
                                />
                              </View>
                            ) : (
                              <View style={styles.addButton}>
                                <Text style={styles.addButtonText}>Add to Group</Text>
                              </View>
                            )}
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

        {/* Success Modal with Blur Background */}
        <SuccessModal
          visible={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            if (router.canGoBack()) { router.back(); } else { router.replace("/(modals)/groups"); }
          }}
          groupName={namaGrup}
        />
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
  selectedIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "rgba(0, 137, 123, 0.1)",
    borderWidth: 1,
    borderColor: "#00897B",
    borderRadius: getBorderRadius(16),
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
  },
  addButtonText: {
    fontSize: rf(12),
    fontFamily: FONTS.semiBold,
    color: "#00897B",
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
  compactButtonDisabled: {
    backgroundColor: COLORS.gray,
    shadowOpacity: 0,
    elevation: 0,
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
