import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useGroupsStore } from "../../../../../store";
import { friendsAPI } from "../../../../../services";
import { GroupData, GroupMember, FriendData } from "../types";

const personImages = [
  require("../../../../../assets/images/person1.png"),
  require("../../../../../assets/images/person2.png"),
  require("../../../../../assets/images/person3.png"),
  require("../../../../../assets/images/person4.png"),
];

export const useGroupDetailLogic = (groupId: string, groupData: GroupData | null) => {
  const {
    currentGroup,
    isUpdating,
    isDeleting,
    fetchGroupDetail,
    editGroup,
    deleteGroup: apiDeleteGroup,
    leaveGroup: apiLeaveGroup,
    removeMember: apiRemoveMember,
    addMember: apiAddMember,
    addFriendFromGroup,
    clearCurrentGroup
  } = useGroupsStore();

  // State variables
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showConfirmFriendModal, setShowConfirmFriendModal] = useState(false);
  const [showSuccessFriendModal, setShowSuccessFriendModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddMemberSuccessModal, setShowAddMemberSuccessModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<GroupMember | null>(null);
  const [selectedFriendToAdd, setSelectedFriendToAdd] = useState<FriendData | null>(null);
  const [friendsList, setFriendsList] = useState<string[]>(["creator"]);
  const [myFriends, setMyFriends] = useState<FriendData[]>([]);
  const [availableFriends, setAvailableFriends] = useState<FriendData[]>([]);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isGroupDeleted, setIsGroupDeleted] = useState(false);

  // Use currentGroup from store if available
  const displayGroup = currentGroup || groupData;

  // Fetch group detail if needed
  useEffect(() => {
    if (isGroupDeleted) return;
    
    console.log('Detail screen params:', { groupId, groupData: groupData?.groupId });
    
    clearCurrentGroup();
    
    const fetchData = async () => {
      try {
        if (groupId) {
          console.log('Fetching by groupId:', groupId);
          await fetchGroupDetail(groupId);
        } else if (groupData?.groupId) {
          console.log('Fetching by groupData.groupId:', groupData.groupId);
          await fetchGroupDetail(groupData.groupId);
        }
      } catch (error) {
        console.error('Error fetching group detail:', error);
        if (error.response?.status === 404) {
          Alert.alert(
            'Grup Tidak Ditemukan',
            'Grup ini sudah dihapus atau Anda sudah dikeluarkan dari grup.',
            [
              {
                text: 'OK',
                onPress: () => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(modals)/groups');
                  }
                }
              }
            ]
          );
        }
      }
    };
    
    fetchData();
  }, [groupId, groupData?.groupId, isGroupDeleted]);

  // Update local state when displayGroup changes
  useEffect(() => {
    if (displayGroup) {
      setGroupName(displayGroup.groupName || "Makan Bersama");
      setGroupDescription(displayGroup.description || displayGroup.groupDescription || "Deskripsi grup belum diatur");
    }
  }, [displayGroup]);

  // Update members state when displayGroup changes
  useEffect(() => {
    if (displayGroup?.members && Array.isArray(displayGroup.members)) {
      const actualMembers = displayGroup.members.map((member: any, index: number) => ({
        id: member.userId || member.id || `member-${index}`,
        name: member.name || member.username || `Member ${index + 1}`,
        status: member.status || "active",
        avatar: member.profilePhotoUrl || member.avatar,
        isCreator: member.isCreator || false,
        isFriend: member.isFriend || false,
        canAddFriend: member.canAddFriend || false,
        isCurrentUser: member.isCurrentUser || (displayGroup?.isCreator && member.isCreator),
      }));
      setMembers(actualMembers);
    } else {
      // Fallback members
      setMembers([
        {
          id: "creator",
          name: groupData?.creatorName || "Host",
          status: "active",
          avatar: personImages[0],
          isCreator: true,
          isFriend: false,
          canAddFriend: false,
          isCurrentUser: groupData?.isCreator || false,
        },
        {
          id: "pending-1",
          name: "Ahmad Rizki",
          status: "pending",
          avatar: personImages[1],
          isCreator: false,
          isFriend: false,
          canAddFriend: true,
          isCurrentUser: false,
        },
        {
          id: "pending-2",
          name: "Sari Dewi",
          status: "pending",
          avatar: personImages[2],
          isCreator: false,
          isFriend: false,
          canAddFriend: true,
          isCurrentUser: false,
        },
      ]);
    }
  }, [displayGroup?.members]);

  // Fetch friends list - only when add member modal is opened
  const fetchFriendsForAddMember = async () => {
    if (isGroupDeleted || friendsLoaded) return;
    
    try {
      const response = await friendsAPI.getFriends();
      const friendsData = response.data.friends || [];
      setMyFriends(friendsData);
      
      const friendIds = friendsData.map((f: FriendData) => f.friend.userId);
      setFriendsList(["creator", ...friendIds]);
      
      // Filter available friends immediately
      if (members.length > 0) {
        const currentMemberIds = members.map(m => m.id);
        const available = friendsData.filter((f: FriendData) => 
          !currentMemberIds.includes(f.friend.userId)
        );
        setAvailableFriends(available);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setFriendsLoaded(true);
    }
  };

  // Update available friends when members change
  useEffect(() => {
    if (friendsLoaded && myFriends.length > 0 && members.length > 0 && !isGroupDeleted) {
      const currentMemberIds = members.map(m => m.id);
      const available = myFriends.filter((f: FriendData) => 
        !currentMemberIds.includes(f.friend.userId)
      );
      setAvailableFriends(available);
    }
  }, [members, myFriends, friendsLoaded, isGroupDeleted]);

  const updateGroupName = async () => {
    if (groupName.trim().length === 0) {
      setGroupName(displayGroup?.groupName || "Makan Bersama");
      setIsEditing(false);
      return;
    }

    try {
      await editGroup(displayGroup?.groupId, {
        groupName: groupName.trim(),
        description: groupDescription
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating group name:", error);
      setGroupName(displayGroup?.groupName || "Makan Bersama");
      setIsEditing(false);
    }
  };

  const updateGroupDescription = async () => {
    try {
      await editGroup(displayGroup?.groupId, {
        groupName: groupName,
        description: groupDescription.trim()
      });
      setIsEditingDescription(false);
    } catch (error) {
      console.error("Error updating group description:", error);
      setGroupDescription(displayGroup?.description || displayGroup?.groupDescription || "Deskripsi grup belum diatur");
      setIsEditingDescription(false);
    }
  };

  const isCurrentUser = (member: GroupMember) => {
    return (member.id === "creator" && displayGroup?.isCreator) || 
           member.name === "You" || 
           member.isCurrentUser ||
           (displayGroup?.isCreator && member.isCreator);
  };

  const checkIsFriend = (userId: string) => {
    const member = displayGroup?.members?.find((m: any) => (m.userId || m.id) === userId);
    return member?.isFriend || friendsList.includes(userId);
  };

  const canAddAsFriend = (userId: string) => {
    const member = displayGroup?.members?.find((m: any) => (m.userId || m.id) === userId);
    return member?.canAddFriend !== false && !checkIsFriend(userId) && userId !== "creator";
  };

  return {
    // State
    displayGroup,
    groupName,
    groupDescription,
    members,
    showDeleteModal,
    showSuccessModal,
    showRemoveMemberModal,
    showConfirmFriendModal,
    showSuccessFriendModal,
    showAddMemberModal,
    showAddMemberSuccessModal,
    memberToRemove,
    selectedFriend,
    selectedFriendToAdd,
    availableFriends,
    isEditing,
    isEditingDescription,
    isUpdating,
    isDeleting,

    // Actions
    setGroupName,
    setGroupDescription,
    setIsEditing,
    setIsEditingDescription,
    setShowDeleteModal,
    setShowSuccessModal,
    setShowRemoveMemberModal,
    setShowConfirmFriendModal,
    setShowSuccessFriendModal,
    setShowAddMemberModal,
    setShowAddMemberSuccessModal,
    setMemberToRemove,
    setSelectedFriend,
    setSelectedFriendToAdd,
    setIsGroupDeleted,
    updateGroupName,
    updateGroupDescription,
    fetchFriendsForAddMember,

    // Utils
    isCurrentUser,
    canAddAsFriend,

    // API Actions
    apiDeleteGroup,
    apiLeaveGroup,
    apiRemoveMember,
    apiAddMember,
    addFriendFromGroup,
    fetchGroupDetail,
    clearCurrentGroup,
  };
};