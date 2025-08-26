/**
 * Centralized ngrok configuration
 * Update this file when ngrok URL changes
 */

// Get ngrok URL from environment variable
export const NGROK_URL = process.env.EXPO_PUBLIC_NGROK_URL || "https://2cf65d03461e.ngrok-free.app";

// Helper to get full URL
export const getFullUrl = (path: string = ''): string => {
  if (!path) return NGROK_URL;
  return `${NGROK_URL}${path.startsWith('/') ? path : '/' + path}`;
};

// Helper for image URLs
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  
  // If already absolute URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Get base URL with fallback
  const baseUrl = NGROK_URL || "https://c520ce759f72.ngrok-free.app";
  
  // Convert relative path to full URL
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

// Export for backward compatibility
export default {
  NGROK_URL,
  getFullUrl,
  getImageUrl
};