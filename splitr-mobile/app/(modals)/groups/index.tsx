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
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from "../../../constants/theme";
import { useApi } from "../../../hooks/useApi";
import { useGroupsStore } from "../../../store";
import UserAvatar from "../../../components/ui/UserAvatar";
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
  const [refreshing, setRefreshing] = useState(false);
  const [forceLoading, setForceLoading] = useState(true);
  const { 
    groups, 
    isLoading: loading, 
    fetchGroups 
  } = useGroupsStore();

  const [lastFetchTime, setLastFetchTime] = useState(0);

  useEffect(() => {
    fetchGroups();
    setTimeout(() => setForceLoading(false), 1800);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      // Only fetch if not loading and last fetch was more than 2 seconds ago
      if (!loading && now - lastFetchTime > 2000) {
        fetchGroups();
        setLastFetchTime(now);
      }
    }, [lastFetchTime, loading])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchGroups();
    setRefreshing(false);
  }, [fetchGroups]);

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
            <TouchableOpacity onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(tabs)/home');
              }
            }}>
              <Ionicons
                name="arrow-back"
                size={getIconSize(24)}
                color={COLORS.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Grup</Text>
            <TouchableOpacity
              style={styles.headerCreateButton}
              onPress={() => router.push("/(modals)/groups/create")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="add"
                size={getIconSize(20)}
                color={COLORS.white}
              />
            </TouchableOpacity>
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
              {loading || forceLoading ? (
                <View>
                  {[1, 2, 3].map((i) => (
                    <View key={i} style={styles.groupCard}>
                      <View style={styles.groupHeader}>
                        <View style={{ width: 80, height: 14, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
                        <View style={{ width: 100, height: 14, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 }} />
                      </View>
                      <View style={styles.groupContent}>
                        <View style={styles.groupAvatars}>
                          {[1, 2, 3, 4].map((j) => (
                            <View key={j} style={[styles.avatar, { backgroundColor: '#E1E5E9' }, j > 1 && styles.avatarOverlap]} />
                          ))}
                        </View>
                        <View style={styles.groupInfo}>
                          <View style={{ width: 120, height: 18, backgroundColor: '#E1E5E9', borderRadius: 4, marginBottom: 4 }} />
                          <View style={{ width: 80, height: 14, backgroundColor: '#E1E5E9', borderRadius: 4 }} />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : filteredGroups.length > 0 ? (
                filteredGroups.map((group, index) => (
                  <TouchableOpacity
                    key={group.groupId || index}
                    style={styles.groupCard}
                    onPress={() =>
                      router.push({
                        pathname: "/(modals)/groups/detail",
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
                              <UserAvatar
                                key={`placeholder-${index}`}
                                photoUrl={undefined}
                                name={`User ${index + 1}`}
                                size={40}
                                style={[
                                  styles.avatar,
                                  index > 0 && styles.avatarOverlap,
                                ]}
                              />
                            ));
                          }
                          
                          return displayMembers.map((member, index) => {
                            const avatarSource = member.profilePhotoUrl || member.avatar || member.profilePicture;
                            return (
                              <UserAvatar
                                key={member.id || member.userId || index}
                                photoUrl={avatarSource}
                                name={member.name || `User ${index + 1}`}
                                size={40}
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


          </ScrollView>
        </View>
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
  purpleSection: {
    backgroundColor: LOCAL_COLORS.background,
    paddingBottom: 20,
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
    fontSize: rf(FONT_SIZES.lg),
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
  headerCreateButton: {
    backgroundColor: COLORS.teal,
    width: getIconSize(36),
    height: getIconSize(36),
    borderRadius: getIconSize(18),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
