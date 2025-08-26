import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from "expo-router";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useBillStore } from "../../store/billStore";
import { useFriends, useGroups } from "../../hooks/useApi";
import { useFriendsStore } from "../../features/friends/friends.store";
import api from '../../services/api';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function MemberOfBills() {
  const { draft, setSelectedMembers } = useBillStore();
  const [tab, setTab] = useState<"groups" | "friends">("groups");
  const [selected, setSelected] = useState<string[]>(draft.selectedMemberIds);
  const [searchText, setSearchText] = useState('');
  
  const { friends, loading: loadingFriends, refetch: refetchFriends } = useFriends();
  const { groups, loading: loadingGroups } = useGroups(false);
  const { addFriend } = useFriendsStore();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const handleUsernameSearch = async () => {
    if (!username.trim()) {
      setSearchResults([]);
      setShowNoResults(false);
      setSearchError('');
      return;
    }

    setIsSearching(true);
    setShowNoResults(false);
    setSearchError('');
    
    try {
      const response = await api.get(`/api/mobile/friends/search?username=${encodeURIComponent(username)}`);
      const searchResult = response.data;
      
      if (searchResult.found && searchResult.canAddFriend) {
        const friendData = {
          id: searchResult.user.userId,
          name: searchResult.user.name,
          username: searchResult.user.username,
        };
        setSearchResults([friendData]);
        setShowNoResults(false);
        setSearchError('');
      } else if (searchResult.found && searchResult.isAlreadyFriend) {
        setSearchResults([]);
        setShowNoResults(false);
        setSearchError(`${searchResult.user.name} sudah menjadi teman Anda`);
      } else {
        setSearchResults([]);
        setShowNoResults(true);
        setSearchError('');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchError('');
      
      if (error.message?.includes('400') || error.response?.status === 400) {
        setShowNoResults(true);
      } else {
        setSearchError('Terjadi kesalahan saat mencari pengguna');
        setShowNoResults(false);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriendClick = (friend) => {
    setSelectedUser(friend);
    setShowConfirmationModal(true);
  };

  const handleConfirmAdd = async () => {
    if (!selectedUser) return;
    
    setIsAddingFriend(true);
    
    try {
      await api.post('/api/mobile/friends/add', {
        friendUserId: selectedUser.id
      });
      
      setShowConfirmationModal(false);
      setShowAddFriend(false);
      setUsername('');
      setSearchResults([]);
      setSelectedUser(null);
      await refetchFriends();
    } catch (error) {
      console.error('Add friend error:', error);
      setShowConfirmationModal(false);
      setSelectedUser(null);
      setSearchError('Gagal menambahkan teman. Silakan coba lagi.');
    } finally {
      setIsAddingFriend(false);
    }
  };

  const handleCancelAdd = () => {
    setShowConfirmationModal(false);
    setSelectedUser(null);
  };
  

  
  const filteredFriends = useMemo(() => {
    if (!searchText.trim()) return friends;
    return friends.filter(f => {
      const name = f.friend?.name || '';
      return name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [friends, searchText]);

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectGroup = (memberIds: string[]) => {
    setSelected(memberIds);
  };

  const switchTab = (newTab: "groups" | "friends") => {
    // Clear selections when switching tabs
    setSelected([]);
    setTab(newTab);
  };

  const canConfirm = selected.length > 0;
  const selectedCount = selected.length;

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
            
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                onPress={() => switchTab("groups")} 
                style={[styles.tabButton, tab === "groups" && styles.tabButtonActive]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="people" 
                  size={20} 
                  color={tab === "groups" ? COLORS.white : COLORS.teal} 
                />
                <Text style={[styles.tabText, tab === "groups" && styles.tabTextActive]}>Grup</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => switchTab("friends")} 
                style={[styles.tabButton, tab === "friends" && styles.tabButtonActive]}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="person" 
                  size={20} 
                  color={tab === "friends" ? COLORS.white : COLORS.teal} 
                />
                <Text style={[styles.tabText, tab === "friends" && styles.tabTextActive]}>Teman</Text>
              </TouchableOpacity>
            </View>
            


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
                        const selectedGroup = groups.find(g => {
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
                      filteredFriends.filter(f => selected.includes(f.friend?.userId)).map((friend, index) => {
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

            {/* Clear selection button for friends */}
            {tab === "friends" && selected.length > 0 && (
              <View style={styles.clearSelectionSection}>
                <TouchableOpacity 
                  onPress={() => setSelected([])}
                  style={styles.clearSelectionBtn}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={16} color={COLORS.red} />
                  <Text style={styles.clearSelectionText}>Batalkan pilihan ({selected.length})</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Add Friend Modal */}
            {showAddFriend && (
              <View style={styles.addFriendModal}>
                <View style={styles.addFriendContent}>
                  {/* Sticky Header */}
                  <View style={styles.stickyHeader}>
                    <Text style={styles.modalTitle}>Tambah Teman</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowAddFriend(false);
                        setUsername('');
                        setSearchResults([]);
                        setSearchError('');
                        setShowNoResults(false);
                      }}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Sticky Search Section */}
                  <View style={styles.stickySearchSection}>
                    <View style={styles.modalSearchInputContainer}>
                      <TextInput
                        style={styles.modalSearchInput}
                        placeholder="Masukkan username"
                        value={username}
                        onChangeText={setUsername}
                        onSubmitEditing={handleUsernameSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                        placeholderTextColor={COLORS.placeholder}
                      />
                      <TouchableOpacity style={styles.modalSearchIcon} onPress={handleUsernameSearch}>
                        {isSearching ? (
                          <ActivityIndicator size={20} color={COLORS.teal} />
                        ) : (
                          <Ionicons name="search" size={20} color={COLORS.teal} />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Scrollable Results */}
                  <ScrollView 
                    style={styles.modalScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modalScrollContent}
                  >
                    {isSearching ? (
                      <View style={styles.modalLoadingContainer}>
                        <ActivityIndicator size="large" color={COLORS.teal} />
                        <Text style={styles.modalLoadingText}>Mencari pengguna...</Text>
                      </View>
                    ) : searchResults.length > 0 ? (
                      <>
                        <Text style={styles.modalResultsTitle}>Hasil Pencarian ({searchResults.length})</Text>
                        {searchResults.map((user) => (
                          <View key={user.id} style={styles.modalSearchResultCard}>
                            <View style={styles.modalAvatar}>
                              <Text style={styles.modalAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={styles.modalUserInfo}>
                              <Text style={styles.modalFriendName}>{user.name}</Text>
                              <Text style={styles.modalFriendUsername}>@{user.username}</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.modalAddButton}
                              onPress={() => handleAddFriendClick(user)}
                            >
                              <Ionicons name="add" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </>
                    ) : searchError ? (
                      <View style={styles.modalEmptyState}>
                        <Ionicons name="people" size={64} color={COLORS.teal} />
                        <Text style={styles.modalEmptyTitle}>Sudah Berteman</Text>
                        <Text style={styles.modalEmptySubtitle}>{searchError}</Text>
                      </View>
                    ) : showNoResults ? (
                      <View style={styles.modalEmptyState}>
                        <Ionicons name="search-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.modalEmptyTitle}>Pengguna Tidak Ditemukan</Text>
                        <Text style={styles.modalEmptySubtitle}>Username "@{username}" tidak terdaftar di Splitr</Text>
                      </View>
                    ) : (
                      <View style={styles.modalEmptyState}>
                        <Ionicons name="person-add-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.modalEmptyTitle}>Cari Teman Baru</Text>
                        <Text style={styles.modalEmptySubtitle}>Masukkan username teman yang ingin ditambahkan</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            )}
            
            {/* Confirmation Modal */}
            {showConfirmationModal && (
              <View style={styles.addFriendModal}>
                <View style={styles.confirmationModal}>
                  <View style={styles.confirmationIconContainer}>
                    <Ionicons name="person-add" size={60} color={COLORS.teal} />
                  </View>
                  <Text style={styles.confirmationTitle}>Tambah Teman?</Text>
                  <Text style={styles.confirmationMessage}>Apakah Anda ingin menambahkan pengguna ini sebagai teman?</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={handleCancelAdd}
                    >
                      <Text style={styles.cancelButtonText}>Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.confirmAddButton, isAddingFriend && styles.disabledButton]}
                      onPress={handleConfirmAdd}
                      disabled={isAddingFriend}
                    >
                      {isAddingFriend ? (
                        <ActivityIndicator size={16} color={COLORS.white} />
                      ) : (
                        <Text style={styles.confirmAddButtonText}>Tambah</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            
            {/* Search bar for friends list only */}
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


            <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
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
                    {groups.map((item) => {
                      const memberIds = item.members?.map((m: any) => m.userId || m.id) || [];
                      const isSelected = memberIds.length > 0 && memberIds.every(id => selected.includes(id)) && selected.length === memberIds.length;
                      const memberNames = item.members?.slice(0, 3).map((m: any) => m.name || 'User').join(', ') || '';
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
                              <View style={styles.memberPreview}>
                                {item.members?.slice(0, 3).map((member: any, idx: number) => (
                                  <View key={`member-chip-${member.userId || member.id || idx}`} style={styles.memberChip}>
                                    <Text style={[styles.memberChipText, isSelected && styles.memberChipTextSelected]}>
                                      {member.name || 'User'}
                                    </Text>
                                  </View>
                                ))}
                                {memberIds.length > 3 && (
                                  <Text style={[styles.moreMembers, isSelected && styles.moreMembersSelected]}>
                                    +{memberIds.length - 3} lagi
                                  </Text>
                                )}
                              </View>
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
                    {filteredFriends.map((item) => {
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

          </View>
          
          <View style={styles.footer}>
            <TouchableOpacity
              disabled={!canConfirm}
              onPress={() => { 
                setSelectedMembers(selected); 
                router.push("/create-bill/split-bill"); 
              }}
              style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
              activeOpacity={0.8}
            >
              <View style={styles.confirmButtonContent}>
                {canConfirm && (
                  <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                )}
                <Text style={[styles.confirmText, !canConfirm && styles.confirmTextDisabled]} numberOfLines={2}>
                  {canConfirm ? 
                    (tab === "groups" ? 
                      `Lanjut dengan ${selectedCount} anggota` : 
                      `Lanjut dengan ${selectedCount} orang`
                    ) : 
                    'Pilih minimal 1 peserta'
                  }
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 24,
  },
  whiteModalContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    flex: 1,
    marginBottom: -50,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  tabButtonActive: {
    backgroundColor: COLORS.teal,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
    marginLeft: SPACING.xs,
  },
  tabTextActive: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  selectedText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: SPACING.md,
  },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingRight: 44,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchIconContainer: {
    position: 'absolute',
    right: SPACING.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  listContainer: {
    flex: 1,
    marginBottom: SPACING.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
  },
  itemCardSelected: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAddButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  clearSelectionSection: {
    marginBottom: SPACING.sm,
  },
  clearSelectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.red,
    gap: SPACING.xs,
  },
  clearSelectionText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.red,
  },
  selectedSection: {
    marginBottom: SPACING.sm,
    backgroundColor: "rgba(0, 137, 123, 0.05)",
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: "rgba(0, 137, 123, 0.2)",
  },
  selectedTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
    marginBottom: SPACING.xs,
  },
  selectedMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  selectedGroup: {
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
    width: 80,
  },
  selectedGroupIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.teal,
  },
  selectedGroupName: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  selectedFriend: {
    alignItems: 'center',
    marginRight: SPACING.sm,
    position: 'relative',
    width: 60,
  },
  selectedFriendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: COLORS.teal,
  },
  selectedAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  selectedFriendName: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: -2,
    right: 4,
    backgroundColor: COLORS.red,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelGroupButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.red,
  },
  cancelGroupText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.red,
  },
  selectedGroupCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.teal,
    marginBottom: SPACING.sm,
  },
  removeGroupButton: {
    padding: SPACING.xs,
  },
  membersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
  },
  selectedGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  selectedGroupIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  selectedGroupInfo: {
    flex: 1,
  },
  selectedGroupName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  selectedGroupCount: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  memberNamesContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
  },
  memberNamesTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.semiBold,
    color: COLORS.teal,
    marginBottom: SPACING.xs,
  },
  memberNamesList: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  selectedFriendsScroll: {
    maxHeight: 60,
  },
  selectedFriendsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingRight: SPACING.md,
  },
  selectedFriendCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.teal,
    minWidth: 70,
    position: 'relative',
  },
  selectedFriendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  selectedAvatarText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  selectedFriendName: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    numberOfLines: 1,
  },
  removeFriendButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.red,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: COLORS.red,
    borderRadius: BORDER_RADIUS.sm,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.xs,
  },

  addFriendBtn: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  addFriendModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    paddingHorizontal: SPACING.lg,
  },
  addFriendContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    maxWidth: 400,
    height: '70%',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  stickyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.inputBorder,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  stickySearchSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.white,
    zIndex: 10,
  },
  modalSearchInputContainer: {
    position: 'relative',
  },
  modalSearchInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    paddingRight: 50,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  modalSearchIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  modalScrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingRight: 50,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  modalResultsTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  modalLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  modalLoadingText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  resultsTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  modalSearchResultCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  modalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  modalUserInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  modalFriendName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  modalFriendUsername: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  modalEmptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  modalEmptySubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  confirmationModal: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.xl,
    alignItems: 'center',
    margin: SPACING.lg,
    width: '80%',
  },
  confirmationIconContainer: {
    marginBottom: SPACING.md,
  },
  confirmationTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  confirmationMessage: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  confirmAddButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
  },
  confirmAddButtonText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.6,
  },

  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  groupIconSelected: {
    backgroundColor: COLORS.white,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  friendAvatarSelected: {
    backgroundColor: COLORS.white,
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  avatarTextSelected: {
    color: COLORS.teal,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  itemNameSelected: {
    color: COLORS.white,
  },
  itemSubtext: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemSubtextSelected: {
    color: COLORS.white,
  },
  membersList: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontStyle: 'italic',
  },
  membersListSelected: {
    color: COLORS.white,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  radioButtonSelected: {
    borderColor: COLORS.teal,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.teal,
  },
  memberPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  memberChip: {
    backgroundColor: 'rgba(0, 137, 123, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 137, 123, 0.2)',
  },
  memberChipText: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },
  memberChipTextSelected: {
    color: COLORS.white,
  },
  moreMembers: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  moreMembersSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.md,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: 70,
    backgroundColor: COLORS.white,
  },
  confirmButton: {
    backgroundColor: COLORS.teal,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  confirmText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.base,
  },
  confirmTextDisabled: {
    color: COLORS.textSecondary,
  },
});