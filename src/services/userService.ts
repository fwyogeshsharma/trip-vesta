// API service for user management
import { getAuthToken } from './authService';

// Base API URL
const API_BASE_URL = 'https://35.244.19.78:8042';

// Cache for storing user profile data to avoid frequent GET requests
const userProfileCache: { [userId: string]: { profile: UserProfile; timestamp: number } } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export interface UserProfile {
  _id: string;
  _created: string;
  _updated: string;
  _etag: string;
  email: string;
  name?: string;
  phone?: {
    country_phone_code: string;
    number: string;
  };
  current_company?: string;
  individual_user_type?: string;
  user_type?: string;
  preferred_language?: string;
  postal_addresses?: any[];
  roles?: {
    role: {
      _id: string;
      name: string;
      description?: string;
    };
  }[];
  profile_pic?: {
    _id: string;
    file?: {
      file?: string;
    };
  } | string; // Can be either new object format or old string format for backward compatibility
  profile_page_settings?: {
    show_profile_page: boolean;
    documents_to_show: any[];
    show_trucks: boolean;
    show_loads: boolean;
    general_info: {
      show_emails: boolean;
      show_phone_numbers: boolean;
      show_logo: boolean;
      show_banner: boolean;
      show_website: boolean;
      show_addresses: boolean;
    };
    show_rating: boolean;
    show_reviews: boolean;
    show_operating_routes: boolean;
  };
  public_profile_url?: string;
  photos?: any[];
  settings?: {
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy?: {
      profile_visibility: 'public' | 'private';
      data_sharing: boolean;
    };
    preferences?: {
      language: string;
      currency: string;
      timezone: string;
      theme: 'light' | 'dark' | 'auto';
    };
  };
}

export interface UserProfileResponse {
  _items: UserProfile[];
  _meta: {
    max_results: number;
    page: number;
    total: number;
  };
}

export interface UserPatchResponse {
  _id: string;
  _updated: string;
  _created: string;
  _deleted: boolean;
  _etag: string;
  num_id: number;
  _version: number;
  _latest_version: number;
  _status: string;
}

/**
 * Get user profile by user ID with caching
 */
