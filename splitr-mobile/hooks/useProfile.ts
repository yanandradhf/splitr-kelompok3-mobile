import { useEffect } from 'react';
import { useProfileStore } from '../store/profile.store';

export const useProfile = () => {
  const { profile, isLoading, isUpdating, error, fetchProfile, updateProfile } = useProfileStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    isUpdating,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
};