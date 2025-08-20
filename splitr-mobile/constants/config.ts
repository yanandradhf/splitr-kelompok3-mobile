export const API_CONFIG = {
  BASE_URL: "https://a940d63c81df.ngrok-free.app", // Ganti dengan IP address komputer Anda
  ENDPOINTS: {
    LOGIN: "/api/mobile/auth/login",
    REGISTER: "/api/mobile/auth/register",
    VALIDATE_BNI: "/api/mobile/auth/validate-bni",
    SEND_OTP: "/api/mobile/auth/send-otp",
    VERIFY_OTP: "/api/mobile/auth/verify-otp",
    ME: "/api/mobile/auth/me",
    LOGOUT: "/api/mobile/auth/logout",
  },
  TIMEOUT: 10000,
};