export const getUserProfile = async (userId: string, forceRefresh: boolean = false): Promise<UserProfile | null> => {
  try {
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh && userProfileCache[userId]) {
      const cached = userProfileCache[userId];
      const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
      if (!isExpired) {
        console.log('Returning cached user profile');
        return cached.profile;
      }
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.append('where', `{"_id":"${userId}"}`);
    queryParams.append('embedded', `{"roles.role":1,"profile_pic":1}`);

    const response = await fetch(`${API_BASE_URL}/users?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: UserProfileResponse = await response.json();

    // Get the first user if found
    const userProfile = data._items.length > 0 ? data._items[0] : null;

    // Cache the result
    if (userProfile) {
      userProfileCache[userId] = {
        profile: userProfile,
        timestamp: Date.now()
      };
    }

    return userProfile;

  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile. Please try again.');
  }
};

/**
 * Update user profile with proper _etag handling and cache management
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile & { _etag?: string }>
): Promise<UserPatchResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get current profile to ensure we have the latest _etag if not provided
    let etag = updates._etag;

    if (!etag && userProfileCache[userId]) {
      etag = userProfileCache[userId].profile._etag;
    }

    if (!etag) {
      // Fetch fresh profile to get current _etag
      const currentProfile = await getUserProfile(userId, true);
      if (!currentProfile) {
        throw new Error('Unable to get current profile for update');
      }
      etag = currentProfile._etag;
    }

    // Remove _etag from updates as it should not be in the body
    const { _etag, ...updateData } = updates;

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'If-Match': etag, // For optimistic locking
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 412) {
        throw new Error('Profile has been modified by another user. Please refresh and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const patchResponse: UserPatchResponse = await response.json();

    // Update cache with new _etag and merged data
    if (userProfileCache[userId]) {
      userProfileCache[userId] = {
        profile: {
          ...userProfileCache[userId].profile,
          ...updateData,
          _etag: patchResponse._etag,
          _updated: patchResponse._updated
        } as UserProfile,
        timestamp: Date.now()
      };
    }

    return patchResponse;

  } catch (error) {
    console.error('Error updating user profile:', error);

    // Clear cache on error to force fresh fetch next time
    if (userProfileCache[userId]) {
      delete userProfileCache[userId];
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update user profile. Please try again.');
  }
};

/**
 * Clear user profile cache
 */
export const clearUserProfileCache = (userId?: string) => {
  if (userId) {
    delete userProfileCache[userId];
  } else {
    // Clear all cache
    Object.keys(userProfileCache).forEach(key => delete userProfileCache[key]);
  }
};

/**
 * Get cached user profile _etag
 */
export const getCachedUserEtag = (userId: string): string | null => {
  const cached = userProfileCache[userId];
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.profile._etag;
  }
  return null;
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const fileId = data._id;

    // Get current profile to get the etag
    const currentProfile = await getUserProfile(userId);
    if (!currentProfile) {
      throw new Error('Unable to get current profile for update');
    }

    // Update user profile with new profile picture
    await updateUserProfile(userId, {
      profile_pic: fileId,
      _etag: currentProfile._etag,
    } as any);

    return fileId;

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new Error('Failed to upload profile picture. Please try again.');
  }
};

/**
 * Get profile picture URL from file ID or profile_pic object
 * @deprecated Use ProfilePicture component instead for better handling
 */
export const getProfilePictureUrl = async (
  profilePic: string | { _id: string; file?: { file?: string } } | null
): Promise<string | null> => {
  if (!profilePic) return null;

  let fileId: string;

  // Handle both old string format and new object format
  if (typeof profilePic === 'string') {
    fileId = profilePic;
  } else if (typeof profilePic === 'object' && profilePic._id) {
    fileId = profilePic._id;
  } else {
    return null;
  }

  try {
    const token = getAuthToken();
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/files/${fileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (data.file && data.content_type?.startsWith('image/')) {
      return `data:${data.content_type};base64,${data.file}`;
    }

    return null;
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return null;
  }
};

/**
 * Format user profile for display
 */
export const formatUserProfile = (user: UserProfile) => {
  // Extract first and last name from the 'name' field
  const nameParts = (user.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Format phone number
  const phoneNumber = user.phone ? `+${user.phone.country_phone_code} ${user.phone.number}` : '';

  // Get primary address from postal_addresses array
  const primaryAddress = user.postal_addresses?.[0] || {};

  return {
    id: user._id,
    email: user.email,
    firstName: firstName,
    lastName: lastName,
    fullName: user.name || user.email.split('@')[0],
    phone: phoneNumber,
    company: user.current_company || '',
    designation: user.individual_user_type || '',
    userType: user.user_type || '',
    address: {
      street: primaryAddress.street || '',
      city: primaryAddress.city || '',
      state: primaryAddress.state || '',
      country: primaryAddress.country || 'India',
      pincode: primaryAddress.pincode || '',
      fullAddress: [
        primaryAddress.street,
        primaryAddress.city,
        primaryAddress.state,
        primaryAddress.pincode
      ].filter(Boolean).join(', ')
    },
    roles: user.roles?.map(r => ({
      id: r.role._id,
      name: r.role.name,
      description: r.role.description || ''
    })) || [],
    primaryRole: user.roles?.[0]?.role?.name || 'User',
    profilePicture: user.profile_pic || null, // Keep the raw structure for the component to handle
    publicProfileUrl: user.public_profile_url || '',
    preferredLanguage: user.preferred_language || 'en',
    profilePageSettings: user.profile_page_settings || {},
    settings: {
      notifications: {
        email: user.settings?.notifications?.email ?? true,
        sms: user.settings?.notifications?.sms ?? true,
        push: user.settings?.notifications?.push ?? true,
      },
      privacy: {
        profileVisibility: user.settings?.privacy?.profile_visibility || 'private',
        dataSharing: user.settings?.privacy?.data_sharing ?? false,
      },
      preferences: {
        language: user.preferred_language || 'en',
        currency: user.settings?.preferences?.currency || 'INR',
        timezone: user.settings?.preferences?.timezone || 'Asia/Kolkata',
        theme: user.settings?.preferences?.theme || 'light',
      }
    },
    verification: {
      emailVerified: false, // Not provided in current API
      phoneVerified: false, // Not provided in current API
      kycStatus: 'pending', // Not provided in current API
      kycDocuments: [],
    },
    wallet: {
      balance: 0, // Not provided in current API
      currency: 'INR',
    },
    investmentPreferences: {
      riskTolerance: 'medium',
      preferredSectors: [],
      minInvestment: 10000,
      maxInvestment: 100000,
    },
    created: new Date(user._created).toLocaleDateString(),
    updated: new Date(user._updated).toLocaleDateString(),
    etag: user._etag, // Use the actual etag for optimistic locking
  };
};