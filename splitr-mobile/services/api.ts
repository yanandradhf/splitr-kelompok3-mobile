import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../constants/config';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
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
      SecureStore.deleteItemAsync('auth_token');
      SecureStore.deleteItemAsync('user_data');
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

export default api;