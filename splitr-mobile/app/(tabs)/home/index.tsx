import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { SkeletonCard } from "../../../components/ui/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import UserAvatar from "../../../components/ui/UserAvatar";
import { COLORS, FONTS } from "../../../constants/theme";

// Components
import { StatsCard } from "./components/StatsCard";

// Hooks & Utils
import { useHomeLogic } from "./hooks/useHomeLogic";

// Types
import { Friend, Group } from "./types";

const LOCAL_COLORS = {
  background: "#fde9a2",
  cardBrown: COLORS.card,
  cardWhite: COLORS.white,
  orange: COLORS.orange,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  headerBrown: "#FDA76A",
  gray: COLORS.gray,
};

export default function HomeScreen() {
  const {
    // User data
    user,
    stats,
    
    // Data
    friends,
    groups,
    notifications,
    unreadCount,
    
    // Loading states
    friendsLoading,
    groupsLoading,
    notificationsLoading,
    refreshing,
    
    // Actions
    onRefresh,
    formatDate,
    handleNavigation,
    handleGroupPress,
    
    // Computed
    showNotificationDot,
    latestNotification,
  } = useHomeLogic();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
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
        {/* PURPLE BACKGROUND SECTION */}
        <View style={styles.purpleSection}>
          {/* HEADER SECTION */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.userProfile}
              activeOpacity={0.7}
              onPress={() => router.push("/(modals)/profile")}
            >
              <UserAvatar
                photoUrl={user?.profilePhotoUrl || user?.profilePhoto || user?.avatar}
                name={user?.name || user?.username || 'User'}
                size={60}
              />
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeSubtext}>Hi, Welcome Back!</Text>
                <Text style={styles.welcomeName}>
                  {user?.name || user?.username || "User"}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerNotificationContainer}
              onPress={() => router.push("/(modals)/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={28}
                color={COLORS.textPrimary}
              />
              {showNotificationDot && <View style={styles.notificationDot} />}
            </TouchableOpacity>
          </View>

          {/* ACTIVITY SECTION */}
          <View style={styles.activitySection}>
            <StatsCard 
              stats={stats}
              onPress={() => router.push("/(tabs)/monitoring")}
            />
          </View>
        </View>

        {/* WHITE MODAL CONTAINER */}
        <View style={styles.whiteModalContainer}>
          {/* GROUPS SECTION */}
          <View style={styles.modalSection}>
            <TouchableOpacity
              onPress={() => handleNavigation("/(modals)/groups")}
              activeOpacity={0.7}
              style={styles.sectionHeader}
            >
              <Text style={styles.sectionTitle}>Lihat Grup</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={LOCAL_COLORS.textPrimary}
              />
            </TouchableOpacity>
            {groupsLoading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.groupsScroll}
              >
                {[1, 2].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </ScrollView>
            ) : groups.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.groupsScroll}
              >
                {groups.map((group: Group, index: number) => (
                  <TouchableOpacity
                    key={group.groupId || index}
                    style={[styles.groupCard, { marginRight: 16 }]}
                    onPress={() => handleGroupPress(group)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.groupHeader}>
                      {/* <Text style={styles.groupId}>
                        ID {group.groupId.slice(0, 8)}
                      </Text> */}
                      <Text style={styles.groupHost}>
                        Host : {group.isCreator ? "You" : group.creatorName}
                      </Text>
                    </View>
                    <View style={styles.groupContent}>
                      <View style={styles.groupAvatars}>
                        {(() => {
                          const allMembers = group.members || [];
                          const displayMembers = allMembers.slice(0, 3);
                          const totalMembers = group.memberCount || allMembers.length || 0;

                          if (displayMembers.length === 0 && totalMembers > 0) {
                            return (
                              <>
                                {Array.from({ length: Math.min(totalMembers, 3) }, (_, index) => (
                                  <UserAvatar
                                    key={`placeholder-${index}`}
                                    photoUrl={undefined}
                                    name={`User ${index + 1}`}
                                    size={32}
                                    style={[
                                      styles.avatar,
                                      index > 0 && styles.avatarOverlap,
                                    ]}
                                  />
                                ))}
                                {totalMembers > 3 && (
                                  <View style={[styles.avatar, styles.avatarOverlap, styles.moreAvatarContainer]}>
                                    <Text style={styles.moreAvatarText}>+{totalMembers - 3}</Text>
                                  </View>
                                )}
                              </>
                            );
                          }

                          return (
                            <>
                              {displayMembers.map((member, index) => (
                                <UserAvatar
                                  key={member.userId || index}
                                  photoUrl={member.profilePhotoUrl || member.profilePhoto || member.avatar}
                                  name={member.name || 'User'}
                                  size={32}
                                  style={[
                                    styles.avatar,
                                    index > 0 && styles.avatarOverlap,
                                  ]}
                                />
                              ))}
                              {totalMembers > 3 && (
                                <View style={[styles.avatar, styles.avatarOverlap, styles.moreAvatarContainer]}>
                                  <Text style={styles.moreAvatarText}>+{totalMembers - 3}</Text>
                                </View>
                              )}
                            </>
                          );
                        })()}
                      </View>
                      <View style={styles.groupInfo}>
                        <Text style={styles.groupName}>{group.groupName}</Text>
                        <Text style={styles.groupMembers}>
                          {group.memberCount} orang dalam grup ini
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyGroupState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="people-outline"
                    size={24}
                    color={COLORS.orange}
                  />
                </View>
                <Text style={styles.emptyTitle}>Belum ada grup</Text>
                <Text style={styles.emptySubtitle}>
                  Buat grup pertama untuk mulai berbagi tagihan
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={() => router.push("/(modals)/groups")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="people" size={16} color={COLORS.white} />
                  <Text style={styles.emptyActionText}>Buat Grup</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* SEPARATOR */}
          <View style={styles.separator} />

          {/* FRIENDS SECTION */}
          <View style={styles.modalSection}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => handleNavigation("/(modals)/add-friend")}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Lihat Teman</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            {friendsLoading ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.friendsScroll}
              >
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.friendItem}>
                    <View style={[styles.friendImage, { backgroundColor: '#E1E5E9' }]} />
                    <View style={[styles.friendName, { backgroundColor: '#E1E5E9', height: 14, borderRadius: 4 }]} />
                  </View>
                ))}
              </ScrollView>
            ) : friends.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.friendsScroll}
              >
                {friends.slice(0, 4).map((friendData: Friend, index: number) => (
                  <TouchableOpacity
                    key={friendData.friend.userId || index}
                    style={styles.friendItem}
                    activeOpacity={0.7}
                  >
                    <UserAvatar
                      photoUrl={friendData.friend.profilePhotoUrl || friendData.friend.profilePhoto || friendData.friend.avatar}
                      name={friendData.friend.name}
                      size={60}
                    />
                    <Text style={styles.friendName}>
                      {friendData.friend.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.addFriendItem}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(modals)/add-friend")}
                >
                  <View style={styles.addFriendCircle}>
                    <Ionicons name="person-add" size={24} color={COLORS.white} />
                  </View>
                  <Text style={styles.addFriendText}>Tambah{"\n"}teman</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <View style={styles.emptyFriendState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons
                    name="person-add-outline"
                    size={32}
                    color={COLORS.teal}
                  />
                </View>
                <Text style={styles.emptyTitle}>Belum ada teman</Text>
                <Text style={styles.emptySubtitle}>
                  Tambahkan teman untuk mulai berbagi tagihan
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={() => router.push("/(modals)/add-friend")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-add" size={16} color={COLORS.white} />
                  <Text style={styles.emptyActionText}>Tambah Teman</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Simplified styles (keeping essential ones)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LOCAL_COLORS.background },
  purpleSection: { backgroundColor: LOCAL_COLORS.background, paddingBottom: 20 },
  scrollView: { flex: 1 },
  whiteModalContainer: { backgroundColor: LOCAL_COLORS.cardWhite, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  userProfile: { flexDirection: "row", alignItems: "center", flex: 1 },
  welcomeText: { justifyContent: "center", marginLeft: 12, flex: 1 },
  welcomeSubtext: { fontSize: 16, fontFamily: FONTS.regular, color: LOCAL_COLORS.textSecondary },
  welcomeName: { fontSize: 18, fontFamily: FONTS.bold, color: LOCAL_COLORS.textPrimary },
  headerNotificationContainer: { position: "relative" },
  notificationDot: { position: "absolute", top: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.red },
  activitySection: { paddingHorizontal: 20, marginBottom: 10 },
  modalSection: { marginTop: 5, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontFamily: FONTS.bold, color: LOCAL_COLORS.textPrimary },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 8 },
  groupsScroll: { paddingVertical: 8 },
  groupCard: { borderRadius: 12, overflow: "hidden", elevation: 4, shadowColor: "#000000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, width: 300, backgroundColor: LOCAL_COLORS.cardWhite },
  groupHeader: { backgroundColor: LOCAL_COLORS.headerBrown, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8 },
  groupId: { fontSize: 12, fontFamily: FONTS.semiBold, color: "#FFFFFF" },
  groupHost: { fontSize: 12, fontFamily: FONTS.semiBold, color: "#FFFFFF" },
  groupContent: { backgroundColor: LOCAL_COLORS.background, flexDirection: "row", padding: 12, alignItems: "center" },
  groupAvatars: { flexDirection: "row", marginRight: 12 },
  avatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: LOCAL_COLORS.cardWhite },
  moreAvatarContainer: { backgroundColor: COLORS.teal, justifyContent: "center", alignItems: "center" },
  moreAvatarText: { fontSize: 10, fontFamily: FONTS.semiBold, color: COLORS.white },
  avatarOverlap: { marginLeft: -8 },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 16, fontFamily: FONTS.bold, color: LOCAL_COLORS.textPrimary, marginBottom: 2 },
  groupMembers: { fontSize: 12, fontFamily: FONTS.regular, color: LOCAL_COLORS.textSecondary, marginBottom: 6 },
  separator: { height: 1, backgroundColor: "#E0E0E0", marginHorizontal: 0, marginVertical: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  friendsScroll: { paddingVertical: 8 },
  friendItem: { alignItems: "center", justifyContent: "space-between", marginRight: 16, paddingTop: 12, paddingHorizontal: 12, paddingBottom: 8, borderRadius: 12, backgroundColor: LOCAL_COLORS.background, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, width: 80, minHeight: 100 },
  friendImage: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: LOCAL_COLORS.background },
  friendName: { fontSize: 12, fontFamily: FONTS.semiBold, color: LOCAL_COLORS.textPrimary, textAlign: "center", maxWidth: 70, lineHeight: 14 },
  addFriendItem: { alignItems: "center", justifyContent: "space-between", marginRight: 16, paddingTop: 12, paddingHorizontal: 12, paddingBottom: 8, borderRadius: 12, backgroundColor: COLORS.white, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 2, borderColor: LOCAL_COLORS.background, borderStyle: "dashed", width: 80, minHeight: 100 },
  addFriendCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: LOCAL_COLORS.background, justifyContent: "center", alignItems: "center", shadowColor: LOCAL_COLORS.background, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  addFriendText: { fontSize: 12, fontFamily: FONTS.semiBold, color: LOCAL_COLORS.textPrimary, textAlign: "center", maxWidth: 70, lineHeight: 14 },
  emptyGroupState: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, alignItems: "center", marginHorizontal: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  emptyFriendState: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, alignItems: "center", marginHorizontal: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  emptyIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0, 137, 123, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontFamily: FONTS.bold, color: COLORS.textPrimary, marginBottom: 6, textAlign: "center" },
  emptySubtitle: { fontSize: 13, fontFamily: FONTS.regular, color: COLORS.textSecondary, textAlign: "center", lineHeight: 18, marginBottom: 16 },
  emptyActionButton: { backgroundColor: COLORS.teal, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, shadowColor: COLORS.teal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  emptyActionText: { fontSize: 13, fontFamily: FONTS.semiBold, color: COLORS.white, marginLeft: 6 },
});