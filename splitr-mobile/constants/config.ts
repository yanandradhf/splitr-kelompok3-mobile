export const API_CONFIG = {
  BASE_URL: "https://a940d63c81df.ngrok-free.app", // Ganti dengan IP address komputer Anda
  ENDPOINTS: {
    LOGIN: "/api/mobile/auth/login",
    REGISTER: "/api/mobile/auth/register",
    ME: "/api/mobile/auth/me",
    LOGOUT: "/api/mobile/auth/logout",
    PROFILE: "/api/mobile/profile",
    CHANGE_PASSWORD: "/api/mobile/profile/change-password",
    CHANGE_PIN: "/api/mobile/profile/change-pin",
  },
  TIMEOUT: 10000,
};
