import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';

export interface ProfileUser {
  userId: string;
  name: string;
  email: string;
  username: string;
  phone: string;
  bniAccountNumber: string;
  bniBranchCode: string;
  isVerified: boolean;
  defaultPaymentMethod: string;
  createdAt: string;
}

export interface ProfileStats {
  totalBills: number;        // Total bills (hosted + participated)
  completedBills: number;    // Bills yang sudah selesai semua
  ongoingBills: number;      // Bills yang masih ada yang belum bayar
  totalSpent: number;        // Total uang yang sudah dibayar sebagai participant
  pendingPayments: number;   // Tagihan yang masih pending sebagai participant
}

export interface ProfileResponse {
  user: ProfileUser;
  stats: ProfileStats;
}

export interface UpdateProfileRequest {
  name: string;
  phone: string;
  email: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: {
    userId: string;
    name: string;
    phone: string;
    email: string;
  };
}

export const profileAPI = {
  getProfile: (): Promise<{ data: ProfileResponse }> => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.PROFILE);
    return api.get(API_CONFIG.ENDPOINTS.PROFILE);
  },
  
  updateProfile: (data: UpdateProfileRequest): Promise<{ data: UpdateProfileResponse }> => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.PROFILE);
    return api.put(API_CONFIG.ENDPOINTS.PROFILE, data);
  },
  
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.CHANGE_PASSWORD);
    return api.put(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, data);
  },
  
  changePin: (data: { currentPin: string; newPin: string; confirmPin: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.ENDPOINTS.CHANGE_PIN);
    return api.put(API_CONFIG.ENDPOINTS.CHANGE_PIN, data);
  },
};