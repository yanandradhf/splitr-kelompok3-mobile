import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';

export const notificationsAPI = {
  // Get notifications with pagination
  getNotifications: (limit = 20, offset = 0, unreadOnly = false) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      unreadOnly: unreadOnly.toString()
    });
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.NOTIFICATIONS}?${params}`);
    return api.get(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}?${params}`);
  },

  // Handle notification action (only view_group available)
  handleNotificationAction: async (notificationId: string, action = 'view_group') => {
    try {
      console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.NOTIFICATION_ACTION);
      console.log('🌐 Payload:', { notificationId, action });
      return await api.post(API_CONFIG.ENDPOINTS.NOTIFICATION_ACTION, { notificationId, action });
    } catch (error) {
      console.error('❌ Notification action API error:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: (notificationId: string) => {
    console.log(`🌐 Making API call to: ${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
    return api.put(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`);
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.MARK_ALL_READ);
    return api.put(API_CONFIG.ENDPOINTS.MARK_ALL_READ);
  },
};