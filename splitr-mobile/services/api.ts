import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
      
      // Only delete tokens for actual authentication failures, not validation errors
      const isAuthFailure = errorMessage.includes('token') || 
                           errorMessage.includes('unauthorized') || 
                           errorMessage.includes('expired') ||
                           errorMessage === 'Access token required';
      
      if (isAuthFailure) {
        console.log('🚨 Authentication failure - clearing tokens');
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_data');
      } else {
        console.log('⚠️ 401 but not auth failure');
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { username: string; password: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOGIN);
    return api.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
  },
  me: () => api.get(API_CONFIG.ENDPOINTS.ME),
  logout: () => api.post(API_CONFIG.ENDPOINTS.LOGOUT),
  sendResetOTP: (data: { email: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SEND_RESET_OTP);
    return api.post(API_CONFIG.ENDPOINTS.SEND_RESET_OTP, data);
  },
  verifyResetOTP: (data: { email: string; otp: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.VERIFY_RESET_OTP);
    return api.post(API_CONFIG.ENDPOINTS.VERIFY_RESET_OTP, data);
  },
  resetPassword: (data: { tempToken: string; newPassword: string; confirmPassword: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.RESET_PASSWORD);
    return api.post(API_CONFIG.ENDPOINTS.RESET_PASSWORD, data);
  },
  getMyAccount: () => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.MY_ACCOUNT);
    return api.get(API_CONFIG.ENDPOINTS.MY_ACCOUNT);
  },
};

// Profile API methods moved to services/profile.api.ts

export default api;