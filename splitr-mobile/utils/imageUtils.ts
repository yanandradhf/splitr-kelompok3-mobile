// Re-export from centralized base URL config
export { getImageUrl } from '../config/baseUrl';

// Fallback avatar generator
export const getFallbackAvatar = (name: string, size: number = 50): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&bold=true`;
};