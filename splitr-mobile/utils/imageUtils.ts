// Re-export from centralized ngrok config
export { getImageUrl } from '../config/ngrok';

// Fallback avatar generator
export const getFallbackAvatar = (name: string, size: number = 50): string => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=${size}&background=random&bold=true`;
};