import { useState, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { useFriends } from '../../../../hooks/useApi';
import api from '../../../../services/api';
import type { Friend, SearchResult } from '../types';

export const useAddFriendLogic = () => {
  const [username, setUsername] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [isDeletingFriend, setIsDeletingFriend] = useState(false);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
  
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
      profilePhoto: friendData.friend.profilePhotoUrl || friendData.friend.profilePhoto || friendData.friend.avatar
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
        refetch();
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
      refetch();
    } catch (error) {
      console.error('Delete friend error:', error);
      setShowDeleteModal(false);
      setSelectedFriend(null);
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

  return {
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
    setShowSuccessModal,
    setShowDeleteModal,
    setShowConfirmationModal,
    
    // Handlers
    handleUsernameSearch,
    handleAddFriendClick,
    handleConfirmAdd,
    handleCancelAdd,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleBack,
  };
};