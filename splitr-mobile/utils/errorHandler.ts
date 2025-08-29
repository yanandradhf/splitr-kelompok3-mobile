import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleSessionError = async (error: any) => {
  // Session errors are now handled directly in API interceptor
  // This function is kept for backward compatibility
  return false;
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