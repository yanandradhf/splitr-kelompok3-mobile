/**
 * Centralized API base URL configuration
 * Update this file when base URL changes
 */

import Constants from 'expo-constants';

// Get base URL from environment variable with fallback to app.json
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_API_BASE_URL;

// Helper to get full URL
export const getFullUrl = (path: string = ''): string => {
  if (!path) return BASE_URL;
  return `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
};

// Helper for image URLs
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  
  // If already absolute URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Convert relative path to full URL
  return `${BASE_URL}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

// Export for backward compatibility
export default {
  BASE_URL,
  getFullUrl,
  getImageUrl
};

// Legacy export
export const NGROK_URL = BASE_URL;