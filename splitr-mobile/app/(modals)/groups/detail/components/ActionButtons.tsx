import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, FONTS } from "../../../../../constants/theme";
import { rf, getSpacing, getBorderRadius, getIconSize } from "../../../../../utils/responsive";
import { GroupData } from "../types";

interface ActionButtonsProps {
  displayGroup: GroupData | null;
  onAddMember: () => void;
  onDeleteGroup: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  displayGroup,
  onAddMember,
  onDeleteGroup,
}) => {
  return (
    <View style={styles.actionButtons}>
      {displayGroup?.isCreator ? (
        <>
          {/* Add Member Button */}
          <TouchableOpacity
            style={styles.addMemberButton}
            onPress={onAddMember}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-add-outline"
              size={getIconSize(20)}
              color={COLORS.white}
              style={styles.buttonIcon}
            />
            <Text style={styles.addMemberButtonText}>Tambah Anggota</Text>
          </TouchableOpacity>

          {/* Delete Group Button */}
          <TouchableOpacity
            style={styles.deleteGroupButton}
            onPress={onDeleteGroup}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trash"
              size={getIconSize(18)}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Leave Group Button */}
          <TouchableOpacity
            style={styles.leaveGroupButton}
            onPress={onDeleteGroup}
            activeOpacity={0.8}
          >
            <Ionicons
              name="exit-outline"
              size={getIconSize(20)}
              color={COLORS.white}
              style={styles.buttonIcon}
            />
            <Text style={styles.leaveGroupButtonText}>Keluar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(20),
    gap: getSpacing(12),
  },
  buttonIcon: {
    marginRight: getSpacing(6),
  },
  addMemberButton: {
    flex: 1,
    backgroundColor: COLORS.teal,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addMemberButtonText: {
    fontSize: rf(14),
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
  },
  deleteGroupButton: {
    backgroundColor: COLORS.red,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(14),
    paddingHorizontal: getSpacing(16),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
});