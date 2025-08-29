import { LogBox } from 'react-native';

// Disable axios warnings in development
if (__DEV__) {
  LogBox.ignoreLogs([
    'Axios',
    'Network request failed',
    'Request failed',
    'timeout',
    'NETWORK_ERROR'
  ]);
}

// Error modal functions
export const showErrorModal = (title: string, message?: string) => {
  const { useErrorStore } = require('../store/errorStore');
  const { showError } = useErrorStore.getState();
  showError(title, message || 'Terjadi kesalahan, silakan coba lagi');
};

// Session expired modal with redirect after user taps OK
export const showSessionExpiredModal = () => {
  const { useErrorStore } = require('../store/errorStore');
  const { showSessionExpired } = useErrorStore.getState();
  showSessionExpired();
};

// Legacy function for backward compatibility
export const showErrorToast = showErrorModal;

// Global error handler for API responses
export const handleApiError = (error: any): { title: string; message: string } => {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return {
          title: 'Data Tidak Valid',
          message: data?.message || 'Periksa kembali data yang dimasukkan'
        };
      case 401:
        return {
          title: 'Sesi Habis',
          message: 'Silakan login kembali'
        };
      case 404:
        return {
          title: 'Data Tidak Ditemukan',
          message: data?.message || 'Data yang dicari tidak tersedia'
        };
      case 422:
        return {
          title: 'Data Tidak Valid',
          message: data?.message || 'Periksa kembali data yang dimasukkan'
        };
      case 500:
        return {
          title: 'Server Error',
          message: 'Terjadi kesalahan pada server, coba lagi nanti'
        };
      default:
        return {
          title: 'Terjadi Kesalahan',
          message: data?.message || 'Silakan coba lagi'
        };
    }
  } else if (error.request) {
    return {
      title: 'Koneksi Bermasalah',
      message: 'Periksa koneksi internet Anda'
    };
  } else {
    return {
      title: 'Terjadi Kesalahan',
      message: error.message || 'Silakan coba lagi'
    };
  }
};

export const showApiError = (error: any) => {
  const { title, message } = handleApiError(error);
  showErrorModal(title, message);
};