import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

// Components
import { TabNavigation } from "./member-bills/components/TabNavigation";

// Hooks & Utils
import { useMemberBillsLogic } from "./member-bills/hooks/useMemberBillsLogic";

// Types
import { Friend, Group } from "./member-bills/types";

export default function MemberOfBills() {
  const {
    // State
    tab,
    selected,
    searchText,
    friends,
    groups,
    filteredFriends,
    loadingFriends,
    loadingGroups,
    showAddFriend,
    username,
    searchResults,
    isSearching,
    showNoResults,
    searchError,
    isAddingFriend,
    showConfirmationModal,
    selectedUser,
    canConfirm,
    selectedCount,

    // Actions
    setSearchText,
    setShowAddFriend,
    setUsername,
    toggle,
    selectGroup,
    switchTab,
    handleUsernameSearch,
    handleAddFriendClick,
    handleConfirmAdd,
    handleCancelAdd,
    handleConfirm,
  } = useMemberBillsLogic();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pilih Anggota</Text>
          {tab === "friends" ? (
            <TouchableOpacity 
              onPress={() => setShowAddFriend(true)}
              style={styles.headerAddButton}
              activeOpacity={0.7}
            >
              <Ionicons name="person-add" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
        
        <View style={styles.whiteModalContainer}>
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Pilih Peserta Tagihan</Text>
            <Text style={styles.sectionSubtitle}>Pilih teman atau grup untuk berbagi tagihan</Text>
            
            <TabNavigation activeTab={tab} onTabChange={switchTab} />

            {/* Selected Members Preview */}
            {selected.length > 0 && (
              <View style={styles.selectedSection}>
                <Text style={styles.selectedTitle}>
                  {tab === "groups" ? "Grup Dipilih" : "Teman Dipilih"} ({selected.length} {tab === "groups" ? "anggota" : "orang"})
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.selectedMembers}>
                    {tab === "groups" ? (
                      (() => {
                        const selectedGroup = groups.find((g: Group) => {
                          const memberIds = g.members?.map((m: any) => m.userId || m.id) || [];
                          return memberIds.length > 0 && memberIds.every(id => selected.includes(id)) && selected.length === memberIds.length;
                        });
                        if (!selectedGroup) return null;
                        
                        return selectedGroup.members?.map((member: any, index: number) => (
                          <View key={`group-member-${member.userId || member.id || index}`} style={styles.selectedFriend}>
                            <View style={styles.selectedFriendAvatar}>
                              <Text style={styles.selectedAvatarText}>
                                {(member.name || 'U').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <Text style={styles.selectedFriendName} numberOfLines={1}>{member.name || 'User'}</Text>
                          </View>
                        ));
                      })()
                    ) : (
                      filteredFriends.filter((f: Friend) => selected.includes(f.friend?.userId)).map((friend: Friend, index: number) => {
                        const friendId = friend.friend?.userId;
                        const friendName = friend.friend?.name;
                        return (
                          <View key={`selected-friend-${friendId || index}`} style={styles.selectedFriend}>
                            <View style={styles.selectedFriendAvatar}>
                              <Text style={styles.selectedAvatarText}>
                                {friendName?.charAt(0)?.toUpperCase() || 'U'}
                              </Text>
                              <TouchableOpacity
                                style={styles.removeFriendButton}
                                onPress={() => toggle(friendId)}
                              >
                                <Ionicons name="close" size={10} color={COLORS.white} />
                              </TouchableOpacity>
                            </View>
                            <Text style={styles.selectedFriendName} numberOfLines={1}>{friendName}</Text>
                          </View>
                        );
                      })
                    )}
                  </View>
                </ScrollView>
                {tab === "groups" && (
                  <TouchableOpacity
                    style={styles.cancelGroupButton}
                    onPress={() => setSelected([])}
                  >
                    <Text style={styles.cancelGroupText}>Batalkan Grup</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Search bar for friends */}
            {tab === "friends" && friends.length > 0 && (
              <View style={styles.searchContainer}>
                <View style={styles.searchIconContainer}>
                  <Ionicons name="search" size={20} color={COLORS.textSecondary} />
                </View>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Cari dari daftar teman..."
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholderTextColor={COLORS.textSecondary}
                />
              </View>
            )}

            {/* Content List */}
            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
              {tab === "groups" ? (
                loadingGroups ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.teal} />
                    <Text style={styles.loadingText}>Memuat grup...</Text>
                  </View>
                ) : groups.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={48} color={COLORS.textSecondary} />
                    <Text style={styles.emptyTitle}>Belum Ada Grup</Text>
                    <Text style={styles.emptySubtitle}>Buat grup terlebih dahulu untuk memudahkan berbagi tagihan</Text>
                  </View>
                ) : (
                  <View>
                    {groups.map((item: Group) => {
                      const memberIds = item.members?.map((m: any) => m.userId || m.id) || [];
                      const isSelected = memberIds.length > 0 && memberIds.every(id => selected.includes(id)) && selected.length === memberIds.length;
                      return (
                        <TouchableOpacity 
                          key={item.groupId} 
                          onPress={() => selectGroup(memberIds)} 
                          style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                          activeOpacity={0.7}
                        >
                          <View style={styles.itemLeft}>
                            <View style={[styles.groupIcon, isSelected && styles.groupIconSelected]}>
                              <Ionicons name="people" size={24} color={isSelected ? COLORS.teal : COLORS.white} />
                            </View>
                            <View style={styles.itemInfo}>
                              <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>{item.groupName}</Text>
                              <Text style={[styles.itemSubtext, isSelected && styles.itemSubtextSelected]}>
                                {memberIds.length} anggota
                              </Text>
                            </View>
                          </View>
                          <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                            {isSelected && <View style={styles.radioButtonInner} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )
              ) : (
                loadingFriends ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.teal} />
                    <Text style={styles.loadingText}>Memuat teman...</Text>
                  </View>
                ) : filteredFriends.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="person-add-outline" size={64} color={COLORS.textSecondary} />
                    <Text style={styles.emptyTitle}>
                      {searchText ? 'Teman Tidak Ditemukan' : 'Belum Ada Teman'}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      {searchText ? 'Coba kata kunci lain atau cari teman baru di atas' : 'Gunakan tombol "Cari & Tambah Teman Baru" di atas'}
                    </Text>
                  </View>
                ) : (
                  <View>
                    {filteredFriends.map((item: Friend) => {
                      const friendId = item.friend?.userId;
                      const friendName = item.friend?.name;
                      const isSelected = selected.includes(friendId);
                      return (
                        <TouchableOpacity 
                          key={friendId} 
                          onPress={() => toggle(friendId)} 
                          style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                          activeOpacity={0.7}
                        >
                          <View style={styles.itemLeft}>
                            <View style={[styles.friendAvatar, isSelected && styles.friendAvatarSelected]}>
                              <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
                                {friendName?.charAt(0)?.toUpperCase() || 'U'}
                              </Text>
                            </View>
                            <View style={styles.itemInfo}>
                              <Text style={[styles.itemName, isSelected && styles.itemNameSelected]}>{friendName}</Text>
                              <Text style={[styles.itemSubtext, isSelected && styles.itemSubtextSelected]}>Teman</Text>
                            </View>
                          </View>
                          <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
                            {isSelected && <View style={styles.radioButtonInner} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )
              )}
            </ScrollView>

            {/* Confirm Button */}
            <TouchableOpacity
              disabled={!canConfirm}
              onPress={handleConfirm}
              style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
              activeOpacity={0.8}
            >
              <View style={styles.confirmButtonContent}>
                {canConfirm && (
                  <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                )}
                <Text style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]}>
                  {canConfirm ? `Lanjut dengan ${selectedCount} ${tab === "groups" ? "anggota" : "orang"}` : 'Pilih minimal 1 peserta'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

// Simplified styles (keeping essential ones)
const styles = {
  container: { flex: 1, backgroundColor: COLORS.backgroundMain },
  safeArea: { flex: 1 },
  header: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  backButton: { padding: 5 },
  headerTitle: { fontSize: FONT_SIZES.xl, fontFamily: FONTS.bold, color: COLORS.textPrimary },
  placeholder: { width: 24 },
  headerAddButton: { padding: SPACING.xs, borderRadius: BORDER_RADIUS.sm },
  whiteModalContainer: { backgroundColor: COLORS.white, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, flex: 1 },
  content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  sectionSubtitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  selectedSection: { marginBottom: SPACING.sm, backgroundColor: "rgba(0, 137, 123, 0.05)", borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, borderWidth: 1, borderColor: "rgba(0, 137, 123, 0.2)" },
  selectedTitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.semiBold, color: COLORS.teal, marginBottom: SPACING.xs },
  selectedMembers: { flexDirection: "row" as const, alignItems: "center" as const, paddingVertical: SPACING.xs },
  selectedFriend: { alignItems: "center" as const, marginRight: SPACING.sm, position: "relative" as const, width: 60 },
  selectedFriendAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.teal, justifyContent: "center" as const, alignItems: "center" as const, marginBottom: 4, borderWidth: 1.5, borderColor: COLORS.teal },
  selectedAvatarText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.bold, color: COLORS.white },
  selectedFriendName: { fontSize: 10, fontFamily: FONTS.medium, color: COLORS.textPrimary, textAlign: "center" as const },
  removeFriendButton: { position: "absolute" as const, top: -4, right: -4, backgroundColor: COLORS.red, borderRadius: 8, width: 16, height: 16, justifyContent: "center" as const, alignItems: "center" as const },
  cancelGroupButton: { alignItems: "center" as const, justifyContent: "center" as const, marginTop: SPACING.sm, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.red },
  cancelGroupText: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.medium, color: COLORS.red },
  searchContainer: { position: "relative" as const, marginBottom: SPACING.md },
  searchInput: { backgroundColor: COLORS.inputBg, borderRadius: BORDER_RADIUS.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, paddingRight: 44, fontSize: FONT_SIZES.base, fontFamily: FONTS.regular, color: COLORS.textPrimary, borderWidth: 1, borderColor: COLORS.inputBorder },
  searchIconContainer: { position: "absolute" as const, right: SPACING.md, top: 0, bottom: 0, justifyContent: "center" as const, alignItems: "center" as const, zIndex: 1 },
  listContainer: { flex: 1, marginBottom: SPACING.md },
  loadingContainer: { flex: 1, justifyContent: "center" as const, alignItems: "center" as const, paddingVertical: 60 },
  loadingText: { marginTop: SPACING.md, fontSize: FONT_SIZES.base, fontFamily: FONTS.regular, color: COLORS.textSecondary },
  emptyContainer: { flex: 1, justifyContent: "center" as const, alignItems: "center" as const, paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.textPrimary, marginTop: SPACING.md, marginBottom: SPACING.xs, textAlign: "center" as const },
  emptySubtitle: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: "center" as const, lineHeight: 20, marginBottom: SPACING.md },
  itemCard: { backgroundColor: COLORS.surface, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.md, flexDirection: "row" as const, justifyContent: "space-between" as const, alignItems: "center" as const, borderWidth: 2, borderColor: COLORS.inputBorder },
  itemCardSelected: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  itemLeft: { flexDirection: "row" as const, alignItems: "center" as const, flex: 1 },
  groupIcon: { width: 48, height: 48, borderRadius: BORDER_RADIUS.lg, backgroundColor: COLORS.teal, justifyContent: "center" as const, alignItems: "center" as const, marginRight: SPACING.md },
  groupIconSelected: { backgroundColor: COLORS.white },
  friendAvatar: { width: 48, height: 48, borderRadius: BORDER_RADIUS.full, backgroundColor: COLORS.teal, justifyContent: "center" as const, alignItems: "center" as const, marginRight: SPACING.md },
  friendAvatarSelected: { backgroundColor: COLORS.white },
  avatarText: { fontSize: FONT_SIZES.lg, fontFamily: FONTS.bold, color: COLORS.white },
  avatarTextSelected: { color: COLORS.teal },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FONT_SIZES.base, fontFamily: FONTS.semiBold, color: COLORS.textPrimary },
  itemNameSelected: { color: COLORS.white },
  itemSubtext: { fontSize: FONT_SIZES.sm, fontFamily: FONTS.regular, color: COLORS.textSecondary, marginTop: 2 },
  itemSubtextSelected: { color: COLORS.white },
  radioButton: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: COLORS.inputBorder, justifyContent: "center" as const, alignItems: "center" as const, backgroundColor: COLORS.white },
  radioButtonSelected: { borderColor: COLORS.teal },
  radioButtonInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.teal },
  confirmButton: { backgroundColor: COLORS.teal, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: "center" as const, marginTop: SPACING.md, shadowColor: COLORS.teal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  confirmButtonDisabled: { backgroundColor: COLORS.disabled, shadowOpacity: 0, elevation: 0 },
  confirmButtonContent: { flexDirection: "row" as const, alignItems: "center" as const, gap: SPACING.xs },
  confirmText: { color: COLORS.white, fontFamily: FONTS.bold, fontSize: FONT_SIZES.base },
  confirmTextDisabled: { color: COLORS.textSecondary },
};