export const API_CONFIG = {
  BASE_URL: "https://bbad82a9b9c6.ngrok-free.app", // Ganti dengan IP address komputer Anda
  ENDPOINTS: {
    LOGIN: "/api/mobile/auth/login",
    REGISTER: "/api/mobile/auth/register",
    VALIDATE_BNI: "/api/mobile/auth/validate-bni",
    SEND_OTP: "/api/mobile/auth/send-otp",
    VERIFY_OTP: "/api/mobile/auth/verify-otp",
    ME: "/api/mobile/auth/me",
    LOGOUT: "/api/mobile/auth/logout",
    PROFILE: "/api/mobile/profile",
    CHANGE_PASSWORD: "/api/mobile/profile/change-password",
    CHANGE_PIN: "/api/mobile/profile/change-pin",
    SEND_RESET_OTP: "/api/mobile/auth/send-reset-otp",
    VERIFY_RESET_OTP: "/api/mobile/auth/verify-reset-otp",
    RESET_PASSWORD: "/api/mobile/auth/reset-password",
    MY_ACCOUNT: "/api/mobile/auth/my-account",
  },
  TIMEOUT: 10000,
};
