/**
 * Environment Variable Checker
 * Debug helper untuk memastikan env vars terbaca dengan benar
 */

export const checkEnvVars = () => {
  const envVars = {
    BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL,
    GROQ_API_KEY: process.env.EXPO_PUBLIC_GROQ_API_KEY,
    GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  };

  console.log('🔍 Environment Variables Check:');
  
  Object.entries(envVars).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const displayValue = value ? 
      (key.includes('KEY') ? `${value.substring(0, 10)}...` : value) : 
      'NOT SET';
    
    console.log(`${status} ${key}: ${displayValue}`);
  });

  return envVars;
};

export const isGroqAvailable = (): boolean => {
  const key = process.env.EXPO_PUBLIC_GROQ_API_KEY;
  return !!(key && key.trim() && key !== '');
};

export const isBaseUrlAvailable = (): boolean => {
  const url = process.env.EXPO_PUBLIC_API_BASE_URL;
  return !!(url && url.trim() && url !== '' && url.startsWith('http'));
};