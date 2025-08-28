/**
 * Simple image URL helper - no dependencies
 */

// Get ngrok URL directly
const getNgrokUrl = (): string => {
  return process.env.EXPO_PUBLIC_NGROK_URL || "https://c520ce759f72.ngrok-free.app";
};

// Simple image URL converter
export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  
  // If already absolute URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Convert relative path to full URL
  const baseUrl = getNgrokUrl();
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : '/' + imagePath}`;
};

// Fallback avatar generator
export const getFallbackAvatar = (name: string, size: number = 50): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&bold=true`;
};