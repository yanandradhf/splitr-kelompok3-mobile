import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  HAS_COMPLETED_ONBOARDING: 'hasCompletedOnboarding',
  HAS_TNC_ACCEPTED: 'hasTnCAccepted',
  TNC_ACCEPTED_DATE: 'tncAcceptedDate',
};

export const StorageService = {
  // Onboarding status
  async setOnboardingCompleted(completed: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, JSON.stringify(completed));
  },

  async hasCompletedOnboarding(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    return value ? JSON.parse(value) : false;
  },

  // TnC status
  async setTnCAccepted(accepted: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_TNC_ACCEPTED, JSON.stringify(accepted));
    if (accepted) {
      await AsyncStorage.setItem(STORAGE_KEYS.TNC_ACCEPTED_DATE, new Date().toISOString());
    }
  },

  async hasTnCAccepted(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_TNC_ACCEPTED);
    return value ? JSON.parse(value) : false;
  },

  async getTnCAcceptedDate(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.TNC_ACCEPTED_DATE);
  },

  // Check if user should see onboarding
  async shouldShowOnboarding(): Promise<boolean> {
    const hasCompleted = await this.hasCompletedOnboarding();
    const hasTnC = await this.hasTnCAccepted();
    
    console.log('🔍 Onboarding check:', {
      hasCompleted,
      hasTnC,
      shouldShow: !hasCompleted || !hasTnC
    });
    
    return !hasCompleted || !hasTnC;
  },

  // Complete full onboarding flow
  async completeOnboardingFlow(): Promise<void> {
    await this.setOnboardingCompleted(true);
    await this.setTnCAccepted(true);
  },

  // Reset for testing
  async resetOnboarding(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
      STORAGE_KEYS.HAS_TNC_ACCEPTED,
      STORAGE_KEYS.TNC_ACCEPTED_DATE,
    ]);
  },

  // Debug: Check all storage values
  async debugStorage(): Promise<void> {
    const hasCompleted = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    const hasTnC = await AsyncStorage.getItem(STORAGE_KEYS.HAS_TNC_ACCEPTED);
    const tncDate = await AsyncStorage.getItem(STORAGE_KEYS.TNC_ACCEPTED_DATE);
    
    console.log('🔍 Storage Debug:', {
      hasCompletedOnboarding: hasCompleted,
      hasTnCAccepted: hasTnC,
      tncAcceptedDate: tncDate,
      shouldShowOnboarding: await this.shouldShowOnboarding()
    });
  },

  // Clear all app data (for development/testing)
  async clearAllData(): Promise<void> {
    try {
      // Clear AsyncStorage
      await AsyncStorage.clear();
      console.log('🧹 AsyncStorage cleared');
      
      // Clear SecureStore (known keys)
      const { deleteItemAsync } = await import('expo-secure-store');
      const secureStoreKeys = [
        'access_token',
        'refresh_token', 
        'user_data',
        'auth_token' // legacy
      ];
      
      for (const key of secureStoreKeys) {
        try {
          await deleteItemAsync(key);
          console.log(`🔑 Cleared SecureStore key: ${key}`);
        } catch (keyError) {
          // Key might not exist, ignore
        }
      }
      
      console.log('🧹 All app data cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing app data:', error);
    }
  },
};