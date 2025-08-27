import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS } from "../../../constants/theme";
import UserAvatar from "../../../components/ui/UserAvatar";
import { wp, rf, getSpacing, getBorderRadius, getIconSize } from "../../../utils/responsive";

// Components
import { GroupInfoCard } from "./detail/components/GroupInfoCard";
import { EditableSection } from "./detail/components/EditableSection";
import { MembersSection } from "./detail/components/MembersSection";
import { ActionButtons } from "./detail/components/ActionButtons";

// Hooks & Utils
import { useGroupDetailLogic } from "./detail/hooks/useGroupDetailLogic";

// Styles
import { groupDetailStyles } from "./detail/styles";
import { GroupData, FriendData } from "./detail/types";

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
  } = useGroupDetailLogic(groupId, groupData);

  // Action handlers
  const deleteGroup = async () => {
    try {
      setIsGroupDeleted(true);
      await apiDeleteGroup(displayGroup?.groupId);
      
      setShowDeleteModal(false);
      setTimeout(() => {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
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

  const leaveGroup = async () => {
    try {
      setIsGroupDeleted(true);
      await apiLeaveGroup(displayGroup?.groupId);
      
      setShowDeleteModal(false);
      setTimeout(() => {
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
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

  const addMember = async () => {
    if (!fetchFriendsForAddMember) {
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
      
      if (displayGroup?.groupId) {
        fetchGroupDetail(displayGroup.groupId);
      }
      
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

  const showRemoveMemberConfirmation = (member: any) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    
    try {
      await apiRemoveMember(displayGroup?.groupId, memberToRemove.id);
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error("Error removing member:", error);
      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
    }
  };

  const openConfirmModal = (friendData: any) => {
    setSelectedFriend(friendData);
    setShowConfirmFriendModal(true);
  };

  const addFriend = async () => {
    if (!selectedFriend) return;
    
    try {
      await addFriendFromGroup(displayGroup?.groupId, selectedFriend.id);
      
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

  return (
    <View style={groupDetailStyles.container}>
      <SafeAreaView style={groupDetailStyles.safeArea}>
        {/* Header */}
        <View style={groupDetailStyles.header}>
          <TouchableOpacity onPress={() => {
            clearCurrentGroup();
            if (router.canGoBack()) {
              router.back();
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
          <Text style={groupDetailStyles.headerTitle}>Detail Grup</Text>
          <View style={{ width: getIconSize(24) }} />
        </View>

        {/* White Modal Container */}
        <View style={groupDetailStyles.whiteModalContainer}>
          <ScrollView
            contentContainerStyle={groupDetailStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GroupInfoCard
              groupName={groupName}
              displayGroup={displayGroup}
            />

            <EditableSection
              title="Nama Grup"
              value={groupName}
              isEditing={isEditing}
              isCreator={displayGroup?.isCreator || false}
              placeholder="Masukkan nama grup"
              onValueChange={setGroupName}
              onToggleEdit={() => {
                if (isEditing) {
                  updateGroupName();
                } else {
                  setIsEditing(true);
                }
              }}
            />

            <EditableSection
              title="Deskripsi Grup"
              value={groupDescription}
              isEditing={isEditingDescription}
              isCreator={displayGroup?.isCreator || false}
              multiline={true}
              placeholder="Masukkan deskripsi grup"
              onValueChange={setGroupDescription}
              onToggleEdit={() => {
                if (isEditingDescription) {
                  updateGroupDescription();
                } else {
                  setIsEditingDescription(true);
                }
              }}
            />

            <MembersSection
              members={members}
              displayGroup={displayGroup}
              onAddFriend={openConfirmModal}
              onRemoveMember={showRemoveMemberConfirmation}
              isCurrentUser={isCurrentUser}
              canAddAsFriend={canAddAsFriend}
            />

            <ActionButtons
              displayGroup={displayGroup}
              onAddMember={addMember}
              onDeleteGroup={() => setShowDeleteModal(true)}
            />
          </ScrollView>
        </View>

        {/* All Modals */}
        {/* Delete Confirmation Modal */}
        <Modal visible={showDeleteModal} transparent={true} animationType="fade">
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.deleteModal}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={getIconSize(40)} color="#FF9500" />
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
        <Modal visible={showSuccessModal} transparent={true} animationType="slide">
          <BlurView intensity={20} style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={getIconSize(60)} color="#00897B" />
              </View>
              <Text style={styles.successTitle}>
                {displayGroup?.isCreator ? "Grup Berhasil dihapus" : "Berhasil keluar dari grup"}
              </Text>
            </View>
          </BlurView>
        </Modal>

        {/* Other modals would go here with similar structure... */}
      </SafeAreaView>
    </View>
  );
}

// Simplified styles for modals (keeping essential ones)
const styles = {
  modalOverlay: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  deleteModal: {
    backgroundColor: COLORS.white,
    borderRadius: getBorderRadius(24),
    padding: getSpacing(32),
    alignItems: "center" as const,
    marginHorizontal: getSpacing(40),
    minWidth: wp(70),
  },
  warningIcon: {
    marginBottom: getSpacing(16),
  },
  deleteTitle: {
    fontSize: rf(20),
    fontWeight: "bold" as const,
    color: COLORS.textPrimary,
    marginBottom: getSpacing(8),
  },
  deleteMessage: {
    fontSize: rf(14),
    color: COLORS.textSecondary,
    textAlign: "center" as const,
    marginBottom: getSpacing(24),
  },
  deleteActions: {
    flexDirection: "row" as const,
    gap: getSpacing(12),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontSize: rf(16),
    fontWeight: "600" as const,
    color: COLORS.textSecondary,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    alignItems: "center" as const,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  confirmDeleteText: {
    fontSize: rf(16),
    fontWeight: "600" as const,
    color: COLORS.white,
  },
  successModal: {
    backgroundColor: "#A6D3CE",
    borderRadius: getBorderRadius(24),
    padding: getSpacing(40),
    alignItems: "center" as const,
    marginHorizontal: getSpacing(40),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    marginBottom: getSpacing(16),
  },
  successTitle: {
    fontSize: rf(18),
    fontWeight: "bold" as const,
    color: COLORS.white,
    textAlign: "center" as const,
  },
};