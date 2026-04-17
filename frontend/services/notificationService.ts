const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  resource_updates: boolean;
  feedback_notifications: boolean;
  system_notifications: boolean;
  student_activity: boolean;
  admin_announcements: boolean;
}

export const notificationService = {
  // Get all notifications
  async getNotifications(unreadOnly = false): Promise<{ success: boolean; notifications: Notification[] }> {
    try {
      const url = unreadOnly 
        ? `${API_BASE_URL}/notifications?unread_only=true`
        : `${API_BASE_URL}/notifications`;
        
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      return response.json();
    } catch (error) {
      console.error('getNotifications error:', error);
      throw error;
    }
  },

  // Get unread count
  async getUnreadCount(): Promise<{ success: boolean; count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        headers: getAuthHeaders()
      });
      return response.json();
    } catch (error) {
      console.error('getUnreadCount error:', error);
      throw error;
    }
  },

  // Mark as read
  async markAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return response.json();
    } catch (error) {
      console.error('markAsRead error:', error);
      throw error;
    }
  },

  // Mark all as read
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      return response.json();
    } catch (error) {
      console.error('markAllAsRead error:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return response.json();
    } catch (error) {
      console.error('deleteNotification error:', error);
      throw error;
    }
  },

  // Get preferences
  async getPreferences(): Promise<{ success: boolean; preferences: NotificationPreferences }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        headers: getAuthHeaders()
      });
      return response.json();
    } catch (error) {
      console.error('getPreferences error:', error);
      throw error;
    }
  },

  // Update preferences
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(preferences)
      });
      return response.json();
    } catch (error) {
      console.error('updatePreferences error:', error);
      throw error;
    }
  }
};
