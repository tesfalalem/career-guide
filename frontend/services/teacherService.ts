const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('No token found in localStorage');
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    console.error('Unauthorized - Token may be invalid or expired');
    // Clear invalid token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Redirect to login
    window.location.href = '/login';
    throw new Error('Unauthorized - Please login again');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  
  return response.json();
};

export const teacherService = {
  // Dashboard & Stats
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/stats`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getStats error:', error);
      throw error;
    }
  },

  async getActivity() {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/activity`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getActivity error:', error);
      throw error;
    }
  },

  async getAtRiskStudents() {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/at-risk-students`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getAtRiskStudents error:', error);
      throw error;
    }
  },

  // Profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/profile`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getProfile error:', error);
      throw error;
    }
  },

  async updateProfile(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('updateProfile error:', error);
      throw error;
    }
  },

  // Settings
  async getSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/settings`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getSettings error:', error);
      throw error;
    }
  },

  async updateSettings(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('updateSettings error:', error);
      throw error;
    }
  },

  // Analytics
  async getAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/analytics`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getAnalytics error:', error);
      throw error;
    }
  },

  async getResourceAnalytics(resourceId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/teacher/analytics/resource/${resourceId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getResourceAnalytics error:', error);
      throw error;
    }
  }
};
