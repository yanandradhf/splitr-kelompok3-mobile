import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthStore } from "../../../store/auth.store";
import { useProfileStore } from "../../../store/profile.store";
import { useFriends, useGroups, useNotifications } from "../../../hooks/useApi";

import { COLORS, FONTS } from "../../../constants/theme";

const LOCAL_COLORS = {
  background: '#A6D3CE',
  cardBrown: COLORS.card,
  cardWhite: COLORS.white,
  orange: COLORS.orange,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  headerBrown: '#00897B',
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
  const { profile } = useProfileStore();
  const { friends, loading: friendsLoading, refetch: refetchFriends } = useFriends();
  const { groups, loading: groupsLoading, refetch: refetchGroups } = useGroups();
  const { notifications, loading: notificationsLoading, refetch: refetchNotifications } = useNotifications();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFriends(),
        refetchGroups(), 
        refetchNotifications()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFriends, refetchGroups, refetchNotifications]);

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
            tintColor={COLORS.card}
            colors={[COLORS.card]}
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
                <Text style={styles.welcomeName}>{user?.name || profile?.user?.name || "User"}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificationContainer}
              onPress={() => router.push("/(modals)/notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={COLORS.textPrimary}
              />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* RECENT ACTIVITY SECTION */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
            {notificationsLoading ? (
              <ActivityIndicator size="small" color={COLORS.card} />
            ) : latestNotification ? (
              <View style={styles.activityCard}>
                <View style={styles.activityLeft}>
                  <View style={styles.notificationIcon}>
                    <Ionicons
                      name={
                        latestNotification.type === "payment_reminder"
                          ? "card-outline"
                          : "notifications-outline"
                      }
                      size={24}
                      color='#76B9BB'
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>
                      {latestNotification.title}
                    </Text>
                    <Text
                      style={styles.notificationMessage}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {latestNotification.message}
                    </Text>
                    <View style={styles.dateContainer}>
                      <Text style={styles.notificationDate}>
                        {formatDate(latestNotification.createdAt)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.activityCard}>
                <Text style={styles.noNotificationText}>
                  Tidak ada notifikasi terbaru
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* WHITE MODAL CONTAINER */}
        <View style={styles.whiteModalContainer}>
          {/* GROUPS SECTION */}
          <View style={styles.modalSection}>
            <Text style={styles.sectionTitle}>Lihat grup</Text>

            {groupsLoading ? (
              <ActivityIndicator
                size="small"
                color={COLORS.card}
                style={{ marginTop: 20 }}
              />
            ) : (
              groups.map((group, index) => (
                <View
                  key={group.groupId || index}
                  style={[styles.groupCard, index > 0 && { marginTop: 16 }]}
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
                      <TouchableOpacity
                        style={styles.addFriendButton}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="person-add-outline"
                          size={14}
                          color={LOCAL_COLORS.headerBrown}
                        />
                        <Text style={styles.addFriendText}>
                          Tambahkan Teman
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* FRIENDS SECTION */}
          <View style={styles.modalSection}>
            <Text style={styles.sectionTitle}>Lihat Teman</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.friendsScroll}
            >
              {friendsLoading ? (
                <ActivityIndicator size="small" color={COLORS.card} />
              ) : (
                friends.slice(0, 4).map((friendData, index) => (
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
                ))
              )}
              <TouchableOpacity style={styles.friendItem} activeOpacity={0.7}>
                <View style={styles.addFriendCircle}>
                  <Ionicons name="add" size={28} color={COLORS.white} />
                </View>
                <Text style={styles.friendName}>Tambah teman</Text>
              </TouchableOpacity>
            </ScrollView>
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
  notificationContainer: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.red,
  },

  // SECTIONS
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  modalSection: {
    marginTop: 5,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 16,
  },

  // ACTIVITY CARD
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
    shadowColor: '#76B9BB',
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
    shadowColor: '#000',
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
    backgroundColor: '#76B9BB',
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

  // GROUP CARDS
  groupCard: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  groupHeader: {
    backgroundColor: LOCAL_COLORS.headerBrown,
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
    color: '#FFFFFF',
  },
  groupHost: {
    fontFamily: FONTS.semiBold,
    color: '#FFFFFF',
  },
  groupContent: {
    backgroundColor: LOCAL_COLORS.cardWhite,
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
    borderColor: LOCAL_COLORS.cardWhite,
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
    color: LOCAL_COLORS.textPrimary,
    marginBottom: 4,
  },
  groupMembers: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    marginBottom: 8,
  },
  addFriendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: LOCAL_COLORS.cardWhite,
    borderWidth: 1,
    borderColor: LOCAL_COLORS.headerBrown,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  addFriendText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: LOCAL_COLORS.headerBrown,
    marginLeft: 4,
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
});
