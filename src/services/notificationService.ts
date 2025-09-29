// API service for notification management
import { getAuthToken } from './authService';

// Base API URL
const API_BASE_URL = 'https://35.244.19.78:8042';

export interface NotificationMessage {
  _id: string;
  _created: string;
  _updated: string;
  from: {
    _id: string;
    name?: string;
    email?: string;
  };
  subject?: string;
  content?: string;
  body?: string;
  type?: string;
  read_on?: string | null;
}

export interface UserMessageReceiver {
  _id: string;
  _created: string;
  _updated: string;
  _etag: string;
  user: {
    _id: string;
    name?: string;
    email?: string;
  };
  message: NotificationMessage;
  read_on: string | null;
}

export interface NotificationResponse {
  _items: UserMessageReceiver[];
  _meta: {
    max_results: number;
    page: number;
    total: number;
  };
}

/**
 * Fetch user notifications/messages
 */
export const getUserNotifications = async (userId: string, limit: number = 20, start: number = 0): Promise<NotificationResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters - matching the provided API structure
    const queryParams = new URLSearchParams();
    queryParams.append('where', `{"user":"${userId}"}`);
    queryParams.append('embedded', '{"user":1,"message":1,"message.from":1}');
    queryParams.append('sort', '[("_created", -1),("read_on",1)]'); // Sort by creation date desc, then by read status
    queryParams.append('max_results', limit.toString());
    queryParams.append('start', start.toString());

    const response = await fetch(`${API_BASE_URL}/user_message_receivers?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NotificationResponse = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw new Error('Failed to fetch notifications. Please try again.');
  }
};

/**
 * Mark a notification as read (seen) using the etag from the notification object
 */
export const markNotificationAsRead = async (notificationId: string, etag: string): Promise<void> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Update the notification with read timestamp (format: YYYY-MM-DDTHH:mm:ss)
    const now = new Date();
    const readTimestamp = now.toISOString().slice(0, 19); // Remove milliseconds and 'Z'

    const updateData = {
      read_on: readTimestamp
    };

    const response = await fetch(`${API_BASE_URL}/user_message_receivers/${notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'If-Match': etag,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      if (response.status === 412) {
        throw new Error('Notification has been modified. Please refresh and try again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read. Please try again.');
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    // Get all unread notifications first
    const notifications = await getUserNotifications(userId, 100); // Get up to 100 notifications
    const unreadNotifications = notifications._items.filter(item => !item.read_on);

    // Mark each unread notification as read
    const markReadPromises = unreadNotifications.map(notification =>
      markNotificationAsRead(notification._id)
    );

    await Promise.all(markReadPromises);

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read. Please try again.');
  }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Query for unread notifications only
    const queryParams = new URLSearchParams();
    queryParams.append('where', `{"user":"${userId}","read_on":null}`);
    queryParams.append('max_results', '0'); // Only get count, not items

    const response = await fetch(`${API_BASE_URL}/user_message_receivers?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NotificationResponse = await response.json();
    return data._meta.total;

  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return 0; // Return 0 on error to prevent UI breaking
  }
};