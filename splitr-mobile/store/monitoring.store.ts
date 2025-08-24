import { create } from 'zustand';
import api from '../services/api';
import { API_CONFIG } from '../constants/config';

interface MonitoringState {
  billActivities: any[];
  paymentHistory: any[];
  loading: boolean;
  historyLoading: boolean;
  lastRefresh: number;
  
  fetchMyActivity: () => Promise<void>;
  fetchPaymentHistory: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set, get) => ({
  billActivities: [],
  paymentHistory: [],
  loading: false,
  historyLoading: false,
  lastRefresh: 0,

  fetchMyActivity: async () => {
    const { loading } = get();
    if (loading) return; // Prevent duplicate calls
    
    try {
      set({ loading: true });
      const timestamp = Date.now();
      const response = await api.get(
        `${API_CONFIG.ENDPOINTS.MY_ACTIVITY}?limit=10&_t=${timestamp}`
      );
      
      if (response.data.success) {
        const activities = response.data.myActivity || [];
        console.log('🔄 Store updated with', activities.length, 'activities');
        set({ 
          billActivities: activities,
          lastRefresh: timestamp,
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching my activity:', error);
      set({ loading: false });
    }
  },

  fetchPaymentHistory: async () => {
    try {
      set({ historyLoading: true });
      const timestamp = Date.now();
      const response = await api.get(
        `${API_CONFIG.ENDPOINTS.PAYMENT_HISTORY}?page=1&limit=20&_t=${timestamp}`
      );
      
      if (response.data.success) {
        set({ 
          paymentHistory: response.data.payments || [],
          historyLoading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      set({ historyLoading: false });
    }
  },

  refreshAll: async () => {
    const { fetchMyActivity, fetchPaymentHistory } = get();
    await Promise.all([
      fetchMyActivity(),
      fetchPaymentHistory()
    ]);
  },
}));