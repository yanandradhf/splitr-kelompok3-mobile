import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS } from "../../../constants/theme";
import {
  wp,
  hp,
  rf,
  getSpacing,
  getBorderRadius,
  getIconSize,
} from "../../../utils/responsive";
import { useApi } from "../../../hooks/useApi";

const personImages = [
  require("../../../assets/images/person1.png"),
  require("../../../assets/images/person2.png"),
  require("../../../assets/images/person3.png"),
  require("../../../assets/images/person4.png"),
];

export default function GroupDetailScreen() {
  const params = useLocalSearchParams();
  const groupData = params.groupData
    ? JSON.parse(params.groupData as string)
    : null;

  const [groupName, setGroupName] = useState(
    groupData?.groupName || "Makan Bersama"
  );
  const [members, setMembers] = useState(() => {
    if (groupData?.members && Array.isArray(groupData.members)) {
      // Use actual members from group data
      const actualMembers = groupData.members.map(
        (member: any, index: number) => ({
          id: member.id || `member-${index}`,
          name: member.name || member.username || `Member ${index + 1}`,
          status: member.status || "active",
          avatar: member.avatar || personImages[index % 4],
        })
      );

      // Add creator as first member if not already included
      const creatorExists = actualMembers.some(
        (m: any) => m.name === "You" || m.name === groupData.creatorName
      );

      if (!creatorExists) {
        actualMembers.unshift({
          id: "creator",
          name: groupData?.isCreator ? "You" : groupData?.creatorName || "Host",
          status: "active",
          avatar: personImages[0],
        });
      }

      return actualMembers;
    }

    // Fallback for empty or missing members
    return [
      {
        id: "creator",
        name: groupData?.isCreator ? "You" : groupData?.creatorName || "Host",
        status: "active",
        avatar: personImages[0],
      },
      {
        id: "pending-1",
        name: "Ahmad Rizki",
        status: "pending",
        avatar: personImages[1],
      },
      {
        id: "pending-2",
        name: "Sari Dewi",
        status: "pending",
        avatar: personImages[2],
      },
    ];
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { updateGroup: apiUpdateGroup, deleteGroup: apiDeleteGroup } = useApi();

  const updateGroupName = async () => {
    if (groupName.trim().length === 0) {
      setGroupName(groupData?.groupName || "Makan Bersama");
      setIsEditing(false);
      return;
    }

    try {
      setLoading(true);

      // TODO: Replace with actual API call
      // const response = await api.put(`/api/mobile/groups/${groupData?.groupId}`, {
      //   groupName: groupName.trim()
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Group name updated successfully:", groupName);

      // Update global state for groups list
      if (typeof global === "undefined") {
        (globalThis as any).updatedGroup = {
          groupId: groupData?.groupId,
          groupName: groupName.trim(),
        };
      } else {
        (global as any).updatedGroup = {
          groupId: groupData?.groupId,
          groupName: groupName.trim(),
        };
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating group name:", error);
      // Reset to original name on error
      setGroupName(groupData?.groupName || "Makan Bersama");
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await api.delete(`/api/mobile/groups/${groupData?.groupId}`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Group deleted successfully:", groupData?.groupId);

      // Store deleted group ID in global state
      if (typeof global === "undefined") {
        (globalThis as any).deletedGroupId = groupData?.groupId;
      } else {
        (global as any).deletedGroupId = groupData?.groupId;
      }

      setShowDeleteModal(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        router.back();
      }, 3000);
    } catch (error) {
      console.error("Error deleting group:", error);
      setShowDeleteModal(false);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    try {
      // TODO: Navigate to add member screen or show member selection modal
      // router.push({
      //   pathname: "/(tabs)/home/add-member",
      //   params: { groupId: groupData?.groupId }
      // });

      console.log("Add member to group:", groupData?.groupId);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const showRemoveMemberConfirmation = (member: any) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
  };

  const confirmRemoveMember = () => {
    if (!memberToRemove) return;
    
    const updatedMembers = members.filter((member: any) => member.id !== memberToRemove.id);
    setMembers(updatedMembers);
    
    // Update global state for groups list
    const updatedGroup = {
      ...groupData,
      groupId: groupData?.groupId,
      memberCount: updatedMembers.length,
      members: updatedMembers
    };
    
    if (typeof global === "undefined") {
      (globalThis as any).updatedGroup = updatedGroup;
    } else {
      (global as any).updatedGroup = updatedGroup;
    }
    
    setShowRemoveMemberModal(false);
    setMemberToRemove(null);
  };

  const renderMember = ({ item }: { item: any }) => (
    <View style={styles.memberItem}>
      <Image source={item.avatar} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        {item.status === "pending" && (
          <Text style={styles.pendingLabel}>Menunggu konfirmasi</Text>
        )}
      </View>
      {item.id !== "creator" && (
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
          <TouchableOpacity onPress={() => router.back()}>
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
              <Text style={styles.groupTitle}>{groupName}</Text>
              <Text style={styles.groupSubtitle}>
                Dibuat oleh{" "}
                {groupData?.isCreator
                  ? "You"
                  : groupData?.creatorName || "Hanis"}
              </Text>
            </View>

            {/* Group Name Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nama Grup</Text>
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
              </View>

              {isEditing ? (
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
                  <Text style={styles.groupNameText}>{groupName}</Text>
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
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setShowDeleteModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteButtonText}>Hapus Grup</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButton}
                onPress={addMember}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>Tambah Anggota</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.deleteModal}>
              <View style={styles.warningIcon}>
                <Ionicons
                  name="warning"
                  size={getIconSize(40)}
                  color="#FF9500"
                />
              </View>
              <Text style={styles.deleteTitle}>Hapus Grup?</Text>
              <Text style={styles.deleteMessage}>
                Anda yakin ingin menghapus grup ini ?
              </Text>
              <View style={styles.deleteActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowDeleteModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={deleteGroup}
                  disabled={loading}
                >
                  <Text style={styles.confirmDeleteText}>
                    {loading ? "Menghapus..." : "Hapus"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <View style={styles.successIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={getIconSize(60)}
                  color="#00897B"
                />
              </View>
              <Text style={styles.successTitle}>Grup Berhasil dihapus</Text>
            </View>
          </View>
        </Modal>

        {/* Remove Member Confirmation Modal */}
        <Modal
          visible={showRemoveMemberModal}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
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
          </View>
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
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.cardWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(6),
  },
  groupInfoCard: {
    backgroundColor: "#A6D3CE",
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
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
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
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
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: getSpacing(14),
    paddingHorizontal: getSpacing(16),
    backgroundColor: COLORS.inputBg,
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(8),
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
  memberName: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  pendingLabel: {
    fontSize: rf(12),
    fontFamily: FONTS.regular,
    color: "#FF9500",
    marginTop: getSpacing(2),
  },
  statusIcon: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    justifyContent: "center",
    alignItems: "center",
  },
  activeIcon: {
    backgroundColor: "#00897B",
  },
  pendingIcon: {
    backgroundColor: "#FF9500",
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
    paddingHorizontal: getSpacing(24),
    gap: getSpacing(12),
    marginTop: getSpacing(8),
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: "#FF3B30",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: "#FF3B30",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#00897B",
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(16),
    alignItems: "center",
  },
  addButtonText: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    fontSize: rf(20),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: getSpacing(8),
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
});
