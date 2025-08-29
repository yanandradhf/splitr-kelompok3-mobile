import { useState, useMemo } from "react";
import { router } from "expo-router";
import { useBillStore } from "../../../../store/billStore";
import { useFriends, useGroups } from "../../../../hooks/useApi";
import { useFriendsStore } from "../../../../features/friends/friends.store";
import api from "../../../../services/api";
import { Friend, Group, SearchUser } from "../types";

export const useMemberBillsLogic = () => {
  const { draft, setSelectedMembers } = useBillStore();
  const [tab, setTab] = useState<"groups" | "friends">("groups");
  const [selected, setSelected] = useState<string[]>(draft.selectedMemberIds);
  const [searchText, setSearchText] = useState('');
  
  const { friends, loading: loadingFriends, refetch: refetchFriends } = useFriends();
  const { groups, loading: loadingGroups } = useGroups(false);
  const { addFriend } = useFriendsStore();
  
  // Add friend modal states
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isAddingFriend, setIsAddingFriend] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  const filteredFriends = useMemo(() => {
    if (!searchText.trim()) return friends;
    return friends.filter((f: Friend) => {
      const name = f.friend?.name || '';
      return name.toLowerCase().includes(searchText.toLowerCase());
    });
  }, [friends, searchText]);

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

  const handleAddFriendClick = (friend: SearchUser) => {
    console.log('handleAddFriendClick called with:', friend);
    setSelectedUser(friend);
    setShowAddFriend(false); // Close add friend modal first
    setShowConfirmationModal(true);
    console.log('Confirmation modal should show now');
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
    setShowAddFriend(true); // Reopen add friend modal
  };

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const selectGroup = (memberIds: string[]) => {
    setSelected(memberIds);
  };

  const switchTab = (newTab: "groups" | "friends") => {
    setSelected([]);
    setTab(newTab);
  };

  const canConfirm = selected.length > 0;
  const selectedCount = selected.length;

  const handleConfirm = () => {
    setSelectedMembers(selected);
    router.push("/create-bill/split-bill");
  };

  return {
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
    setTab,
    setSelected,
    setSearchText,
    setShowAddFriend,
    setUsername,
    setSearchResults,
    setShowNoResults,
    setSearchError,
    toggle,
    selectGroup,
    switchTab,
    handleUsernameSearch,
    handleAddFriendClick,
    handleConfirmAdd,
    handleCancelAdd,
    handleConfirm,
  };
};