import api from './api';

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
  totalBills: number;
  totalSpent: number;
  pendingPayments: number;
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
    return api.get('/api/mobile/profile');
  },
  
  updateProfile: (data: UpdateProfileRequest): Promise<{ data: UpdateProfileResponse }> => {
    return api.put('/api/mobile/profile', data);
  },
};