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
              color="#00897B"
              style={styles.buttonIcon}
            />
            <Text style={styles.addMemberButtonText}>Tambah</Text>
          </TouchableOpacity>

          {/* Delete Group Button */}
          <TouchableOpacity
            style={styles.deleteGroupButton}
            onPress={onDeleteGroup}
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
          {/* Leave Group Button */}
          <TouchableOpacity
            style={styles.leaveGroupButton}
            onPress={onDeleteGroup}
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