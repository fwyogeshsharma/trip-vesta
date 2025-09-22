// API service for authentication with phone number and OTP

export interface SendOtpRequest {
  pc: string; // Phone country code
  pn: number; // Phone number
  otp_type: string; // Type of OTP (login)
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  sessionId?: string;
}

export interface VerifyOtpRequest {
  pc: string; // Phone country code
  pn: number; // Phone number
  otp: number; // OTP code
  source: string; // Source of the request
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    phoneNumber: string;
    name?: string;
    roles?: string[];
    email?: string;
    [key: string]: any; // For any additional user data from API
  };
}

// Base API URL - your provided endpoint
const API_BASE_URL = 'https://35.244.19.78:8042';

/**
 * Send OTP to the provided phone number
 */
export const sendOtp = async (phoneNumber: string): Promise<SendOtpResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/persons/send_otp_while_joining?csr_login=False`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pc: "91",
        pn: parseInt(phoneNumber),
        otp_type: "login"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Transform the response to match our interface
    return {
      success: response.ok,
      message: data.message || "OTP sent successfully",
      sessionId: data.sessionId
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP. Please try again.');
  }
};

/**
 * Verify the OTP for the provided phone number
 */
export const verifyOtp = async (
  phoneNumber: string,
  otp: string,
  sessionId?: string
): Promise<VerifyOtpResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/persons/login_with_otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pc: "91",
        pn: parseInt(phoneNumber),
        otp: parseInt(otp),
        source: "Website"
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Extract roles from API response - check both top level and user_record level
    const extractedRoles = data.role_names || data.user_record?.role_names || [];

    // Debug logging
    console.log('Full API Response:', data);
    console.log('API Response role_names (top level):', data.role_names);
    console.log('API Response role_names (user_record):', data.user_record?.role_names);
    console.log('API Response roles:', data.roles);
    console.log('Extracted roles for user:', extractedRoles);

    // Transform the response to match our interface
    const userRecord = data.user_record || data;
    return {
      success: response.ok,
      message: data.statusText || data.message || "OTP verified successfully",
      token: data.token || userRecord.token || data.access_token || data.jwt || "authenticated",
      user: {
        id: userRecord._id || userRecord.id || userRecord.user_id || userRecord.userId || phoneNumber,
        phoneNumber: phoneNumber,
        name: userRecord.name || userRecord.full_name || userRecord.firstName || userRecord.username || `User ${phoneNumber}`,
        email: userRecord.email || userRecord.emailAddress,
        roles: extractedRoles,
        // Include all other user data from API response
        ...userRecord
      }
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP. Please try again.');
  }
};

/**
 * Store authentication token in localStorage
 */
export const storeAuthToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('data');
};

/**
 * Store user data in localStorage
 */
export const storeUserData = (userData: any): void => {
  localStorage.setItem('data', JSON.stringify(userData));
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): any | null => {
  const data = localStorage.getItem('data');
  return data ? JSON.parse(data) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Logout user by removing token and redirecting to login
 */
export const logout = (): void => {
  removeAuthToken();
  window.location.href = '/login';
};