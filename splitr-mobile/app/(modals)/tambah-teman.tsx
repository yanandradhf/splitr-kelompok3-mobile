import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Modal, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';

interface Friend {
  id: string;
  profilePhoto?: string;
  name: string;
  username: string;
}

export default function TambahTeman() {
  const [username, setUsername] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedFriends, setAddedFriends] = useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [addedFriend, setAddedFriend] = useState<Friend | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);

  useEffect(() => {
    loadAddedFriends();
  }, []);

  useEffect(() => {
    if (friendSearch.trim() === '') {
      setFilteredFriends(addedFriends.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      const filtered = addedFriends.filter(friend => 
        friend.username.toLowerCase().includes(friendSearch.toLowerCase())
      ).sort((a, b) => a.name.localeCompare(b.name));
      setFilteredFriends(filtered);
    }
  }, [friendSearch, addedFriends]);

  const loadAddedFriends = async () => {
    setIsLoadingFriends(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockAddedFriends: Friend[] = [
        { id: '1', name: 'Nabila Sari', username: 'nanabila', profilePhoto: 'https://i.pravatar.cc/150?img=1' },
        { id: '2', name: 'Yana Putri', username: 'yanana', profilePhoto: 'https://i.pravatar.cc/150?img=2' },
        { id: '3', name: 'Cicilia Indah', username: 'cicil' },
        { id: '4', name: 'Citra Panjaitan', username: 'citrapan', profilePhoto: 'https://i.pravatar.cc/150?img=4' },
        { id: '5', name: 'Ivana Isdi', username: 'vanadi' },
        {id: '6', name: 'Diyaa Noventino', username: 'diyanoven'},
        {id: '7', name: 'Haqul Ulhaq', username: 'haqul'} 
      ];
      
      const sortedFriends = mockAddedFriends.sort((a, b) => a.name.localeCompare(b.name));
      setAddedFriends(sortedFriends);
      setFilteredFriends(sortedFriends);
    } catch (error) {
      console.error('Load friends error:', error);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  useEffect(() => {
    if (username.trim() === '') {
      setSearchResults([]);
      return;
    }
    
    const searchTimer = setTimeout(() => {
      handleUsernameSearch();
    }, 500);
    
    return () => clearTimeout(searchTimer);
  }, [username]);

  const handleUsernameSearch = async () => {
    if (!username.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockSearchResults: Friend[] = [
        { id: '10', name: 'Ilham Sipasi', username: 'ilhampasi', profilePhoto: 'https://i.pravatar.cc/150?img=10' },
        { id: '11', name: 'Ahmad Rizki', username: 'ahmadrizki' },
        { id: '12', name: 'Sari Indah', username: 'sariindah', profilePhoto: 'https://i.pravatar.cc/150?img=12' },
      ].filter(user => 
        user.username.toLowerCase().includes(username.toLowerCase())
      );
      
      setSearchResults(mockSearchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriendClick = (friend: Friend) => {
    setSelectedUser(friend);
    setShowConfirmationModal(true);
  };

  const handleConfirmAdd = () => {
    if (selectedUser) {
      setShowConfirmationModal(false);
      setAddedFriend(selectedUser);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setAddedFriends(prev => [...prev, selectedUser]);
        setFilteredFriends(prev => [...prev, selectedUser]);
        setSearchResults(prev => prev.filter(f => f.id !== selectedUser.id));
        setShowSuccessModal(false);
        setAddedFriend(null);
        setSelectedUser(null);
      }, 2000);
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

  const handleConfirmDelete = () => {
    if (selectedFriend) {
      setAddedFriends(prev => prev.filter(f => f.id !== selectedFriend.id));
      setFilteredFriends(prev => prev.filter(f => f.id !== selectedFriend.id));
    }
    setShowDeleteModal(false);
    setSelectedFriend(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedFriend(null);
  };

  const handleBack = () => {
    router.back();
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
              <View style={styles.searchIcon}>
                {isSearching ? (
                  <ActivityIndicator size={20} color={COLORS.teal} />
                ) : (
                  <Ionicons name="search" size={20} color={COLORS.teal} />
                )}
              </View>
            </View>
          </View>

          {/* Scrollable Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              <ScrollView 
                style={styles.searchResultsScroll}
                showsVerticalScrollIndicator={false}
              >
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
              {isLoadingFriends ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.teal} />
                  <Text style={styles.loadingText}>Memuat daftar teman...</Text>
                </View>
              ) : filteredFriends.length === 0 ? (
                renderEmptyFriends()
              ) : (
                filteredFriends.map((friend) => (
                  <View key={friend.id} style={styles.friendCard}>
                    {friend.profilePhoto ? (
                      <Image 
                        source={{ uri: friend.profilePhoto }} 
                        style={styles.profileImage}
                        onError={() => {}}
                      />
                    ) : (
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{friend.name.charAt(0).toUpperCase()}</Text>
                      </View>
                    )}
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
                  {addedFriend.profilePhoto ? (
                    <Image 
                      source={{ uri: addedFriend.profilePhoto }} 
                      style={styles.previewImage}
                      onError={() => {}}
                    />
                  ) : (
                    <View style={styles.previewAvatar}>
                      <Text style={styles.avatarText}>{addedFriend.name.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
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
                  style={styles.confirmAddButton}
                  onPress={handleConfirmAdd}
                >
                  <Text style={styles.confirmAddButtonText}>Tambah</Text>
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
                  style={styles.confirmDeleteButton}
                  onPress={handleConfirmDelete}
                >
                  <Text style={styles.confirmDeleteButtonText}>Hapus</Text>
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
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  friendUsername: {
    fontSize: 14,
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
});