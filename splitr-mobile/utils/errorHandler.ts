import { Alert } from 'react-native';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || 'Terjadi kesalahan pada server';
    
    switch (status) {
      case 400:
        return { message: 'Data yang dikirim tidak valid', status };
      case 401:
        return { message: 'Sesi Anda telah berakhir, silakan login kembali', status };
      case 403:
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

export const showErrorAlert = (error: any, title: string = 'Error') => {
  const apiError = handleApiError(error);
  Alert.alert(title, apiError.message);
};