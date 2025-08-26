import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/theme';
import UserAvatar from '../../../../components/ui/UserAvatar';
import type { Friend } from '../types';
import { styles } from '../styles';

interface SearchSectionProps {
  username: string;
  onUsernameChange: (text: string) => void;
  onSearch: () => void;
  isSearching: boolean;
  searchResults: Friend[];
  showNoResults: boolean;
  searchError: string;
  onAddFriend: (friend: Friend) => void;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  username,
  onUsernameChange,
  onSearch,
  isSearching,
  searchResults,
  showNoResults,
  searchError,
  onAddFriend,
}) => {
  return (
    <>
      <View style={styles.stickySection}>
        <Text style={styles.sectionTitle}>Tambahkan Teman</Text>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Masukkan username"
            value={username}
            onChangeText={onUsernameChange}
            placeholderTextColor={COLORS.placeholder}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.searchIcon} onPress={onSearch}>
            {isSearching ? (
              <ActivityIndicator size={20} color={COLORS.teal} />
            ) : (
              <Ionicons name="search" size={20} color={COLORS.teal} />
            )}
          </TouchableOpacity>
        </View>
      </View>

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
                    <UserAvatar 
                      photoUrl={user.profilePhoto}
                      name={user.name}
                      size={50}
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.friendName}>{user.name}</Text>
                      <Text style={styles.friendUsername}>@{user.username}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => onAddFriend(user)}
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
    </>
  );
};