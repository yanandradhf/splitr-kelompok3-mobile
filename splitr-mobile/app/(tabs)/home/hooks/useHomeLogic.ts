import { useState, useCallback, useEffect } from "react";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "../../../../features/auth/auth.store";
import { useProfileStore } from "../../../../features/profile/profile.store";
import { useFriends, useGroups, useNotifications } from "../../../../hooks/useApi";

export const useHomeLogic = () => {
  const { user } = useAuthStore();
  const { user: storeUser, stats: storeStats, fetchProfile } = useProfileStore();
  
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

  const [refreshing, setRefreshing] = useState(false);
  const [lastNavigationTime, setLastNavigationTime] = useState(0);

  // Fetch profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );
  
  useEffect(() => {
    // Initial fetch on mount
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProfile();
      await refetchFriends();
      await refetchGroups();
      await refetchNotifications();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchProfile, refetchFriends, refetchGroups, refetchNotifications]);

  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const handleNavigation = (path: string) => {
    const now = Date.now();
    if (now - lastNavigationTime > 1000) {
      setLastNavigationTime(now);
      router.push(path);
    }
  };

  const handleGroupPress = (group: any) => {
    console.log('Clicked group:', group.groupId, group.groupName);
    router.replace({
      pathname: "/(modals)/groups/detail",
      params: { 
        groupId: group.groupId,
        groupData: JSON.stringify(group),
        fromHome: 'true'
      },
    });
  };

  return {
    // User data - prioritize storeUser as it has latest profile data
    user: storeUser || user,
    stats: storeStats,
    
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
    showNotificationDot: unreadCount > 0,
    latestNotification: notifications[0],
  };
};