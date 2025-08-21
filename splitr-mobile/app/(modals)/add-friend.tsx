import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Modal, Image } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { useFriends } from '../../hooks/useApi';
import api from '../../services/api';

const personImages = [
  require("../../assets/images/person1.png"),
  require("../../assets/images/person2.png"),
  require("../../assets/images/person3.png"),
  require("../../assets/images/person4.png"),
];

interface Friend {
  id: string;
  profilePhoto?: string;
  name: string;
  username: string;
}

interface SearchResult {
  found: boolean;
  user: {
    userId: string;
    username: string;
    name: string;
    email: string;
    accountNumber: string;
  };
  isAlreadyFriend: boolean;
  canAddFriend: boolean;
}

export default function TambahTeman() {
  const [username, setUsername] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isDeletingFriend, setIsDeletingFriend] = useState(false);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [forceLoading, setForceLoading] = useState(true);
  
  const { friends: apiFriends, loading: isLoadingFriends, refetch } = useFriends();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedFriend, setAddedFriend] = useState<Friend | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);

  // Transform API friends data to match our Friend interface
  const addedFriends = useMemo(() => 
    apiFriends.map((friendData: any) => ({
      id: friendData.friend.userId,
      name: friendData.friend.name,
      username: friendData.friend.username || friendData.friend.name.toLowerCase().replace(/\s+/g, ''),
      profilePhoto: friendData.friend.profilePhoto
    })), [apiFriends]
  );

  useEffect(() => {
    if (friendSearch.trim() === '') {
      setFilteredFriends([...addedFriends].sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      const filtered = addedFriends.filter(friend => 
        friend.username.toLowerCase().includes(friendSearch.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
      setFilteredFriends(filtered);
    }
  }, [friendSearch, addedFriends]);

  useEffect(() => {
    setTimeout(() => setForceLoading(false), 1700);
  }, []);





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
      // Add 1.5 second delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await api.get(`/api/mobile/friends/search?username=${encodeURIComponent(username)}`);
      const searchResult: SearchResult = response.data;
      
      if (searchResult.found && searchResult.canAddFriend) {
        const friendData: Friend = {
          id: searchResult.user.userId,
          name: searchResult.user.name,
          username: searchResult.user.username,
          profilePhoto: undefined
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
    } catch (error: any) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchError('');
      
      // Check if it's a 400 error (user not found)
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

  const handleAddFriendClick = (friend: Friend) => {
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
      setAddedFriend(selectedUser);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setSearchResults(prev => prev.filter(f => f.id !== selectedUser.id));
        setShowSuccessModal(false);
        setAddedFriend(null);
        setSelectedUser(null);
        refetch(); // Refresh friends list from API
      }, 2000);
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

  const handleDeleteClick = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFriend) return;
    
    setIsDeletingFriend(true);
    
    try {
      await api.delete(`/api/mobile/friends/remove/${selectedFriend.id}`);
      
      setShowDeleteModal(false);
      setSelectedFriend(null);
      refetch(); // Refresh friends list from API
    } catch (error) {
      console.error('Delete friend error:', error);
      setShowDeleteModal(false);
      setSelectedFriend(null);
      // Could add error toast/alert here if needed
    } finally {
      setIsDeletingFriend(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedFriend(null);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const renderEmptyFriends = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>Belum Ada Teman</Text>
      <Text style={styles.emptySubtitle}>Tambahkan teman baru dengan mencari username</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.purpleSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Teman</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <View style={styles.whiteModalContainer}>
          {/* Sticky Add Friend Section */}
          <View style={styles.stickySection}>
            <Text style={styles.sectionTitle}>Tambahkan Teman</Text>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Masukkan username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.searchIcon} onPress={handleUsernameSearch}>
                {isSearching ? (
                  <ActivityIndicator size={20} color={COLORS.teal} />
                ) : (
                  <Ionicons name="search" size={20} color={COLORS.teal} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Search Results */}
          {(searchResults.length > 0 || showNoResults || searchError) && (
            <View style={styles.searchResultsContainer}>
              <ScrollView 
                style={styles.searchResultsScroll}
                showsVerticalScrollIndicator={false}
              >
                {isSearching ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.teal} />
                    <Text style={styles.loadingText}>Mencari pengguna...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <>
                    <Text style={styles.resultsTitle}>Hasil Pencarian ({searchResults.length})</Text>
                    {searchResults.map((user) => (
                      <View key={user.id} style={styles.searchResultCard}>
                        {user.profilePhoto ? (
                          <Image 
                            source={{ uri: user.profilePhoto }} 
                            style={styles.profileImage}
                            onError={() => {}}
                          />
                        ) : (
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                          </View>
                        )}
                        <View style={styles.userInfo}>
                          <Text style={styles.friendName}>{user.name}</Text>
                          <Text style={styles.friendUsername}>@{user.username}</Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.addButton}
                          onPress={() => handleAddFriendClick(user)}
                        >
                          <Ionicons name="add" size={20} color={COLORS.white} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </>
                ) : searchError ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people" size={64} color={COLORS.teal} />
                    <Text style={styles.emptyTitle}>Sudah Berteman</Text>
                    <Text style={styles.emptySubtitle}>{searchError}</Text>
                  </View>
                ) : showNoResults ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={64} color={COLORS.gray} />
                    <Text style={styles.emptyTitle}>Pengguna Tidak Ditemukan</Text>
                    <Text style={styles.emptySubtitle}>Username "@{username}" tidak terdaftar di Splitr</Text>
                  </View>
                ) : null}
              </ScrollView>
            </View>
          )}

          {/* Sticky Friends List Section */}
          <View style={styles.stickySectionWithMargin}>
            <Text style={styles.sectionTitle}>Daftar Teman ({addedFriends.length})</Text>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Cari teman"
                value={friendSearch}
                onChangeText={setFriendSearch}
                placeholderTextColor={COLORS.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.searchIcon}>
                <Ionicons name="search" size={20} color={COLORS.teal} />
              </View>
            </View>
          </View>

          {/* Scrollable Friends List */}
          <View style={styles.friendsListContainer}>
            <ScrollView 
              style={styles.friendsListScroll}
              showsVerticalScrollIndicator={false}
            >
              {isLoadingFriends || forceLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.teal} />
                  <Text style={styles.loadingText}>Memuat daftar teman...</Text>
                </View>
              ) : filteredFriends.length === 0 ? (
                renderEmptyFriends()
              ) : (
                filteredFriends.map((friend, index) => (
                  <View key={friend.id} style={styles.friendCard}>
                    <Image
                      source={personImages[index % 4]}
                      style={styles.profileImage}
                    />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendUsername}>@{friend.username}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => handleDeleteClick(friend)}
                    >
                      <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
        
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.teal} />
              </View>
              <Text style={styles.successTitle}>Yeay!</Text>
              <Text style={styles.successMessage}>Teman berhasil ditambahkan</Text>
              {addedFriend && (
                <View style={styles.friendPreview}>
                  <Image
                    source={personImages[0]}
                    style={styles.previewImage}
                  />
                  <View>
                    <Text style={styles.previewName}>{addedFriend.name}</Text>
                    <Text style={styles.previewUsername}>@{addedFriend.username}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={showConfirmationModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
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
        </Modal>

        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModal}>
              <View style={styles.warningIconContainer}>
                <Ionicons name="warning" size={60} color={COLORS.orange} />
              </View>
              <Text style={styles.deleteTitle}>Hapus Teman?</Text>
              <Text style={styles.deleteMessage}>Anda yakin ingin menghapus teman ini ?</Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={handleCancelDelete}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.confirmDeleteButton, isDeletingFriend && styles.disabledButton]}
                  onPress={handleConfirmDelete}
                  disabled={isDeletingFriend}
                >
                  {isDeletingFriend ? (
                    <ActivityIndicator size={16} color={COLORS.white} />
                  ) : (
                    <Text style={styles.confirmDeleteButtonText}>Hapus</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  purpleSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -50,
  },
  stickySection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.white,
    zIndex: 10,
  },
  stickySectionWithMargin: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    marginTop: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.white,
    zIndex: 10,
  },
  searchResultsContainer: {
    flex: 1,
    maxHeight: 180,
    backgroundColor: COLORS.white,
  },
  searchResultsScroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  friendsListContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  friendsListScroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  searchInputContainer: {
    position: 'relative',
  },
  searchInput: {
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
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  friendCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  friendUsername: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  deleteButton: {
    padding: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 4,
  },
  searchResultCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  friendPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  previewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  previewUsername: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  deleteModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  warningIconContainer: {
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: COLORS.red,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  confirmationModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmationIconContainer: {
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  confirmationMessage: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmAddButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
  },
  confirmAddButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  disabledButton: {
    opacity: 0.6,
  },
});