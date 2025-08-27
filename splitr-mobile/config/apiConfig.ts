import { NGROK_URL } from './ngrok';

/**
 * Centralized API Configuration
 * All API endpoints and external services in one place
 */

// Main API Configuration
export const API_CONFIG = {
  BASE_URL: NGROK_URL,
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  }
};

// Internal API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: "/api/mobile/auth/login",
  REGISTER: "/api/mobile/auth/register", 
  VALIDATE_BNI: "/api/mobile/auth/validate-bni",
  SEND_OTP: "/api/mobile/auth/send-otp",
  VERIFY_OTP: "/api/mobile/auth/verify-otp",
  ME: "/api/mobile/auth/me",
  LOGOUT: "/api/mobile/auth/logout",
  REFRESH: "/api/mobile/auth/refresh",
  SEND_RESET_OTP: "/api/mobile/auth/send-reset-otp",
  VERIFY_RESET_OTP: "/api/mobile/auth/verify-reset-otp",
  RESET_PASSWORD: "/api/mobile/auth/reset-password",
  MY_ACCOUNT: "/api/mobile/auth/my-account",

  // Profile
  PROFILE: "/api/mobile/profile",
  CHANGE_PASSWORD: "/api/mobile/profile/change-password",
  CHANGE_PIN: "/api/mobile/profile/change-pin",

  // Friends
  FRIENDS: "/api/mobile/friends",
  ADD_FRIEND: "/api/mobile/friends/add",
  SEARCH_FRIEND: "/api/mobile/friends/search",
  REMOVE_FRIEND: "/api/mobile/friends/remove",

  // Groups
  GROUPS: "/api/mobile/groups",
  CREATE_GROUP: "/api/mobile/groups/create",

  // Notifications
  NOTIFICATIONS: "/api/mobile/notifications",
  NOTIFICATION_ACTION: "/api/mobile/notifications/group-action",
  MARK_ALL_READ: "/api/mobile/notifications/read-all",

  // Bills
  BILL_DETAIL: "/api/mobile/bills",
  MY_ACTIVITY: "/api/mobile/bills/my-activity",
  PERSONAL: "/api/mobile/bills/personal",
  MASTER: "/api/mobile/bills/master",
  CREATE_BILL: "/api/mobile/bills/create",

  // Payment
  PAYMENT_CREATE: "/api/mobile/payments/create",
  PAYMENT_HISTORY: "/api/mobile/payments/history",
  PAYMENT_RECEIPT: "/api/mobile/payments/:paymentId/receipt",

  // Upload
  UPLOAD_RECEIPT: "/api/mobile/upload/receipt",
};

// External API Services (OCR, AI, etc.) - Using environment variables
export const EXTERNAL_APIS = {
  // Groq AI for OCR
  GROQ: {
    URL: 'https://api.groq.com/openai/v1/chat/completions',
    KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
    MODEL: 'meta-llama/llama-4-scout-17b-instruct',
    RATE_LIMIT: 2000 // ms between requests
  },

  // Google Gemini (backup OCR)
  GEMINI: {
    URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY || ''
  },

  // OCR.space (fallback)
  OCR_SPACE: {
    URL: 'https://api.ocr.space/parse/image',
    KEY: process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY || ''
  },

  // OpenAI (optional)
  OPENAI: {
    URL: 'https://api.openai.com/v1/chat/completions',
    KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || ''
  },

  // Google Vision (optional)
  GOOGLE_VISION: {
    URL: 'https://vision.googleapis.com/v1/images:annotate',
    KEY: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || ''
  }
};

// Helper functions
export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getExternalUrl = (service: keyof typeof EXTERNAL_APIS, params?: Record<string, string>): string => {
  const config = EXTERNAL_APIS[service];
  let url = config.URL;
  
  if (service === 'GEMINI' && config.KEY) {
    url += `?key=${config.KEY}`;
  }
  
  return url;
};

// Rate limiting helper
const lastRequestTimes = new Map<string, number>();

export const checkRateLimit = (service: string, minInterval: number): Promise<void> => {
  return new Promise((resolve) => {
    const now = Date.now();
    const lastTime = lastRequestTimes.get(service) || 0;
    const timeSinceLastRequest = now - lastTime;
    
    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      setTimeout(() => {
        lastRequestTimes.set(service, Date.now());
        resolve();
      }, waitTime);
    } else {
      lastRequestTimes.set(service, now);
      resolve();
    }
  });
};

export default {
  API_CONFIG,
  ENDPOINTS,
  EXTERNAL_APIS,
  getFullUrl,
  getExternalUrl,
  checkRateLimit
};