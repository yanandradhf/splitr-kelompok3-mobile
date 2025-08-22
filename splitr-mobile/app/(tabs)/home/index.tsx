import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import Spinner from "../../../components/ui/Spinner";
import { SkeletonCard, SkeletonStats, SkeletonNotification } from "../../../components/ui/Skeleton";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useAuthStore } from "../../../store";
import { useProfileStore } from "../../../store";
import { useFriends, useGroups, useNotifications } from "../../../hooks/useApi";
import { useGroupsStore } from "../../../store";
import { useNotificationsStore } from "../../../store";


import { COLORS, FONTS } from "../../../constants/theme";

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

const personImages = [
  require("../../../assets/images/person1.png"),
  require("../../../assets/images/person2.png"),
  require("../../../assets/images/person3.png"),
  require("../../../assets/images/person4.png"),
];

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { user: storeUser, stats: storeStats } = useProfileStore();
  const [forceLoading, setForceLoading] = useState(true);
  
  const { fetchProfile } = useProfileStore();
  
  useEffect(() => {
    if (!storeUser) {
      fetchProfile();
    }
    // Force skeleton to show for 2 seconds
    setTimeout(() => setForceLoading(false), 2000);
  }, []);


  const {
    friends,
    loading: friendsLoading,
    refetch: refetchFriends,
  } = useFriends();
  const {
    groups,
    loading: groupsLoading,
    refetch: refetchGroups,
  } = useGroups();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    refetch: refetchNotifications,
  } = useNotifications();
  

  
  // Get notification dot visibility
  const showNotificationDot = unreadCount > 0;

  const [refreshing, setRefreshing] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [lastNavigationTime, setLastNavigationTime] = useState(0);
  const [lastGroupNavigation, setLastGroupNavigation] = useState<{[key: string]: number}>({});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchProfile(),
        refetchFriends(),
        refetchGroups(),
        refetchNotifications(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfile, refetchFriends, refetchGroups, refetchNotifications]);

  const latestNotification = notifications[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 3) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;
    if (diffInHours < 24) return `${diffInHours} jam lalu`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

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
              <Image
                source={require("../../../assets/images/person1.png")}
                style={styles.profileImage}
              />
              <View style={styles.welcomeText}>
                <Text style={styles.welcomeSubtext}>Hi, Welcome Back!</Text>
                <Text style={styles.welcomeName}>
                  {user?.name || storeUser?.name || "User"}
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
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[styles.tabButton, showStats && styles.activeTab]}
                onPress={() => setShowStats(true)}
              >
                <Ionicons
                  name="stats-chart-outline"
                  size={16}
                  color={showStats ? COLORS.white : COLORS.teal}
                />
                <Text
                  style={[styles.tabText, showStats && styles.activeTabText]}
                >
                  Stats
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, !showStats && styles.activeTab]}
                onPress={() => setShowStats(false)}
              >
                <Ionicons
                  name="card-outline"
                  size={16}
                  color={!showStats ? COLORS.white : COLORS.teal}
                />
                <Text
                  style={[styles.tabText, !showStats && styles.activeTabText]}
                >
                  Bills
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.unifiedCard}>
              {showStats ? (
                !storeStats || forceLoading ? (
                  <SkeletonStats />
                ) : (
                  <View style={styles.statsContainer}>
                    <View style={styles.statRow}>
                      <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                          <Ionicons
                            name="receipt-outline"
                            size={20}
                            color={COLORS.teal}
                          />
                        </View>
                        <Text style={styles.statNumber}>
                          {storeStats?.totalBills || 0}
                        </Text>
                        <Text style={styles.statLabel}>Tagihan</Text>
                      </View>
                      <View style={styles.statItem}>
                        <View style={styles.statIconContainer}>
                          <Ionicons
                            name="wallet-outline"
                            size={20}
                            color={COLORS.teal}
                          />
                        </View>
                        <Text style={styles.statNumber}>
                          {storeStats?.totalSpent
                            ? `${(storeStats.totalSpent / 1000000).toFixed(
                                1
                              )}M`
                            : "0"}
                        </Text>
                        <Text style={styles.statLabel}>Terbayar</Text>
                      </View>
                      <View style={[styles.statItem, styles.lastStatItem]}>
                        <View style={styles.statIconContainer}>
                          <Ionicons
                            name="time-outline"
                            size={20}
                            color={COLORS.teal}
                          />
                        </View>
                        <Text style={styles.statNumber}>
                          {storeStats?.pendingPayments || 0}
                        </Text>
                        <Text style={styles.statLabel}>Belum Dibayar</Text>
                      </View>
                    </View>
                  </View>
                )
              ) : notificationsLoading ? (
                <SkeletonNotification />
              ) : latestNotification ? (
                <View style={styles.notifContainer}>
                  <View style={styles.notificationRow}>
                    <View style={styles.notifIcon}>
                      <Ionicons name="card-outline" size={24} color="#76B9BB" />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.notifTitle} numberOfLines={1}>
                        {latestNotification.title}
                      </Text>
                      <Text style={styles.notifMessage} numberOfLines={2}>
                        {latestNotification.message}
                      </Text>
                      <View style={styles.dateContainer}>
                        <Text style={styles.notifDate}>
                          {formatDate(latestNotification.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={24}
                    color={COLORS.textSecondary}
                  />
                  <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* WHITE MODAL CONTAINER */}
        <View style={styles.whiteModalContainer}>
          {/* GROUPS SECTION */}
          <View style={styles.modalSection}>
            <TouchableOpacity
              onPress={() => {
                const now = Date.now();
                if (now - lastNavigationTime > 1000) {
                  setLastNavigationTime(now);
                  router.push("/(modals)/groups");
                }
              }}
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
            {groupsLoading || forceLoading ? (
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
                {groups.map((group, index) => (
                  <TouchableOpacity
                    key={group.groupId || index}
                    style={[styles.groupCard, { marginRight: 16 }]}
                    onPress={() => {
                      console.log('Clicked group:', group.groupId, group.groupName);
                      router.replace({
                        pathname: "/(modals)/groups/detail",
                        params: { 
                          groupId: group.groupId,
                          groupData: JSON.stringify(group),
                          fromHome: 'true'
                        },
                      });
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.groupHeader}>
                      <Text style={styles.groupId}>
                        ID {group.groupId.slice(0, 8)}
                      </Text>
                      <Text style={styles.groupHost}>
                        Host : {group.isCreator ? "You" : group.creatorName}
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
                    color={COLORS.teal}
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
              onPress={() => {
                const now = Date.now();
                if (now - lastNavigationTime > 1000) {
                  setLastNavigationTime(now);
                  router.push("/(modals)/add-friend");
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>Lihat Teman</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
            {friendsLoading || forceLoading ? (
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
                {friends.slice(0, 4).map((friendData, index) => (
                  <TouchableOpacity
                    key={friendData.friend.userId || index}
                    style={styles.friendItem}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={personImages[index % 4]}
                      style={styles.friendImage}
                    />
                    <Text style={styles.friendName}>
                      {friendData.friend.name}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.friendItem}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(modals)/add-friend")}
                >
                  <View style={styles.addFriendCircle}>
                    <Ionicons name="add" size={28} color={COLORS.white} />
                  </View>
                  <Text style={styles.friendName}>Tambah teman</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.background,
  },
  purpleSection: {
    backgroundColor: LOCAL_COLORS.background,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  whiteModalContainer: {
    backgroundColor: LOCAL_COLORS.cardWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  userProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  welcomeText: {
    justifyContent: "center",
  },
  welcomeSubtext: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
  },
  welcomeName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  headerNotificationContainer: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 1,
    right: 1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.red,
  },

  // SECTIONS
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    padding: 2,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4,
  },
  activeTab: {
    backgroundColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.teal,
  },
  activeTabText: {
    color: COLORS.white,
  },
  modalSection: {
    marginTop: 5,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },

  // ACTIVITY CARD
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#76B9BB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: LOCAL_COLORS.cardWhite,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    lineHeight: 18,
  },
  activityRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  dateContainer: {
    backgroundColor: "#76B9BB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: "flex-end",
  },
  notificationDate: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: LOCAL_COLORS.textPrimary,
    textAlign: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },
  noNotificationText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },

  // UNIFIED CARD
  unifiedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: "#76B9BB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 120,
    justifyContent: "center",
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // STATS CONTENT
  statsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 0,
  },
  statItem: {
    alignItems: "center",
    justifyContent: "center",
    width: "33.33%",
    height: "100%",
    borderRightWidth: 1,
    borderRightColor: "#E8E8E8",
  },
  lastStatItem: {
    borderRightWidth: 0,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(118, 185, 187, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    textAlign: "center",
  },

  // NOTIFICATION CONTENT
  notifContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  notifIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: LOCAL_COLORS.cardWhite,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  notifContent: {
    flex: 1,
    marginTop: 8,
    marginBottom: 8,
  },
  notifTitle: {
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  notifDate: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: LOCAL_COLORS.textPrimary,
    textAlign: "center",
  },

  // EMPTY STATE
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },

  // GROUPS SCROLL
  groupsScroll: {
    paddingVertical: 8,
  },
  // GROUP CARDS
  groupCard: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    width: 300,
    backgroundColor: LOCAL_COLORS.cardWhite,
  },
  groupHeader: {
    backgroundColor: LOCAL_COLORS.headerBrown,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  groupId: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
  },
  groupHost: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: "#FFFFFF",
  },
  groupContent: {
    backgroundColor: LOCAL_COLORS.cardWhite,
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
  },
  groupAvatars: {
    flexDirection: "row",
    marginRight: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: LOCAL_COLORS.cardWhite,
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 2,
  },
  groupMembers: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    marginBottom: 6,
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LOCAL_COLORS.cardWhite,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.headerBrown,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  addFriendText: {
    fontSize: 10,
    fontFamily: FONTS.semiBold,
    color: LOCAL_COLORS.headerBrown,
    marginLeft: 3,
  },

  // SEPARATOR
  separator: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 0,
    marginVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  // FRIENDS
  friendsScroll: {
    paddingVertical: 8,
  },
  friendItem: {
    alignItems: "center",
    marginRight: 16,
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  friendName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: LOCAL_COLORS.textPrimary,
    textAlign: "center",
  },
  addFriendCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: LOCAL_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  // EMPTY STATES
  emptyGroupState: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyFriendState: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 137, 123, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  emptyActionButton: {
    backgroundColor: COLORS.teal,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyActionText: {
    fontSize: 13,
    fontFamily: FONTS.semiBold,
    color: COLORS.white,
    marginLeft: 6,
  },
});
