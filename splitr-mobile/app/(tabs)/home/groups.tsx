import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { COLORS, FONTS } from "../../../constants/theme";
import { useApi } from "../../../hooks/useApi";
import {
  wp,
  hp,
  rf,
  getSpacing,
  getBorderRadius,
  getIconSize,
} from "../../../utils/responsive";

const personImages = [
  require("../../../assets/images/person1.png"),
  require("../../../assets/images/person2.png"),
  require("../../../assets/images/person3.png"),
  require("../../../assets/images/person4.png"),
];

export default function GroupsScreen() {
  const [searchText, setSearchText] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { getGroups } = useApi();

  const fetchGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.groups || []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Check for new group when returning from create-group
      const newGroup =
        (global as any)?.newGroup || (globalThis as any)?.newGroup;
      if (newGroup) {
        console.log("Adding new group to list:", newGroup);
        setGroups((prev) => [newGroup, ...prev]);
        // Clear the global reference
        if ((global as any)?.newGroup) delete (global as any).newGroup;
        if ((globalThis as any)?.newGroup) delete (globalThis as any).newGroup;
      }

      // Check for deleted group when returning from group-detail
      const deletedGroupId =
        (global as any)?.deletedGroupId || (globalThis as any)?.deletedGroupId;
      if (deletedGroupId) {
        console.log("Removing deleted group from list:", deletedGroupId);
        setGroups((prev) =>
          prev.filter((group) => group.groupId !== deletedGroupId)
        );
        // Clear the global reference
        if ((global as any)?.deletedGroupId)
          delete (global as any).deletedGroupId;
        if ((globalThis as any)?.deletedGroupId)
          delete (globalThis as any).deletedGroupId;
      }

      // Check for updated group when returning from group-detail
      const updatedGroup =
        (global as any)?.updatedGroup || (globalThis as any)?.updatedGroup;
      if (updatedGroup) {
        console.log("Updating group in list:", updatedGroup);
        setGroups((prev) =>
          prev.map((group) =>
            group.groupId === updatedGroup.groupId
              ? { 
                  ...group, 
                  groupName: updatedGroup.groupName || group.groupName,
                  memberCount: updatedGroup.memberCount || group.memberCount,
                  members: updatedGroup.members || group.members
                }
              : group
          )
        );
        // Clear the global reference
        if ((global as any)?.updatedGroup) delete (global as any).updatedGroup;
        if ((globalThis as any)?.updatedGroup)
          delete (globalThis as any).updatedGroup;
      }
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  }, []);

  const filteredGroups = groups.filter(
    (group) =>
      group.groupName?.toLowerCase().includes(searchText.toLowerCase()) ||
      group.groupId?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Purple Background Section */}
        <View style={styles.purpleSection}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={getIconSize(24)}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Grup</Text>
            <View style={{ width: getIconSize(24) }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={getIconSize(20)}
              color={COLORS.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Group"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </View>

        {/* White Modal Container */}
        <View style={styles.whiteModalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={COLORS.teal}
                colors={[COLORS.teal]}
              />
            }
          >
            {/* Groups List */}
            <View style={styles.listContainer}>
              {loading ? (
                <ActivityIndicator
                  size="large"
                  color={COLORS.teal}
                  style={styles.loader}
                />
              ) : filteredGroups.length > 0 ? (
                filteredGroups.map((group, index) => (
                  <TouchableOpacity
                    key={group.groupId || index}
                    style={styles.groupCard}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/home/group-detail",
                        params: { groupData: JSON.stringify(group) },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupId}>
                        ID {group.groupId?.slice(0, 8) || "N/A"}
                      </Text>
                      <Text style={styles.groupHost}>
                        Host :{" "}
                        {group.isCreator
                          ? "You"
                          : group.creatorName || "Unknown"}
                      </Text>
                    </View>

                    <View style={styles.groupContent}>
                      <View style={styles.groupAvatars}>
                        {(() => {
                          const allMembers = group.members || [];
                          const displayMembers = allMembers.slice(0, 4);
                          
                          if (displayMembers.length === 0 && group.memberCount > 0) {
                            return Array.from({ length: Math.min(group.memberCount, 4) }, (_, index) => (
                              <Image
                                key={`placeholder-${index}`}
                                source={personImages[index % 4]}
                                style={[
                                  styles.avatar,
                                  index > 0 && styles.avatarOverlap,
                                ]}
                              />
                            ));
                          }
                          
                          return displayMembers.map((member, index) => {
                            const avatarSource = member.avatar || member.profilePicture || personImages[index % 4];
                            return (
                              <Image
                                key={member.id || member.userId || index}
                                source={typeof avatarSource === 'string' ? { uri: avatarSource } : avatarSource}
                                style={[
                                  styles.avatar,
                                  index > 0 && styles.avatarOverlap,
                                ]}
                              />
                            );
                          });
                        })()}
                      </View>

                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>
                          {group.groupName || "Unnamed Group"}
                        </Text>
                        <Text style={styles.groupMembers}>
                          {group.members?.length || group.memberCount || 0} orang dalam grup ini
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="people-outline"
                    size={getIconSize(48)}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.emptyText}>Tidak ada grup ditemukan</Text>
                  <Text style={styles.emptySubtext}>
                    Buat grup baru atau coba kata kunci lain
                  </Text>
                </View>
              )}
            </View>

            {/* Create Group Button */}
            <TouchableOpacity
              style={styles.createGroupButton}
              onPress={() => {
                router.push("/(tabs)/home/create-group");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.createGroupText}>Buat Grup</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundMain,
  },
  safeArea: {
    flex: 1,
  },
  purpleSection: {
    backgroundColor: COLORS.backgroundMain,
    paddingBottom: getSpacing(20),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: getSpacing(24),
    paddingTop: getSpacing(16),
    paddingBottom: getSpacing(20),
  },
  headerTitle: {
    fontSize: rf(20),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: getSpacing(24),
    marginBottom: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: getSpacing(8),
    fontSize: rf(16),
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: getBorderRadius(24),
    borderTopRightRadius: getBorderRadius(24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: -hp(6),
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp(6),
  },
  listContainer: {
    paddingHorizontal: getSpacing(24),
    paddingTop: getSpacing(24),
  },
  groupCard: {
    borderRadius: getBorderRadius(16),
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginBottom: getSpacing(16),
  },
  groupHeader: {
    backgroundColor: "#00897B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderTopLeftRadius: getBorderRadius(16),
    borderTopRightRadius: getBorderRadius(16),
  },
  groupId: {
    fontSize: rf(14),
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
  },
  groupHost: {
    fontSize: rf(14),
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
  },
  groupContent: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    padding: getSpacing(16),
    alignItems: "center",
  },
  groupAvatars: {
    flexDirection: "row",
    marginRight: getSpacing(16),
  },
  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarOverlap: {
    marginLeft: -getSpacing(10),
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: rf(18),
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: getSpacing(4),
  },
  groupMembers: {
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: getSpacing(8),
  },
  createGroupButton: {
    backgroundColor: COLORS.teal,
    marginHorizontal: getSpacing(24),
    marginTop: getSpacing(20),
    paddingVertical: getSpacing(18),
    borderRadius: getBorderRadius(12),
    alignItems: "center",
  },
  createGroupText: {
    fontSize: rf(18),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: getSpacing(40),
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: getSpacing(40),
  },
  emptyText: {
    fontSize: rf(16),
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: getSpacing(16),
    marginBottom: getSpacing(8),
  },
  emptySubtext: {
    fontSize: rf(14),
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
