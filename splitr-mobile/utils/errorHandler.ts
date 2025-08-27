import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleSessionError = async (error: any) => {
  const errorCode = error.response?.data?.code;
  const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
  
  // Handle session replacement/expiry
  if (errorCode === 'SESSION_REPLACED' || errorCode === 'SESSION_EXPIRED') {
    console.log('🚨 Session invalid:', errorCode);
    
    await clearTokensAndRedirect('Your account was accessed from another device. Please login again.');
    return true;
  }
  
  // Handle invalid token
  if (errorCode === 'INVALID_TOKEN' || 
      errorMessage.includes('invalid') || 
      errorMessage.includes('malformed') ||
      errorMessage.includes('expired')) {
    console.log('🚨 Invalid token detected:', errorMessage);
    
    await clearTokensAndRedirect('Your session has expired. Please login again.');
    return true;
  }
  
  return false; // Not handled
};

const clearTokensAndRedirect = async (message: string) => {
  // Clear tokens locally (don't call logout API)
  try {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user_data');
  } catch (storageError) {
    console.log('Storage cleanup error:', storageError);
  }
  
  // Show user-friendly message
  Alert.alert(
    'Session Invalid',
    message,
    [{ text: 'Login', onPress: () => router.replace('/(auth)/login') }]
  );
};

export const handleApiError = async (error: any): Promise<ApiError> => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || 'Terjadi kesalahan pada server';
    
    switch (status) {
      case 400:
        return { message: 'Data yang dikirim tidak valid', status };
      case 401:
        const handled = await handleSessionError(error);
        if (handled) {
          return { message: 'Session expired', status, code: error.response.data?.code };
        }
        return { message: 'Sesi Anda telah berakhir, silakan login kembali', status };
      case 403:
        const errorMessage403 = error.response.data?.message || error.response.data?.error || '';
        const isInvalidToken403 = errorMessage403.includes('invalid') || 
                                 errorMessage403.includes('token') ||
                                 error.response.data?.code === 'INVALID_TOKEN';
        
        if (isInvalidToken403) {
          const handled403 = await handleSessionError(error);
          if (handled403) {
            return { message: 'Invalid token', status, code: error.response.data?.code };
          }
        }
        return { message: 'Anda tidak memiliki akses untuk melakukan aksi ini', status };
      case 404:
        return { message: 'Data tidak ditemukan', status };
      case 422:
        return { message: message || 'Data tidak valid', status };
      case 500:
        return { message: 'Terjadi kesalahan pada server', status };
      default:
        return { message, status };
    }
  } else if (error.request) {
    // Network error
    return { 
      message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
      code: 'NETWORK_ERROR'
    };
  } else {
    // Other error
    return { 
      message: error.message || 'Terjadi kesalahan yang tidak diketahui',
      code: 'UNKNOWN_ERROR'
    };
  }
};

export const showErrorAlert = async (error: any, title: string = 'Error') => {
  const apiError = await handleApiError(error);
  Alert.alert(title, apiError.message);
};