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
              ? { ...group, groupName: updatedGroup.groupName }
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
                size={24}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Grup</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
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
                        {[0, 1, 2, 3].map((avatarIndex) => {
                          const member = group.members?.[avatarIndex];
                          return (
                            <Image
                              key={avatarIndex}
                              source={personImages[avatarIndex % 4]}
                              style={[
                                styles.avatar,
                                avatarIndex > 0 && styles.avatarOverlap,
                                !member && { opacity: 0 },
                              ]}
                            />
                          );
                        })}
                      </View>

                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>
                          {group.groupName || "Unnamed Group"}
                        </Text>
                        <Text style={styles.groupMembers}>
                          {group.memberCount || 0} orang aktif dalam grup ini
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="people-outline"
                    size={48}
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
    paddingBottom: 20,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textPrimary,
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
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  groupCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginBottom: 16,
  },
  groupHeader: {
    backgroundColor: "#00897B",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  groupId: {
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
  },
  groupHost: {
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
  },
  groupContent: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  groupAvatars: {
    flexDirection: "row",
    marginRight: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: "#00897B",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  addFriendText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: "#00897B",
    marginLeft: 4,
  },
  createGroupButton: {
    backgroundColor: COLORS.teal,
    marginHorizontal: 24,
    marginTop: 20,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  createGroupText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  loader: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
