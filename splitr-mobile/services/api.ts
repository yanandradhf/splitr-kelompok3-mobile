import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG, ENDPOINTS } from '../config/apiConfig';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
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

// Helper to convert image URLs to ngrok
const convertImageUrls = (obj: any): any => {
  if (!obj) return obj;
  
  const ngrokUrl = process.env.EXPO_PUBLIC_NGROK_URL || "https://c520ce759f72.ngrok-free.app";
  
  if (typeof obj === 'string') {
    // Convert localhost URLs
    if (obj.includes('localhost:3000')) {
      return obj.replace('http://localhost:3000', ngrokUrl);
    }
    // Convert local file paths to server URLs
    if (obj.startsWith('file:///') && (obj.includes('/scans/') || obj.includes('/uploads/'))) {
      const fileName = obj.split('/').pop();
      if (obj.includes('/scans/')) {
        return `${ngrokUrl}/uploads/receipts/${fileName}`;
      }
      if (obj.includes('/uploads/')) {
        return `${ngrokUrl}/uploads/profile/${fileName}`;
      }
    }
    // Convert relative paths
    if (obj.startsWith('/uploads/') || obj.startsWith('/scans/')) {
      return `${ngrokUrl}${obj}`;
    }
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertImageUrls);
  }
  
  if (typeof obj === 'object') {
    const converted = { ...obj };
    Object.keys(converted).forEach(key => {
      if (key.toLowerCase().includes('url') || key.toLowerCase().includes('photo') || key.toLowerCase().includes('image')) {
        converted[key] = convertImageUrls(converted[key]);
      } else if (typeof converted[key] === 'object') {
        converted[key] = convertImageUrls(converted[key]);
      }
    });
    return converted;
  }
  
  return obj;
};

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Convert localhost URLs to ngrok in response data
    if (response.data) {
      response.data = convertImageUrls(response.data);
    }
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
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + ENDPOINTS.LOGIN);
    return api.post(ENDPOINTS.LOGIN, credentials);
  },
  me: () => api.get(ENDPOINTS.ME),
  logout: () => api.post(ENDPOINTS.LOGOUT),
  sendResetOTP: (data: { email: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + ENDPOINTS.SEND_RESET_OTP);
    return api.post(ENDPOINTS.SEND_RESET_OTP, data);
  },
  verifyResetOTP: (data: { email: string; otp: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + ENDPOINTS.VERIFY_RESET_OTP);
    return api.post(ENDPOINTS.VERIFY_RESET_OTP, data);
  },
  resetPassword: (data: { tempToken: string; newPassword: string; confirmPassword: string }) => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + ENDPOINTS.RESET_PASSWORD);
    return api.post(ENDPOINTS.RESET_PASSWORD, data);
  },
  getMyAccount: () => {
    console.log('🌐 Making API call to:', API_CONFIG.BASE_URL + ENDPOINTS.MY_ACCOUNT);
    return api.get(ENDPOINTS.MY_ACCOUNT);
  },
};

// Profile API methods moved to services/profile.api.ts

export default api;