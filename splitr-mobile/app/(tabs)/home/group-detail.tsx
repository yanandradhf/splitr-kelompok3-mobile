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
    // Create members with mix of active and pending status
    const totalMembers = (groupData?.memberCount || 3) + 1; // +1 for pending members
    return Array.from({ length: totalMembers }, (_, index) => {
      if (index === 0) {
        // Host is always active
        return {
          id: `member-${index}`,
          name: groupData?.isCreator ? "You" : groupData?.creatorName || "Host",
          status: "active",
          avatar: personImages[index % 4],
        };
      } else if (index < (groupData?.memberCount || 3)) {
        // Active members
        return {
          id: `member-${index}`,
          name: `Member ${index}`,
          status: "active",
          avatar: personImages[index % 4],
        };
      } else {
        // Pending members
        return {
          id: `member-${index}`,
          name: `Pending User ${index - (groupData?.memberCount || 3) + 1}`,
          status: "pending",
          avatar: personImages[index % 4],
        };
      }
    });
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const updateGroupName = async () => {
    if (groupName.trim().length === 0) {
      setGroupName(groupData?.groupName || "Makan Bersama");
      setIsEditing(false);
      return;
    }

    try {
      // API call to update group name
      console.log("Updating group name to:", groupName);

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
    }
  };

  const deleteGroup = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
    } finally {
      setLoading(false);
    }
  };

  const addMember = () => {
    // Navigate to add member screen
    console.log("Add member");
  };

  const renderMember = ({ item }: { item: any }) => (
    <View style={styles.memberItem}>
      <Image source={item.avatar} style={styles.memberAvatar} />
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
      </View>
      <View
        style={[
          styles.statusIcon,
          item.status === "active" ? styles.activeIcon : styles.pendingIcon,
        ]}
      >
        <Ionicons
          name={item.status === "active" ? "checkmark" : "time"}
          size={16}
          color={COLORS.white}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detail Grup</Text>
          <View style={{ width: 24 }} />
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
                    size={16}
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
                  {members.filter((m) => m.status === "active").length} aktif,{" "}
                  {members.filter((m) => m.status === "pending").length} pending
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
                <Ionicons name="warning" size={40} color="#FF9500" />
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
                <Ionicons name="checkmark-circle" size={60} color="#00897B" />
              </View>
              <Text style={styles.successTitle}>Grup Berhasil dihapus</Text>
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
    backgroundColor: "#A6D3CE",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.black,
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
    marginBottom: -50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 50,
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
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 4,
  },
  groupSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.black,
    opacity: 0.8,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  membersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  memberCount: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00897B",
  },
  editButtonText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: "#00897B",
    marginLeft: 4,
  },
  groupNameDisplay: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  groupNameText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIcon: {
    backgroundColor: "#00897B",
  },
  pendingIcon: {
    backgroundColor: "#FF9500",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginTop: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: "#FF3B30",
  },
  addButton: {
    flex: 1,
    backgroundColor: "#00897B",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 16,
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
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 40,
    minWidth: 280,
  },
  warningIcon: {
    marginBottom: 16,
  },
  deleteTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  deleteActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textSecondary,
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmDeleteText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  successModal: {
    backgroundColor: "#A6D3CE",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    marginHorizontal: 40,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: "center",
  },
});
