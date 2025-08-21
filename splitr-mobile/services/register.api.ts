import api from './api';

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
  otp: string;
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
  validateBni: (data: ValidateBniRequest): Promise<{ data: ValidateBniResponse }> => {
    return api.post('/api/mobile/auth/validate-bni', data);
  },

  sendOtp: (data: SendOtpRequest): Promise<{ data: SendOtpResponse }> => {
    return api.post('/api/mobile/auth/send-otp', data);
  },

  verifyOtp: (data: VerifyOtpRequest): Promise<{ data: VerifyOtpResponse }> => {
    return api.post('/api/mobile/auth/verify-otp', data);
  },

  completeRegister: (data: CompleteRegisterRequest): Promise<{ data: CompleteRegisterResponse }> => {
    return api.post('/api/mobile/auth/register', data);
  },
};