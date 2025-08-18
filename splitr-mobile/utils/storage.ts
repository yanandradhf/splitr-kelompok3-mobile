import * as SecureStore from 'expo-secure-store';

export const storage = {
  // Secure storage for sensitive data
  setSecure: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error storing secure data:', error);
    }
  },

  getSecure: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error retrieving secure data:', error);
      return null;
    }
  },

  removeSecure: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing secure data:', error);
    }
  },

  // Helper methods
  setToken: (token: string) => storage.setSecure('auth_token', token),
  getToken: () => storage.getSecure('auth_token'),
  removeToken: () => storage.removeSecure('auth_token'),
  
  setUser: (user: object) => storage.setSecure('user_data', JSON.stringify(user)),
  getUser: async () => {
    const userData = await storage.getSecure('user_data');
    return userData ? JSON.parse(userData) : null;
  },
  removeUser: () => storage.removeSecure('user_data'),
};