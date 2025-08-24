import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
  FlatList,
  Modal,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
import {
  wp,
  hp,
  rf,
  getSpacing,
  getBorderRadius,
  getIconSize,
} from "../../../utils/responsive";
import { useApi } from "../../../hooks/useApi";
import { useGroupsStore } from "../../../store";
import { friendsAPI } from "../../../services";

const personImages = [
  require("../../../assets/images/person1.png"),
  require("../../../assets/images/person2.png"),
  require("../../../assets/images/person3.png"),
  require("../../../assets/images/person4.png"),
];

export default function GroupDetailScreen() {
  let params;
  try {
    params = useLocalSearchParams();
  } catch (error) {
    console.error('Error getting params:', error);
    params = {};
  }
  
  // Safe JSON parsing with error handling
  const groupData = React.useMemo(() => {
    try {
      return params.groupData ? JSON.parse(params.groupData as string) : null;
    } catch (error) {
      console.error('Error parsing groupData:', error);
      return null;
    }
  }, [params.groupData]);
  
  const groupId = params.groupId as string;

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
  const [members, setMembers] = useState<any[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [showConfirmFriendModal, setShowConfirmFriendModal] = useState(false);
  const [showSuccessFriendModal, setShowSuccessFriendModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddMemberSuccessModal, setShowAddMemberSuccessModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [selectedFriendToAdd, setSelectedFriendToAdd] = useState<any>(null);
  const [friendsList, setFriendsList] = useState<string[]>(["creator"]);
  const [myFriends, setMyFriends] = useState<any[]>([]);
  const [availableFriends, setAvailableFriends] = useState<any[]>([]);
  const [friendsLoaded, setFriendsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isGroupDeleted, setIsGroupDeleted] = useState(false);

  // Use currentGroup from store if available
  const displayGroup = currentGroup || groupData;

  // Fetch group detail if needed
  useEffect(() => {
    if (isGroupDeleted) return; // Don't fetch if group is deleted
    
    console.log('Detail screen params:', { groupId, groupData: groupData?.groupId });
    
    // Clear current group cache first
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
          // Group not found - show alert and go back
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
        avatar: member.avatar || personImages[index % 4],
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
          isCurrentUser: groupData?.isCreator || false,
        },
        {
          id: "pending-1",
          name: "Ahmad Rizki",
          status: "pending",
          avatar: personImages[1],
          isCurrentUser: false,
        },
        {
          id: "pending-2",
          name: "Sari Dewi",
          status: "pending",
          avatar: personImages[2],
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
      
      const friendIds = friendsData.map((f: any) => f.friend.userId);
      setFriendsList(["creator", ...friendIds]);
      
      // Filter available friends immediately
      if (members.length > 0) {
        const currentMemberIds = members.map(m => m.id);
        const available = friendsData.filter((f: any) => 
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

  // Update available friends when members change (only if friends already loaded)
  useEffect(() => {
    if (friendsLoaded && myFriends.length > 0 && members.length > 0 && !isGroupDeleted) {
      const currentMemberIds = members.map(m => m.id);
      const available = myFriends.filter((f: any) => 
        !currentMemberIds.includes(f.friend.userId)
      );
      setAvailableFriends(available);
    }
  }, [members, myFriends, friendsLoaded, isGroupDeleted]);

  // Functions
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

  const deleteGroup = async () => {
    try {
      setIsGroupDeleted(true);
      await apiDeleteGroup(displayGroup?.groupId);
      
      // Smooth transition: close delete modal first
      setShowDeleteModal(false);
      
      // Wait for delete modal to close, then show success
      setTimeout(() => {
        setShowSuccessModal(true);
        
        // Auto close success modal and navigate back
        setTimeout(() => {
          setShowSuccessModal(false);
          
          // Wait for success modal to close before navigating
          setTimeout(() => {
            if (router.canGoBack()) { router.back(); } else { router.replace("/(modals)/groups"); }
          }, 200);
        }, 1200);
      }, 300);
    } catch (error) {
      console.error("Error deleting group:", error);
      setShowDeleteModal(false);
      setIsGroupDeleted(false);
    }
  };

  const addMember = async () => {
    // Fetch friends only when modal is opened
    if (!friendsLoaded) {
      await fetchFriendsForAddMember();
    }
    setShowAddMemberModal(true);
  };

  const confirmAddMember = async () => {
    if (!selectedFriendToAdd) return;
    
    try {
      await apiAddMember(displayGroup?.groupId, selectedFriendToAdd.friend.userId);
      
      setShowAddMemberModal(false);
      setShowAddMemberSuccessModal(true);
      
      // Refresh data immediately after API success
      if (displayGroup?.groupId) {
        fetchGroupDetail(displayGroup.groupId);
      }
      
      // Close success modal
      setTimeout(() => {
        setShowAddMemberSuccessModal(false);
        setSelectedFriendToAdd(null);
      }, 1000);
    } catch (error) {
      console.error("Error adding member:", error);
      setShowAddMemberModal(false);
      setSelectedFriendToAdd(null);
    }
  };

  const leaveGroup = async () => {
    try {
      setIsGroupDeleted(true);
      await apiLeaveGroup(displayGroup?.groupId);
      
      // Smooth transition: close delete modal first
      setShowDeleteModal(false);
      
      // Wait for delete modal to close, then show success
      setTimeout(() => {
        setShowSuccessModal(true);
        
        // Auto close success modal and navigate back
        setTimeout(() => {
          setShowSuccessModal(false);
          
          // Wait for success modal to close before navigating
          setTimeout(() => {
            if (router.canGoBack()) { router.back(); } else { router.replace("/(modals)/groups"); }
          }, 200);
        }, 1200);
      }, 300);
    } catch (error) {
      console.error("Error leaving group:", error);
      setShowDeleteModal(false);
      setIsGroupDeleted(false);
    }
  };

  const showRemoveMemberConfirmation = (member: any) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await apiRemoveMember(displayGroup?.groupId, memberToRemove.id);
      
      // Immediately update local members state
      setMembers(prev => prev.filter(member => member.id !== memberToRemove.id));
      
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
    }
  };

  const checkIsFriend = (userId: string) => {
    const member = displayGroup?.members?.find((m: any) => (m.userId || m.id) === userId);
    return member?.isFriend || friendsList.includes(userId);
  };

  const canAddAsFriend = (userId: string) => {
    const member = displayGroup?.members?.find((m: any) => (m.userId || m.id) === userId);
    return member?.canAddFriend !== false && !checkIsFriend(userId) && userId !== "creator";
  };

  const openConfirmModal = (friendData: any) => {
    setSelectedFriend(friendData);
    setShowConfirmFriendModal(true);
  };

  const addFriend = async () => {
    if (!selectedFriend) return;
    
    try {
      await addFriendFromGroup(displayGroup?.groupId, selectedFriend.id);
      
      setFriendsList(prev => [...prev, selectedFriend.id]);
      
      setMembers(prev => prev.map(member => 
        member.id === selectedFriend.id 
          ? { ...member, isFriend: true, canAddFriend: false }
          : member
      ));
      
      setShowConfirmFriendModal(false);
      setShowSuccessFriendModal(true);
      
      setTimeout(() => {
        setShowSuccessFriendModal(false);
        setSelectedFriend(null);
      }, 500);
    } catch (error) {
      console.error("Error adding friend:", error);
      setShowConfirmFriendModal(false);
      setSelectedFriend(null);
    }
  };

  const isCurrentUser = (member: any) => {
    return (member.id === "creator" && displayGroup?.isCreator) || 
           member.name === "You" || 
           member.isCurrentUser ||
           (displayGroup?.isCreator && member.isCreator);
  };

  const renderMember = ({ item }: { item: any }) => (
    <View style={styles.memberItem}>
      <Image source={item.avatar} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <View style={styles.memberNameContainer}>
          <Text style={styles.memberName}>{item.name}</Text>
          {(item.isCreator || item.id === "creator") && isCurrentUser(item) ? (
            <View style={styles.youHostBadge}>
              <Text style={styles.youHostBadgeText}>You as Host</Text>
            </View>
          ) : (item.isCreator || item.id === "creator") ? (
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>Host</Text>
            </View>
          ) : isCurrentUser(item) ? (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>You</Text>
            </View>
          ) : null}
        </View>
        {item.status === "pending" && (
          <Text style={styles.pendingLabel}>Menunggu konfirmasi</Text>
        )}
      </View>
      {!displayGroup?.isCreator && canAddAsFriend(item.id) && !isCurrentUser(item) && (
        <TouchableOpacity
          style={styles.addFriendButton}
          onPress={() => openConfirmModal(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.addFriendText}>Add Friend</Text>
        </TouchableOpacity>
      )}
      {item.id !== "creator" && displayGroup?.isCreator && !isCurrentUser(item) && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => showRemoveMemberConfirmation(item)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="trash-outline"
            size={getIconSize(16)}
            color="#FF3B30"
          />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            clearCurrentGroup();
            if (router.canGoBack()) {
              if (router.canGoBack()) { router.back(); } else { router.replace("/(modals)/groups"); }
            } else {
              router.replace('/(modals)/groups');
            }
          }}>
            <Ionicons
              name="arrow-back"
              size={getIconSize(24)}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Grup</Text>
          <View style={{ width: getIconSize(24) }} />
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Group Info Card */}
            <View style={styles.groupInfoCard}>
              <Text style={styles.groupTitle}>{groupName || "Makan Bersama"}</Text>
              <Text style={styles.groupSubtitle}>
                Dibuat oleh{" "}
                {displayGroup?.isCreator
                  ? "You"
                  : displayGroup?.creatorName || "Hanis"}
              </Text>
            </View>

            {/* Group Name Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nama Grup</Text>
                {displayGroup?.isCreator && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      if (isEditing) {
                        updateGroupName();
                      } else {
                        setIsEditing(true);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isEditing ? "checkmark" : "pencil"}
                      size={getIconSize(16)}
                      color="#00897B"
                    />
                    <Text style={styles.editButtonText}>
                      {isEditing ? "Simpan" : "Edit"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {displayGroup?.isCreator && isEditing ? (
                <TextInput
                  style={styles.input}
                  value={groupName}
                  onChangeText={setGroupName}
                  onSubmitEditing={updateGroupName}
                  placeholder="Masukkan nama grup"
                  placeholderTextColor={COLORS.placeholder}
                  autoFocus={true}
                  selectTextOnFocus={true}
                  returnKeyType="done"
                />
              ) : (
                <View style={styles.groupNameDisplay}>
                  <Text style={styles.groupNameText}>{groupName || "Makan Bersama"}</Text>
                </View>
              )}
            </View>

            {/* Group Description Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Deskripsi Grup</Text>
                {displayGroup?.isCreator && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      if (isEditingDescription) {
                        updateGroupDescription();
                      } else {
                        setIsEditingDescription(true);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isEditingDescription ? "checkmark" : "pencil"}
                      size={getIconSize(16)}
                      color="#00897B"
                    />
                    <Text style={styles.editButtonText}>
                      {isEditingDescription ? "Simpan" : "Edit"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {displayGroup?.isCreator && isEditingDescription ? (
                <TextInput
                  style={styles.textArea}
                  value={groupDescription}
                  onChangeText={setGroupDescription}
                  onSubmitEditing={updateGroupDescription}
                  placeholder="Masukkan deskripsi grup"
                  placeholderTextColor={COLORS.placeholder}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  autoFocus={true}
                />
              ) : (
                <View style={styles.groupDescriptionDisplay}>
                  <Text style={styles.groupDescriptionText}>{groupDescription || "Deskripsi grup belum diatur"}</Text>
                </View>
              )}
            </View>

            {/* Members Section */}
            <View style={styles.section}>
              <View style={styles.membersHeader}>
                <Text style={styles.sectionTitle}>Anggota Grup</Text>
                <Text style={styles.memberCount}>
                  {members.length} anggota
                </Text>
              </View>
              <FlatList
                data={members}
                renderItem={renderMember}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                scrollEnabled={false}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
            {displayGroup?.isCreator ? (
              <>
                {/* Create Bill Button */}
                <TouchableOpacity
                  style={styles.createBillButton}
                  onPress={() => {
                    console.log("Create bill for group:", displayGroup?.groupId);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={getIconSize(20)}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.createBillButtonText}>Buat Bill</Text>
                </TouchableOpacity>

                {/* Add Member Button */}
                <TouchableOpacity
                  style={styles.addMemberButton}
                  onPress={addMember}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={getIconSize(20)}
                    color="#00897B"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.addMemberButtonText}>Tambah</Text>
                </TouchableOpacity>

                {/* Delete Group Button */}
                <TouchableOpacity
                  style={styles.deleteGroupButton}
                  onPress={() => setShowDeleteModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={getIconSize(18)}
                    color="#FF3B30"
                  />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Create Bill Button for Members */}
                <TouchableOpacity
                  style={styles.createBillButtonMember}
                  onPress={() => {
                    console.log("Create bill for group:", displayGroup?.groupId);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={getIconSize(20)}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.createBillButtonText}>Buat Bill</Text>
                </TouchableOpacity>

                {/* Leave Group Button */}
                <TouchableOpacity
                  style={styles.leaveGroupButton}
                  onPress={() => setShowDeleteModal(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="exit-outline"
                    size={getIconSize(20)}
                    color="#FF3B30"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.leaveGroupButtonText}>Keluar</Text>
                </TouchableOpacity>
              </>
            )}
            </View>

          </ScrollView>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
        >
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.deleteModal}>
              <View style={styles.warningIcon}>
                <Ionicons
                  name="warning"
                  size={getIconSize(40)}
                  color="#FF9500"
                />
              </View>
              <Text style={styles.deleteTitle}>
                {displayGroup?.isCreator ? "Hapus Grup?" : "Keluar Grup?"}
              </Text>
              <Text style={styles.deleteMessage}>
                {displayGroup?.isCreator 
                  ? "Anda yakin ingin menghapus grup ini ?" 
                  : "Anda yakin ingin keluar dari grup ini?"}
              </Text>
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowDeleteModal(false);
                    setIsGroupDeleted(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmDeleteButton, (isDeleting || isUpdating) && styles.buttonDisabled]}
                  onPress={displayGroup?.isCreator ? deleteGroup : leaveGroup}
                  disabled={isDeleting || isUpdating}
                >
                  <Text style={styles.confirmDeleteText}>
                    {(isDeleting || isUpdating) 
                      ? (displayGroup?.isCreator ? "Menghapus..." : "Keluar...") 
                      : (displayGroup?.isCreator ? "Hapus" : "Keluar")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="slide"
        >
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={getIconSize(60)}
                  color="#00897B"
                />
              </View>
              <Text style={styles.successTitle}>
                {displayGroup?.isCreator ? "Grup Berhasil dihapus" : "Berhasil keluar dari grup"}
              </Text>
            </View>
          </BlurView>
        </Modal>

        {/* Remove Member Confirmation Modal */}
        <Modal
          visible={showRemoveMemberModal}
          transparent={true}
          animationType="fade"
        >
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.deleteModal}>
              <View style={styles.warningIcon}>
                <Ionicons
                  name="warning"
                  size={getIconSize(40)}
                  color="#FF9500"
                />
              </View>
              <Text style={styles.deleteTitle}>Hapus Anggota?</Text>
              <Text style={styles.deleteMessage}>
                Apakah Anda yakin ingin menghapus {memberToRemove?.name} dari grup ini?
              </Text>
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowRemoveMemberModal(false);
                    setMemberToRemove(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={confirmRemoveMember}
                >
                  <Text style={styles.confirmDeleteText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>

        {/* Confirm Add Friend Modal */}
        <Modal
          visible={showConfirmFriendModal}
          transparent={true}
          animationType="fade"
        >
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.deleteModal}>
              <View style={styles.friendIcon}>
                <Ionicons
                  name="person-add"
                  size={getIconSize(40)}
                  color="#00897B"
                />
              </View>
              <Text style={styles.deleteMessage}>
                Apakah anda yakin menambahkan {selectedFriend?.name} sebagai teman?
              </Text>
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowConfirmFriendModal(false);
                    setSelectedFriend(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Tidak</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmFriendButton}
                  onPress={addFriend}
                >
                  <Text style={styles.confirmFriendText}>Ya</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>

        {/* Success Add Friend Modal */}
        <Modal
          visible={showSuccessFriendModal}
          transparent={true}
          animationType="fade"
        >
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={getIconSize(60)}
                  color="#00897B"
                />
              </View>
              <Text style={styles.successTitle}>
                {selectedFriend?.name} sudah berhasil ditambahkan
              </Text>
            </View>
          </BlurView>
        </Modal>

        {/* Add Member Modal */}
        <Modal
          visible={showAddMemberModal}
          transparent={true}
          animationType="slide"
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalBackdrop}>
              <View style={styles.addMemberModal}>
                <View style={styles.addMemberHeader}>
                  <Text style={styles.addMemberTitle}>Tambah Anggota</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddMemberModal(false);
                      setSelectedFriendToAdd(null);
                    }}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.addMemberSubtitle}>Pilih teman untuk ditambahkan ke grup</Text>
                
                <FlatList
                  data={availableFriends}
                  keyExtractor={(item, index) => `${item.friend.userId}-${index}`}
                  style={styles.friendsList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.friendItem,
                        selectedFriendToAdd?.friend.userId === item.friend.userId && styles.friendItemSelected
                      ]}
                      onPress={() => setSelectedFriendToAdd(item)}
                      activeOpacity={0.7}
                    >
                      <Image source={item.friend.avatar || personImages[0]} style={styles.friendAvatar} />
                      <Text style={styles.friendName}>{item.friend.name}</Text>
                      {selectedFriendToAdd?.friend.userId === item.friend.userId && (
                        <Ionicons name="checkmark-circle" size={20} color="#00897B" />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyFriendsContainer}>
                      <Ionicons name="people-outline" size={48} color={COLORS.textSecondary} />
                      <Text style={styles.emptyFriendsText}>Tidak ada teman yang bisa ditambahkan</Text>
                      <Text style={styles.emptyFriendsSubtext}>Semua teman sudah ada di grup ini</Text>
                    </View>
                  }
                />
                
                <View style={styles.addMemberActions}>
                  <TouchableOpacity
                    style={styles.cancelAddButton}
                    onPress={() => {
                      setShowAddMemberModal(false);
                      setSelectedFriendToAdd(null);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelAddButtonText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmAddButton,
                      !selectedFriendToAdd && styles.confirmAddButtonDisabled
                    ]}
                    onPress={confirmAddMember}
                    disabled={!selectedFriendToAdd || isUpdating}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmAddButtonText}>
                      {isUpdating ? "Menambahkan..." : "Tambah"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Add Member Success Modal */}
        <Modal
          visible={showAddMemberSuccessModal}
          transparent={true}
          animationType="fade"
        >
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={getIconSize(60)}
                  color="#00897B"
                />
              </View>
              <Text style={styles.successTitle}>
                {selectedFriendToAdd?.friend.name} berhasil ditambahkan ke grup
              </Text>
            </View>
          </BlurView>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const LOCAL_COLORS = {
  background: "#A6D3CE",
  cardBrown: COLORS.card,
  cardWhite: COLORS.white,
  orange: COLORS.orange,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  headerBrown: "#00897B",
  gray: COLORS.gray,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: rf(FONT_SIZES.xl),
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  groupInfoCard: {
    backgroundColor: "#A6D3CE",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  groupTitle: {
    fontSize: rf(20),
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: getSpacing(4),
  },
  groupSubtitle: {
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.black,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: rf(FONT_SIZES.lg),
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  membersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getSpacing(12),
  },
  memberCount: {
    fontSize: rf(12),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getSpacing(12),
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
    borderRadius: getBorderRadius(16),
    borderWidth: 1,
    borderColor: "#00897B",
  },
  editButtonText: {
    fontSize: rf(12),
    fontFamily: FONTS.semiBold,
    color: "#00897B",
    marginLeft: getSpacing(4),
  },
  groupNameDisplay: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  groupNameText: {
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  textArea: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    minHeight: 80,
  },
  groupDescriptionDisplay: {
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    minHeight: 80,
  },
  groupDescriptionText: {
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(14),
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(10),
    marginBottom: getSpacing(6),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  memberAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: getSpacing(12),
  },
  memberInfo: {
    flex: 1,
  },
  memberNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: getSpacing(2),
  },
  memberName: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginRight: getSpacing(8),
  },
  hostBadge: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: getSpacing(6),
    paddingVertical: getSpacing(2),
    borderRadius: getBorderRadius(8),
  },
  hostBadgeText: {
    fontSize: rf(10),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  youBadge: {
    backgroundColor: "#FF9500",
    paddingHorizontal: getSpacing(6),
    paddingVertical: getSpacing(2),
    borderRadius: getBorderRadius(8),
  },
  youBadgeText: {
    fontSize: rf(10),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  youHostBadge: {
    backgroundColor: COLORS.teal,
    paddingHorizontal: getSpacing(8),
    paddingVertical: getSpacing(2),
    borderRadius: getBorderRadius(8),
  },
  youHostBadgeText: {
    fontSize: rf(10),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  pendingLabel: {
    fontSize: rf(12),
    fontFamily: FONTS.regular,
    color: "#FF9500",
    marginTop: getSpacing(2),
  },
  addFriendButton: {
    backgroundColor: "rgba(0, 137, 123, 0.1)",
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
    borderRadius: getBorderRadius(16),
    borderWidth: 1,
    borderColor: "rgba(0, 137, 123, 0.3)",
  },
  addFriendText: {
    fontSize: rf(12),
    fontFamily: FONTS.semiBold,
    color: "#00897B",
  },
  removeButton: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(20),
    gap: getSpacing(12),
  },
  buttonIcon: {
    marginRight: getSpacing(6),
  },
  createBillButton: {
    flex: 2,
    backgroundColor: "#00897B",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00897B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  createBillButtonText: {
    fontSize: rf(15),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  addMemberButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: "#00897B",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addMemberButtonText: {
    fontSize: rf(14),
    fontFamily: FONTS.semiBold,
    color: "#00897B",
  },
  deleteGroupButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.3)",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(14),
    paddingHorizontal: getSpacing(16),
    alignItems: "center",
    justifyContent: "center",
  },
  createBillButtonMember: {
    flex: 2,
    backgroundColor: "#00897B",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00897B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  leaveGroupButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: "#FF3B30",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leaveGroupButtonText: {
    fontSize: rf(14),
    fontFamily: FONTS.semiBold,
    color: "#FF3B30",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModal: {
    backgroundColor: COLORS.white,
    borderRadius: getBorderRadius(24),
    padding: getSpacing(32),
    alignItems: "center",
    marginHorizontal: getSpacing(40),
    minWidth: wp(70),
  },
  warningIcon: {
    marginBottom: getSpacing(16),
  },
  deleteTitle: {
    fontSize: rf(FONT_SIZES.xl),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: getSpacing(SPACING.sm),
  },
  deleteMessage: {
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: getSpacing(24),
  },
  deleteActions: {
    flexDirection: "row",
    gap: getSpacing(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmDeleteText: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  successModal: {
    backgroundColor: "#A6D3CE",
    borderRadius: getBorderRadius(24),
    padding: getSpacing(40),
    alignItems: "center",
    marginHorizontal: getSpacing(40),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  successIcon: {
    marginBottom: getSpacing(16),
  },
  successTitle: {
    fontSize: rf(18),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: "center",
  },
  friendIcon: {
    marginBottom: getSpacing(16),
  },
  confirmFriendButton: {
    flex: 1,
    backgroundColor: "#00897B",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    alignItems: "center",
  },
  confirmFriendText: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  addMemberModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: getBorderRadius(24),
    borderTopRightRadius: getBorderRadius(24),
    paddingTop: getSpacing(20),
    paddingHorizontal: getSpacing(20),
    maxHeight: hp(85),
    minHeight: hp(50),
  },
  closeButton: {
    padding: getSpacing(4),
  },
  addMemberHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: getSpacing(16),
  },
  addMemberTitle: {
    fontSize: rf(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  addMemberSubtitle: {
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: getSpacing(20),
  },
  friendsList: {
    flex: 1,
    marginBottom: getSpacing(20),
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(16),
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(8),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  friendItemSelected: {
    borderColor: "#00897B",
    backgroundColor: "rgba(0, 137, 123, 0.05)",
  },
  friendAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginRight: getSpacing(12),
  },
  friendName: {
    flex: 1,
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  emptyFriendsContainer: {
    alignItems: "center",
    paddingVertical: getSpacing(40),
  },
  emptyFriendsText: {
    textAlign: "center",
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: getSpacing(12),
  },
  emptyFriendsSubtext: {
    textAlign: "center",
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: getSpacing(4),
  },
  addMemberActions: {
    flexDirection: "row",
    gap: getSpacing(12),
    paddingBottom: getSpacing(20),
  },
  cancelAddButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    alignItems: "center",
  },
  cancelAddButtonText: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  confirmAddButton: {
    flex: 1,
    backgroundColor: "#00897B",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    alignItems: "center",
  },
  confirmAddButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  confirmAddButtonText: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
});