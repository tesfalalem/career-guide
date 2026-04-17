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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized - Please login again');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  
  return response.json();
};

export const adminService = {
  // ==================== ANALYTICS & OVERVIEW ====================
  async getAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getAnalytics error:', error);
      throw error;
    }
  },

  async getRecentActivity() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/activity`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getRecentActivity error:', error);
      throw error;
    }
  },

  // ==================== USER MANAGEMENT ====================
  async getAllUsers() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getAllUsers error:', error);
      throw error;
    }
  },

  async updateUserRole(userId: number, role: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role })
      });
      return handleResponse(response);
    } catch (error) {
      console.error('updateUserRole error:', error);
      throw error;
    }
  },

  // ==================== APPROVALS ====================
  async getPendingApprovals() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/approvals/pending`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getPendingApprovals error:', error);
      throw error;
    }
  },

  async approveRoleRequest(userId: number, notes?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/approvals/${userId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes: notes || '' })
      });
      return handleResponse(response);
    } catch (error) {
      console.error('approveRoleRequest error:', error);
      throw error;
    }
  },

  async rejectRoleRequest(userId: number, notes?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/approvals/${userId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ notes: notes || '' })
      });
      return handleResponse(response);
    } catch (error) {
      console.error('rejectRoleRequest error:', error);
      throw error;
    }
  },

  // ==================== CONTENT MODERATION ====================
  async getPendingResources() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/pending`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getPendingResources error:', error);
      throw error;
    }
  },

  async approveResource(resourceId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/${resourceId}/approve`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('approveResource error:', error);
      throw error;
    }
  },

  async rejectResource(resourceId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/${resourceId}/reject`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('rejectResource error:', error);
      throw error;
    }
  },

  // ==================== ROADMAP MANAGEMENT ====================
  async getRoadmaps(filters?: any) {
    try {
      const params = new URLSearchParams(filters || {});
      const response = await fetch(`${API_BASE_URL}/admin/roadmaps?${params}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getRoadmaps error:', error);
      throw error;
    }
  },

  async getRoadmap(roadmapId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roadmaps/${roadmapId}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getRoadmap error:', error);
      throw error;
    }
  },

  async createRoadmap(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roadmaps`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('createRoadmap error:', error);
      throw error;
    }
  },

  async updateRoadmap(roadmapId: number, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roadmaps/${roadmapId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('updateRoadmap error:', error);
      throw error;
    }
  },

  async deleteRoadmap(roadmapId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roadmaps/${roadmapId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('deleteRoadmap error:', error);
      throw error;
    }
  },

  async publishRoadmap(roadmapId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roadmaps/${roadmapId}/publish`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('publishRoadmap error:', error);
      throw error;
    }
  },

  async addCourseToRoadmap(roadmapId: number, courseData: {
    title: string;
    description: string;
    level: string;
    duration: string;
    modules: { title: string; lessons: { title: string; content: string; duration: string }[] }[];
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roadmaps/${roadmapId}/course`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(courseData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('addCourseToRoadmap error:', error);
      throw error;
    }
  },

  // ==================== RESOURCE MANAGEMENT ====================
  async getResources(filters?: any) {
    try {
      const params = new URLSearchParams(filters || {});
      const response = await fetch(`${API_BASE_URL}/admin/resources?${params}`, {
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('getResources error:', error);
      throw error;
    }
  },

  async createResource(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('createResource error:', error);
      throw error;
    }
  },

  async updateResource(resourceId: number, data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/${resourceId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('updateResource error:', error);
      throw error;
    }
  },

  async deleteResource(resourceId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/resources/${resourceId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      return handleResponse(response);
    } catch (error) {
      console.error('deleteResource error:', error);
      throw error;
    }
  }
};
