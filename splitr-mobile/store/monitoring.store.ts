import { create } from 'zustand';
import api from '../services/api';
import { API_CONFIG } from '../constants/config';

interface BillActivity {
  billId: string;
  billCode: string;
  billName: string;
  totalBillAmount: number;
  yourShare: number;
  paymentStatus: string;
  paidAt?: string;
  scheduledDate?: string;
  paymentType?: string;
  hostName: string;
  hostAccount?: string;
  paymentDeadline?: string;
  isExpired?: boolean;
  canSchedule?: boolean;
  showPayNow?: boolean;
  isHost: boolean;
  role: string;
  participantCount?: number;
  participantsStatus?: Array<{
    participantId: string;
    userId: string;
    name: string;
    account: string;
    amountShare: number;
    paymentStatus: string;
    paidAt?: string;
    scheduledDate?: string;
    paymentType?: string;
  }>;
  paymentSummary?: {
    totalParticipants: number;
    paidCount: number;
    pendingCount: number;
    totalPaid: number;
    totalPending: number;
  };
  actions?: {
    canPay: boolean;
    canSchedule?: boolean;
    showDeadline?: boolean;
    isPaid: boolean;
    isFailed?: boolean;
  };
  status: string;
  createdAt: string;
}

interface PaymentHistory {
  paymentId: string;
  billName: string;
  amount: number;
  status: string;
  paymentType: string;
  paidAt: string;
  hostName: string;
}

interface MonitoringState {
  billActivities: BillActivity[];
  paymentHistory: PaymentHistory[];
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
        
        // Debug scheduled payments
        activities.forEach(activity => {
          if (activity.paymentStatus === 'scheduled' || activity.paymentStatus === 'completed_scheduled') {
            console.log('📅 Scheduled payment found:', {
              billName: activity.billName,
              paymentStatus: activity.paymentStatus,
              paidAt: activity.paidAt,
              scheduledDate: activity.scheduledDate,
              paymentType: activity.paymentType,
              hasScheduledDate: !!activity.scheduledDate
            });
          }
        });
        
        // Debug all activities
        console.log('📊 All activities:', activities.map(a => ({
          billName: a.billName,
          paymentStatus: a.paymentStatus,
          scheduledDate: a.scheduledDate
        })));
        
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