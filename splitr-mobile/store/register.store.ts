import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { registerAPI } from '../services/register.api';
import { handleApiError } from '../utils/errorHandler';

interface RegisterData {
  nomorRekening: string;
  namaRekening: string;
  phone: string;
  email: string;
  tempToken: string;
  username: string;
  password: string;
  pin: string;
  branchCode: string;
}

interface RegisterState {
  data: Partial<RegisterData>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setStep1Data: (data: { nomorRekening: string; namaRekening: string; phone: string }) => void;
  setStep2Data: (data: { email: string }) => void;
  setStep3Data: (data: { tempToken: string }) => void;
  setStep4Data: (data: { username: string; password: string }) => void;
  setStep5Data: (data: { pin: string }) => void;
  setBranchCode: (branchCode: string) => void;
  
  // API calls
  validateBni: (nomorRekening: string, namaRekening: string) => Promise<boolean>;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  completeRegister: () => Promise<void>;
  
  // Utilities
  clearData: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  data: {},
  isLoading: false,
  error: null,

  setStep1Data: (stepData) => {
    set((state) => ({
      data: { ...state.data, ...stepData }
    }));
  },

  setStep2Data: (stepData) => {
    set((state) => ({
      data: { ...state.data, ...stepData }
    }));
  },

  setStep3Data: (stepData) => {
    set((state) => ({
      data: { ...state.data, ...stepData }
    }));
  },

  setStep4Data: (stepData) => {
    set((state) => ({
      data: { ...state.data, ...stepData }
    }));
  },

  setStep5Data: (stepData) => {
    set((state) => ({
      data: { ...state.data, ...stepData }
    }));
  },

  setBranchCode: (branchCode) => {
    set((state) => ({
      data: { ...state.data, branchCode }
    }));
  },

  validateBni: async (nomorRekening, namaRekening) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerAPI.validateBni({ nomorRekening, namaRekening });
      const { valid, branchCode } = response.data;
      
      if (valid) {
        get().setBranchCode(branchCode);
        return true;
      }
      return false;
    } catch (error: any) {
      const apiError = handleApiError(error);
      set({ error: apiError.message });
      throw new Error(apiError.message);
    } finally {
      set({ isLoading: false });
    }
  },

  sendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await registerAPI.sendOtp({ email });
    } catch (error: any) {
      const apiError = handleApiError(error);
      set({ error: apiError.message });
      throw new Error(apiError.message);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const response = await registerAPI.verifyOtp({ email, otp });
      const { verified, tempToken } = response.data;
      
      if (verified) {
        await SecureStore.setItemAsync('temp_token', tempToken);
        get().setStep3Data({ tempToken });
      } else {
        throw new Error('Kode OTP tidak valid');
      }
    } catch (error: any) {
      const apiError = handleApiError(error);
      set({ error: apiError.message });
      throw new Error(apiError.message);
    } finally {
      set({ isLoading: false });
    }
  },

  completeRegister: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = get();
      
      if (!data.tempToken || !data.username || !data.password || !data.pin || 
          !data.namaRekening || !data.nomorRekening || !data.phone) {
        throw new Error('Data registrasi tidak lengkap');
      }

      await registerAPI.completeRegister({
        tempToken: data.tempToken,
        username: data.username,
        password: data.password,
        pin: data.pin,
        namaRekening: data.namaRekening,
        nomorRekening: data.nomorRekening,
        phone: data.phone,
      });

      // Clear temporary data after successful registration
      await SecureStore.deleteItemAsync('temp_token');
      get().clearData();
    } catch (error: any) {
      const apiError = handleApiError(error);
      set({ error: apiError.message });
      throw new Error(apiError.message);
    } finally {
      set({ isLoading: false });
    }
  },

  clearData: () => {
    set({ data: {}, error: null });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));