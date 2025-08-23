import { create } from 'zustand';
import { notificationsAPI } from '../../services';

interface NotificationMetadata {
  groupId?: string;
  groupName?: string;
  creatorName?: string;
  action?: string;
  billId?: string;
  billName?: string;
}

interface Notification {
  notificationId: string;
  type: 'group_invitation' | 'group_member_left' | 'group_member_removed' | 'group_updated' | 'group_deleted' | 'payment_reminder' | 'payment_received' | 'bill_assignment';
  title: string;
  message: string;
  billId?: string;
  billName?: string;
  groupId?: string;
  groupName?: string;
  metadata: NotificationMetadata;
  isRead: boolean;
  sentAt: string;
  createdAt: string;
}

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  isMarkingRead: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Actions
  fetchNotifications: (refresh?: boolean) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  handleNotificationAction: (notificationId: string, action?: string) => Promise<{ groupId?: string }>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  isLoading: false,
  isLoadingMore: false,
  isMarkingRead: false,
  error: null,
  hasMore: true,

  fetchNotifications: async (refresh = false) => {
    set({ isLoading: refresh, error: null });
    try {
      const response = await notificationsAPI.getNotifications(20, 0);
      const { notifications, unreadCount, totalCount } = response.data;
      
      set({ 
        notifications: notifications || [],
        unreadCount: unreadCount || 0,
        totalCount: totalCount || 0,
        hasMore: (notifications?.length || 0) < (totalCount || 0),
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false 
      });
    }
  },

  loadMoreNotifications: async () => {
    const { notifications, hasMore, isLoadingMore } = get();
    
    if (!hasMore || isLoadingMore) return;
    
    set({ isLoadingMore: true, error: null });
    try {
      const response = await notificationsAPI.getNotifications(20, notifications.length);
      const { notifications: newNotifications, totalCount } = response.data;
      
      set(state => ({ 
        notifications: [...state.notifications, ...(newNotifications || [])],
        totalCount: totalCount || state.totalCount,
        hasMore: (state.notifications.length + (newNotifications?.length || 0)) < (totalCount || 0),
        isLoadingMore: false 
      }));
    } catch (error: any) {
      console.error('Error loading more notifications:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to load more notifications',
        isLoadingMore: false 
      });
    }
  },

  handleNotificationAction: async (notificationId, action = 'view_group') => {
    try {
      console.log('🔔 Handling notification action:', { notificationId, action });
      
      // Find the notification first
      const notification = get().notifications.find(n => n.notificationId === notificationId);
      if (!notification) {
        console.error('❌ Notification not found:', notificationId);
        throw new Error('Notification not found');
      }
      
      console.log('🔔 Found notification:', notification);
      
      // For group notifications, try to extract groupId from metadata or notification itself
      if (notification.type.includes('group')) {
        const groupId = notification.groupId || notification.metadata?.groupId;
        
        if (groupId) {
          console.log('🔔 Using groupId from notification:', groupId);
          
          // Mark as read locally first
          set(state => ({
            notifications: state.notifications.map(notif => 
              notif.notificationId === notificationId 
                ? { ...notif, isRead: true }
                : notif
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
          
          // Try API call, but don't fail if it errors
          try {
            const response = await notificationsAPI.handleNotificationAction(notificationId, action);
            return { groupId, ...response.data };
          } catch (apiError) {
            console.warn('⚠️ API call failed, using fallback:', apiError);
            return { groupId };
          }
        }
      }
      
      // For non-group notifications or when no groupId found, use normal flow
      const response = await notificationsAPI.handleNotificationAction(notificationId, action);
      
      // Mark notification as read locally
      set(state => ({
        notifications: state.notifications.map(notif => 
          notif.notificationId === notificationId 
            ? { ...notif, isRead: true }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error handling notification action:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to handle notification action'
      });
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    set({ isMarkingRead: true, error: null });
    try {
      await notificationsAPI.markAsRead(notificationId);
      
      // Update notification locally
      set(state => ({
        notifications: state.notifications.map(notif => 
          notif.notificationId === notificationId 
            ? { ...notif, isRead: true }
            : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        isMarkingRead: false
      }));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to mark notification as read',
        isMarkingRead: false 
      });
    }
  },

  markAllAsRead: async () => {
    set({ isMarkingRead: true, error: null });
    try {
      const response = await notificationsAPI.markAllAsRead();
      
      // Mark all notifications as read locally
      set(state => ({
        notifications: state.notifications.map(notif => ({ ...notif, isRead: true })),
        unreadCount: 0,
        isMarkingRead: false
      }));
      
      return response.data;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to mark all notifications as read',
        isMarkingRead: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));