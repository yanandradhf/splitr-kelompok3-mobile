/**
 * Environment Variables Helper
 * Centralized access to environment variables with validation
 */

// Validate required environment variables
const validateEnvVar = (key: string, value: string | undefined, required = false): string | undefined => {
  if (required && !value) {
    if (__DEV__) {
      console.warn(`⚠️ Missing required environment variable: ${key}`);
    }
  }
  return value;
};

// Environment configuration
export const ENV = {
  // Base API URL (required)
  BASE_URL: validateEnvVar('EXPO_PUBLIC_API_BASE_URL', process.env.EXPO_PUBLIC_API_BASE_URL, true),
  
  // External API Keys (optional, fallback to empty string)
  API_KEYS: {
    GROQ: validateEnvVar('EXPO_PUBLIC_GROQ_API_KEY', process.env.EXPO_PUBLIC_GROQ_API_KEY),
    GEMINI: validateEnvVar('EXPO_PUBLIC_GEMINI_API_KEY', process.env.EXPO_PUBLIC_GEMINI_API_KEY),
    OCR_SPACE: validateEnvVar('EXPO_PUBLIC_OCR_SPACE_API_KEY', process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY),
    OPENAI: validateEnvVar('EXPO_PUBLIC_OPENAI_API_KEY', process.env.EXPO_PUBLIC_OPENAI_API_KEY),
    GOOGLE_VISION: validateEnvVar('EXPO_PUBLIC_GOOGLE_VISION_API_KEY', process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY),
  },
  
  // Development flags
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,
};

// Helper to check if API key is available
export const hasApiKey = (service: keyof typeof ENV.API_KEYS): boolean => {
  return !!ENV.API_KEYS[service];
};

// Helper to get API key safely
export const getApiKey = (service: keyof typeof ENV.API_KEYS): string => {
  const key = ENV.API_KEYS[service];
  if (!key && __DEV__) {
    console.warn(`⚠️ API key not found for service: ${service}`);
  }
  return key;
};

export default ENV;