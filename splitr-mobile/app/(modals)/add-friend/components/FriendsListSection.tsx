import React from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import UserAvatar from '../../../../components/ui/UserAvatar';
import type { Friend } from '../types';
import { styles } from '../styles';

interface FriendsListSectionProps {
  friendSearch: string;
  onFriendSearchChange: (text: string) => void;
  filteredFriends: Friend[];
  addedFriends: Friend[];
  isLoadingFriends: boolean;
  onDeleteFriend: (friend: Friend) => void;
}

export const FriendsListSection: React.FC<FriendsListSectionProps> = ({
  friendSearch,
  onFriendSearchChange,
  filteredFriends,
  addedFriends,
  isLoadingFriends,
  onDeleteFriend,
}) => {
  const renderEmptyFriends = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>Belum Ada Teman</Text>
      <Text style={styles.emptySubtitle}>Tambahkan teman baru dengan mencari username</Text>
    </View>
  );

  return (
    <>
      <View style={styles.stickySectionWithMargin}>
        <Text style={styles.sectionTitle}>Daftar Teman ({addedFriends.length})</Text>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari teman"
            value={friendSearch}
            onChangeText={onFriendSearchChange}
            placeholderTextColor={COLORS.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={20} color={COLORS.teal} />
          </View>
        </View>
      </View>

      <View style={styles.friendsListContainer}>
        <ScrollView 
          style={styles.friendsListScroll}
          contentContainerStyle={styles.friendsListContent}
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
                <UserAvatar 
                  photoUrl={friend.profilePhoto}
                  name={friend.name}
                  size={50}
                />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendUsername}>@{friend.username}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => onDeleteFriend(friend)}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
};