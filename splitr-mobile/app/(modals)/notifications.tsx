import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SkeletonList } from "../../components/ui/Skeleton";
import { COLORS, FONTS } from "../../constants/theme";
import { useNotifications } from "../../hooks/useApi";
import { useNotificationsStore } from "../../store";

const LOCAL_COLORS = {
  background: COLORS.backgroundMain,
  cardWhite: COLORS.white,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  card: COLORS.card,
};

export default function NotificationsScreen() {
  const { notifications, loading } = useNotifications();
  const { handleNotificationAction, markAsRead } = useNotificationsStore();
  const [forceLoading, setForceLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setForceLoading(false), 1500);
  }, []);

  const handleNotificationPress = async (notification: any) => {
    try {
      // Only group_invitation needs API call to navigate to group detail
      if (notification.type === "group_invitation") {
        try {
          const result = await handleNotificationAction(
            notification.notificationId,
            "view_group"
          );
          if (result?.groupId) {
            router.push({
              pathname: "/(modals)/groups/detail",
              params: { groupId: result.groupId },
            });
            return;
          }
        } catch (error) {
          console.error("API failed for group invitation:", error);
        }

        // Fallback: use groupId from notification
        const groupId = notification.groupId || notification.metadata?.groupId;
        if (groupId) {
          await markAsRead(notification.notificationId);
          router.push({
            pathname: "/(modals)/groups/detail",
            params: { groupId },
          });
          return;
        }
      }

      // For all other notifications (removed, left, deleted, etc), just mark as read
      await markAsRead(notification.notificationId);
    } catch (error) {
      console.error("Error handling notification:", error);
      // Always try to mark as read
      try {
        await markAsRead(notification.notificationId);
      } catch (readError) {
        console.error("Failed to mark as read:", readError);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 3) return "Baru saja";
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} jam lalu`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari lalu`;
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_reminder":
        return "card-outline";
      case "payment_received":
        return "checkmark-circle-outline";
      case "group_invitation":
        return "person-add-outline";
      case "group_member_left":
        return "exit-outline";
      case "group_member_removed":
        return "person-remove-outline";
      case "group_updated":
        return "create-outline";
      case "group_deleted":
        return "trash-outline";
      case "group_invite":
        return "people-outline";
      default:
        return "notifications-outline";
    }
  };

  return (
    <View style={styles.container}>
      {/* Purple Background Section */}
      <View style={[styles.purpleSection, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/home");
              }
            }}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifikasi</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* White Modal Container */}
      <View style={styles.whiteModalContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {loading || forceLoading ? (
            <SkeletonList />
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color={COLORS.gray}
              />
              <Text style={styles.emptyTitle}>Tidak ada notifikasi</Text>
              <Text style={styles.emptySubtitle}>
                Notifikasi akan muncul di sini
              </Text>
            </View>
          ) : (
            notifications.map((notification, index) => (
              <TouchableOpacity
                key={notification.notificationId || index}
                style={[
                  styles.notificationCard,
                  !notification.isRead && styles.unreadNotification,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.cardContent}>
                  <View style={styles.notificationIcon}>
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={24}
                      color="#00897B"
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.isRead && styles.unreadText,
                      ]}
                    >
                      {notification.title}
                    </Text>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <View style={styles.dateContainer}>
                      <Text style={styles.notificationDate}>
                        {formatDate(notification.createdAt)}
                      </Text>
                    </View>
                  </View>
                  {!notification.isRead && <View style={styles.unreadDot} />}
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </View>
  );
}

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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  whiteModalContainer: {
    flex: 1,
    backgroundColor: LOCAL_COLORS.cardWhite,
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: LOCAL_COLORS.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: LOCAL_COLORS.textSecondary,
    marginTop: 8,
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  notificationIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
    lineHeight: 20,
    marginBottom: 8,
  },
  dateContainer: {
    backgroundColor: "#76B9BB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  notificationDate: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: LOCAL_COLORS.textPrimary,
    textAlign: "center",
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#00897B",
    backgroundColor: "#F8FFFF",
  },
  unreadText: {
    fontFamily: FONTS.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00897B",
    position: "absolute",
    top: 16,
    right: 16,
  },
});
