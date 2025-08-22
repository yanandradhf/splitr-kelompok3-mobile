import api from '../../services/api';
import { API_CONFIG } from '../../constants/config';

export interface ValidateBniRequest {
  namaRekening: string;
  nomorRekening: string;
}

export interface ValidateBniResponse {
  valid: boolean;
  branchCode: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  verified: boolean;
  tempToken: string;
}

export interface CompleteRegisterRequest {
  tempToken: string;
  username: string;
  password: string;
  pin: string;
  namaRekening: string;
  nomorRekening: string;
  phone: string;
}

export interface CompleteRegisterResponse {
  message: string;
  user: {
    userId: string;
    name: string;
    email: string;
    username: string;
    bniAccountNumber: string;
  };
}

export const registerAPI = {
  validateBni: async (data: ValidateBniRequest): Promise<{ data: ValidateBniResponse }> => {
    try {
      return await api.post(API_CONFIG.ENDPOINTS.VALIDATE_BNI, data);
    } catch (error) {
      console.error('Error validating BNI:', error);
      throw error;
    }
  },

  sendOtp: async (data: SendOtpRequest): Promise<{ data: SendOtpResponse }> => {
    try {
      return await api.post(API_CONFIG.ENDPOINTS.SEND_OTP, data);
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<{ data: VerifyOtpResponse }> => {
    try {
      return await api.post(API_CONFIG.ENDPOINTS.VERIFY_OTP, data);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  completeRegister: async (data: CompleteRegisterRequest): Promise<{ data: CompleteRegisterResponse }> => {
    try {
      return await api.post(API_CONFIG.ENDPOINTS.REGISTER, data);
    } catch (error) {
      console.error('Error completing registration:', error);
      throw error;
    }
  },
};