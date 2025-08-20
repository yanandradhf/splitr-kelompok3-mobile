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
  (error) => {
    if (error.response?.status === 401) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
      
      // Only delete tokens for actual authentication failures, not validation errors
      const isAuthFailure = errorMessage.includes('token') || 
                           errorMessage.includes('unauthorized') || 
                           errorMessage.includes('expired') ||
                           errorMessage === 'Access token required';
      
      if (isAuthFailure) {
        console.log('🚨 Authentication failure - clearing tokens');
        SecureStore.deleteItemAsync('auth_token');
        SecureStore.deleteItemAsync('user_data');
      } else {
        console.log('⚠️ 401 but not auth failure:', errorMessage);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { username: string; password: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.LOGIN);
    console.log('🌐 With credentials:', credentials);
    return api.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
  },
  me: () => api.get(API_CONFIG.ENDPOINTS.ME),
  register: (data: any) => api.post(API_CONFIG.ENDPOINTS.REGISTER, data),
  logout: () => api.post(API_CONFIG.ENDPOINTS.LOGOUT),
};

export const profileAPI = {
  getProfile: () => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROFILE);
    return api.get(API_CONFIG.ENDPOINTS.PROFILE);
  },
  updateProfile: (data: { name: string; phone: string; email: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.PROFILE);
    return api.put(API_CONFIG.ENDPOINTS.PROFILE, data);
  },
  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    return api.put(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD, data);
  },
  changePin: (data: { currentPin: string; newPin: string; confirmPin: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CHANGE_PIN);
    return api.put(API_CONFIG.ENDPOINTS.CHANGE_PIN, data);
  },
};

export default api;