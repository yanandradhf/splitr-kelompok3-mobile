import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  isOnline: boolean;
  hasError: boolean;
  errorMessage: string | null;
  setLoading: (loading: boolean) => void;
  setOnline: (online: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isLoading: true,
  isOnline: true,
  hasError: false,
  errorMessage: null,
  
  setLoading: (loading) => set({ isLoading: loading }),
  setOnline: (online) => set({ isOnline: online }),
  setError: (error) => set({ 
    hasError: !!error, 
    errorMessage: error 
  }),
  clearError: () => set({ 
    hasError: false, 
    errorMessage: null 
  }),
}));