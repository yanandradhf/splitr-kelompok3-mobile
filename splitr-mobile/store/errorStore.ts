import { create } from 'zustand';

interface ErrorState {
  isVisible: boolean;
  title: string;
  message: string;
  isSessionExpired: boolean;
  showError: (title: string, message: string) => void;
  showSessionExpired: () => void;
  hideError: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  isVisible: false,
  title: '',
  message: '',
  isSessionExpired: false,
  
  showError: (title: string, message: string) => {
    set({ isVisible: true, title, message, isSessionExpired: false });
  },
  
  showSessionExpired: () => {
    set({ 
      isVisible: true, 
      title: 'Sesi Habis', 
      message: 'Silakan login kembali',
      isSessionExpired: true 
    });
  },
  
  hideError: () => {
    set({ isVisible: false, title: '', message: '', isSessionExpired: false });
  },
}));