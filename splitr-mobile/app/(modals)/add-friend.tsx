import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

// Components
import { SearchSection } from './add-friend/components/SearchSection';
import { FriendsListSection } from './add-friend/components/FriendsListSection';
import { Modals } from './add-friend/components/Modals';

// Hooks & Utils
import { useAddFriendLogic } from './add-friend/hooks/useAddFriendLogic';

// Styles
import { styles } from './add-friend/styles';

export default function TambahTeman() {
  const {
    // State
    username,
    friendSearch,
    searchResults,
    isSearching,
    showNoResults,
    searchError,
    isAddingFriend,
    isDeletingFriend,
    filteredFriends,
    isLoadingFriends,
    showSuccessModal,
    addedFriend,
    showDeleteModal,
    selectedFriend,
    showConfirmationModal,
    selectedUser,
    addedFriends,
    
    // Actions
    setUsername,
    setFriendSearch,
    
    // Handlers
    handleUsernameSearch,
    handleAddFriendClick,
    handleConfirmAdd,
    handleCancelAdd,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleBack,
  } = useAddFriendLogic();



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
          <SearchSection
            username={username}
            onUsernameChange={setUsername}
            onSearch={handleUsernameSearch}
            isSearching={isSearching}
            searchResults={searchResults}
            showNoResults={showNoResults}
            searchError={searchError}
            onAddFriend={handleAddFriendClick}
          />

          <FriendsListSection
            friendSearch={friendSearch}
            onFriendSearchChange={setFriendSearch}
            filteredFriends={filteredFriends}
            addedFriends={addedFriends}
            isLoadingFriends={isLoadingFriends}
            onDeleteFriend={handleDeleteClick}
          />
        </View>
        
        <Modals
          showSuccessModal={showSuccessModal}
          addedFriend={addedFriend}
          showConfirmationModal={showConfirmationModal}
          selectedUser={selectedUser}
          isAddingFriend={isAddingFriend}
          onConfirmAdd={handleConfirmAdd}
          onCancelAdd={handleCancelAdd}
          showDeleteModal={showDeleteModal}
          selectedFriend={selectedFriend}
          isDeletingFriend={isDeletingFriend}
          onConfirmDelete={handleConfirmDelete}
          onCancelDelete={handleCancelDelete}
        />
      </SafeAreaView>
    </View>
  );
}

