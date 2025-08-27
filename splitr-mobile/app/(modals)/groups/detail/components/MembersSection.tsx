import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { COLORS, FONTS, FONT_SIZES } from "../../../../../constants/theme";
import { wp, rf, getSpacing, getBorderRadius, getIconSize } from "../../../../../utils/responsive";
import UserAvatar from "../../../../../components/ui/UserAvatar";
import { sectionStyles } from "../styles";
import { GroupMember, GroupData } from "../types";

interface MembersSectionProps {
  members: GroupMember[];
  displayGroup: GroupData | null;
  onAddFriend: (member: GroupMember) => void;
  onRemoveMember: (member: GroupMember) => void;
  isCurrentUser: (member: GroupMember) => boolean;
  canAddAsFriend: (userId: string) => boolean;
}

export const MembersSection: React.FC<MembersSectionProps> = ({
  members,
  displayGroup,
  onAddFriend,
  onRemoveMember,
  isCurrentUser,
  canAddAsFriend,
}) => {
  const renderMember = ({ item }: { item: GroupMember }) => (
    <View style={styles.memberItem}>
      <UserAvatar
        photoUrl={typeof item.avatar === 'string' ? item.avatar : undefined}
        name={item.name}
        size={40}
        style={styles.memberAvatar}
      />
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
          onPress={() => onAddFriend(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.addFriendText}>Add Friend</Text>
        </TouchableOpacity>
      )}
      {item.id !== "creator" && displayGroup?.isCreator && !isCurrentUser(item) && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemoveMember(item)}
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
    <View style={sectionStyles.section}>
      <View style={styles.membersHeader}>
        <Text style={sectionStyles.sectionTitle}>Anggota Grup</Text>
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
  );
};

const styles = StyleSheet.create({
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
});