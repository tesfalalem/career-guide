const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) throw new Error('Not authenticated');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  return response.json();
};

export const bitService = {
  // Analytics
  async getAnalytics() {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/analytics`, { headers: getAuthHeaders() }));
  },

  // Roadmaps
  async getRoadmaps(filters?: any) {
    const params = new URLSearchParams(filters || {});
    return handleResponse(await fetch(`${API_BASE_URL}/bit/roadmaps?${params}`, { headers: getAuthHeaders() }));
  },

  async getRoadmap(id: number) {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/roadmaps/${id}`, { headers: getAuthHeaders() }));
  },

  async createRoadmap(data: any) {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/roadmaps`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(data)
    }));
  },

  async updateRoadmap(id: number, data: any) {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/roadmaps/${id}`, {
      method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(data)
    }));
  },

  async deleteRoadmap(id: number) {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/roadmaps/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    }));
  },

  async publishRoadmap(id: number) {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/roadmaps/${id}/publish`, {
      method: 'POST', headers: getAuthHeaders()
    }));
  },

  async addCourseToRoadmap(roadmapId: number, courseData: any) {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/roadmaps/${roadmapId}/course`, {
      method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(courseData)
    }));
  },

  // Courses
  async getCourses() {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/courses`, { headers: getAuthHeaders() }));
  },

  async deleteCourse(id: number) {
    return handleResponse(await fetch(`${API_BASE_URL}/bit/courses/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    }));
  },
};
