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
};