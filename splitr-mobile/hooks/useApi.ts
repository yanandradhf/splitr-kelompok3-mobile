import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import api from '../services/api';

import { API_CONFIG } from '../constants/config';

const BASE_URL = API_CONFIG.BASE_URL;

export const useApi = () => {
  const { token } = useAuthStore();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    console.log('🚀 API Call:', {
      url,
      method: config.method || 'GET',
      headers: config.headers,
      hasToken: !!token
    });

    const response = await fetch(url, config);
    
    console.log('📡 API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: response.url
      });
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Success:', { endpoint, dataKeys: Object.keys(data) });
    return data;
  };

  const getFriends = async () => {
    const response = await api.get('/api/mobile/friends');
    return response.data;
  };

  const getGroups = async () => {
    const response = await api.get('/api/mobile/groups');
    return response.data;
  };

  const getNotifications = async () => {
    const response = await api.get('/api/mobile/notifications?limit=20&offset=0');
    return response.data;
  };

  return {
    getFriends,
    getGroups,
    getNotifications,
  };
};

export const useFriends = () => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFriends } = useApi();

  const fetchFriends = async () => {
    try {
      const response = await getFriends();
      setFriends(response.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const refetch = async () => {
    setLoading(true);
    await fetchFriends();
  };

  return { friends, loading, refetch };
};

export const useGroups = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getGroups } = useApi();

  const fetchGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.groups?.slice(0, 2) || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const refetch = async () => {
    setLoading(true);
    await fetchGroups();
  };

  return { groups, loading, refetch };
};

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getNotifications } = useApi();

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const refetch = async () => {
    setLoading(true);
    await fetchNotifications();
  };

  return { notifications, loading, refetch };
};