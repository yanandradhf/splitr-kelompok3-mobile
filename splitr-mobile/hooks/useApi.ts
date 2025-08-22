import { useState, useEffect } from 'react';
import { 
  useGroupsStore, 
  useNotificationsStore, 
  useFriendsStore, 
  useProfileStore 
} from '../store';
import { DEBOUNCE_DELAY } from '../constants/config';

// Debounced hooks that use Zustand stores with axios services

export const useFriends = () => {
  const { 
    friends, 
    isLoading: loading, 
    fetchFriends 
  } = useFriendsStore();
  const [lastFetch, setLastFetch] = useState(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetch > DEBOUNCE_DELAY.API_CALLS) {
      fetchFriends();
      setLastFetch(now);
    }
  }, []);

  const refetch = async () => {
    await fetchFriends();
    setLastFetch(Date.now());
  };

  return { friends, loading, refetch };
};

export const useGroups = (limitForHome = true) => {
  const { 
    groups, 
    isLoading: loading, 
    fetchGroups 
  } = useGroupsStore();
  const [lastFetch, setLastFetch] = useState(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetch > DEBOUNCE_DELAY.API_CALLS) {
      fetchGroups();
      setLastFetch(now);
    }
  }, []);

  const refetch = async () => {
    await fetchGroups();
    setLastFetch(Date.now());
  };

  // Return limited groups for home, all groups for other screens
  return { 
    groups: limitForHome ? groups.slice(0, 2) : groups, 
    loading, 
    refetch 
  };
};

export const useNotifications = () => {
  const { 
    notifications, 
    unreadCount,
    isLoading: loading, 
    fetchNotifications 
  } = useNotificationsStore();
  const [lastFetch, setLastFetch] = useState(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetch > DEBOUNCE_DELAY.API_CALLS) {
      fetchNotifications();
      setLastFetch(now);
    }
  }, []);

  const refetch = async () => {
    await fetchNotifications(true);
    setLastFetch(Date.now());
  };

  return { 
    notifications, 
    unreadCount,
    loading, 
    refetch 
  };
};

export const useProfileData = () => {
  const { 
    user, 
    stats,
    isLoading: loading, 
    fetchProfile 
  } = useProfileStore();
  const [lastFetch, setLastFetch] = useState(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetch > DEBOUNCE_DELAY.API_CALLS) {
      fetchProfile();
      setLastFetch(now);
    }
  }, []);

  const refetch = async () => {
    await fetchProfile();
    setLastFetch(Date.now());
  };

  return { 
    profile: { user, stats },
    loading, 
    refetch 
  };
};