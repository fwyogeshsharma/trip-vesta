import { useState, useEffect } from 'react';
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  formatUserProfile,
  clearUserProfileCache,
  UserProfile,
  UserPatchResponse
} from '@/services/userService';
import { getCurrentUserId } from '@/services/authService';

export const useUserProfile = (userId?: string) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Get user ID from context/storage if not provided - NO hardcoded fallback
  const effectiveUserId = userId || getCurrentUserId();

  const fetchProfile = async () => {
    if (!effectiveUserId) {
      setError('No user ID provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userProfile = await getUserProfile(effectiveUserId);
      if (userProfile) {
        const formattedProfile = formatUserProfile(userProfile);
        setProfile(formattedProfile);
      } else {
        setError('User profile not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!effectiveUserId || !profile) {
      throw new Error('No user profile loaded');
    }

    setUpdating(true);
    setError(null);

    try {
      // Call the updated PATCH API
      const patchResponse: UserPatchResponse = await updateUserProfile(effectiveUserId, {
        ...updates,
        _etag: profile.etag, // For optimistic locking
      });

      // Fetch the updated profile to get the complete data
      const updatedProfile = await getUserProfile(effectiveUserId, true);
      if (updatedProfile) {
        const formattedProfile = formatUserProfile(updatedProfile);
        setProfile(formattedProfile);
        return { formattedProfile, patchResponse };
      }

      throw new Error('Failed to fetch updated profile');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const updateProfilePicture = async (file: File) => {
    if (!effectiveUserId) {
      throw new Error('No user ID provided');
    }

    setUpdating(true);
    setError(null);

    try {
      // uploadProfilePicture already handles the PATCH API call internally
      // It uploads the file and updates the profile with the new file ID
      const fileId = await uploadProfilePicture(effectiveUserId, file);

      // Clear the cache to force a fresh fetch and get updated profile data
      clearUserProfileCache(effectiveUserId);

      // Refresh the profile to get the latest data with the new profile picture
      await fetchProfile();

      return fileId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile picture';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const updateSettings = async (settings: any) => {
    if (!profile) {
      throw new Error('No profile loaded');
    }

    const updates = {
      settings: {
        ...profile.settings,
        ...settings
      }
    };

    return updateProfile(updates);
  };

  const updateNotificationPreferences = async (notifications: any) => {
    return updateSettings({
      notifications
    });
  };

  const updatePrivacySettings = async (privacy: any) => {
    return updateSettings({
      privacy
    });
  };

  const updatePersonalInfo = async (personalInfo: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    designation?: string;
    address?: any;
  }) => {
    // Transform the data to match API format
    const apiUpdate: any = {};

    // Combine first and last name into 'name' field for API
    if (personalInfo.firstName || personalInfo.lastName) {
      apiUpdate.name = `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
    }

    // Handle phone number - for now just store as string, could be enhanced to parse country code
    if (personalInfo.phone) {
      // Simple phone handling - could be enhanced to parse country code and number
      apiUpdate.phone = {
        country_phone_code: "91", // Default to India
        number: personalInfo.phone.replace(/\D/g, '') // Remove non-digits
      };
    }

    if (personalInfo.designation) {
      apiUpdate.individual_user_type = personalInfo.designation;
    }

    if (personalInfo.address) {
      apiUpdate.postal_addresses = [personalInfo.address];
    }

    return updateProfile(apiUpdate);
  };

  // Force refresh profile (clears cache and fetches fresh)
  const refreshProfile = async () => {
    if (effectiveUserId) {
      clearUserProfileCache(effectiveUserId);
      await fetchProfile();
    }
  };

  // Load profile on mount or when userId changes
  useEffect(() => {
    fetchProfile();
  }, [effectiveUserId]);

  return {
    profile,
    loading,
    error,
    updating,
    fetchProfile,
    updateProfile,
    updateProfilePicture,
    updateSettings,
    updateNotificationPreferences,
    updatePrivacySettings,
    updatePersonalInfo,
    refreshProfile,
    clearCache: () => effectiveUserId && clearUserProfileCache(effectiveUserId),
  };
};