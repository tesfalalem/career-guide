/**
 * API Client for PHP Backend
 * Replaces Supabase client for backend communication
 */

import { API_BASE_URL } from '../utils/apiConfig';

// Normalize raw DB user object to match the frontend User interface
const normalizeUser = (raw: any) => {
  if (!raw) return raw;
  return {
    id: String(raw.id ?? ''),
    name: raw.name ?? '',
    email: raw.email ?? '',
    role: raw.role ?? 'student',
    academicYear: raw.academic_year ?? raw.academicYear ?? undefined,
    academic_year: raw.academic_year ?? raw.academicYear ?? undefined,
    enrolledPaths: raw.enrolledPaths ?? [],
    xp: Number(raw.xp ?? 0),
    streak: Number(raw.streak ?? 0),
    // Keep as null (not undefined) so components can distinguish "no photo" from "not loaded"
    profile_image: raw.profile_image || null,
    account_status: raw.account_status ?? 'active',
    created_at: raw.created_at ?? undefined,
  };
};

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Save token to localStorage
const saveToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove token from localStorage
const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API Client
export const apiClient = {
  // Authentication
  async register(name: string, email: string, password: string, additionalData?: any) {
    const registrationData: any = { 
      name, 
      email, 
      password 
    };

    // Merge additional data if provided
    if (additionalData) {
      Object.assign(registrationData, additionalData);
    }

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    if (data.token) {
      saveToken(data.token);
    }

    return { ...data, user: normalizeUser(data.user) };
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.token) {
      saveToken(data.token);
    }

    return { ...data, user: normalizeUser(data.user) };
  },

  async logout() {
    const token = getToken();
    
    if (token) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }

    removeToken();
  },

  // User
  async getProfile() {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to get profile');
    }

    return normalizeUser(data);
  },

  async getStats() {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async getActivity() {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/activity`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async updateProfile(data: { name?: string; academic_year?: string }) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update profile');
    }

    return result;
  },

  async updateProfileImage(file: File) {
    const token = getToken();
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/users/profile/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update image');
    }
    return result;
  },

  async deleteProfileImage() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/users/profile/image`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to delete image');
    }
    return result;
  },

  // Courses
  async getCourses() {
    const response = await fetch(`${API_BASE_URL}/courses`);
    return response.json();
  },

  async getCourse(id: string) {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`);
    return response.json();
  },

  async generateCourse(role: string) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/courses/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    return response.json();
  },

  async enrollCourse(courseId: string) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async getUserCourses() {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/courses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async updateProgress(courseId: string, progress: number, completedLessons: string[]) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ progress, completed_lessons: completedLessons }),
    });

    return response.json();
  },

  async getCuratedRoadmaps(filters: { category?: string; difficulty_level?: string } = {}) {
    let url = `${API_BASE_URL}/curated-roadmaps?`;
    if (filters.category && filters.category !== 'all') {
      url += `category=${encodeURIComponent(filters.category)}&`;
    }
    if (filters.difficulty_level && filters.difficulty_level !== 'all') {
      url += `difficulty_level=${filters.difficulty_level}&`;
    }
    const response = await fetch(url);
    return response.json();
  },

  async getCuratedRoadmap(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/curated-roadmaps/${id}`);
    return response.json();
  },

  async getCuratedRoadmapCourses(id: number | string) {
    const response = await fetch(`${API_BASE_URL}/curated-roadmaps/${id}/courses`);
    return response.json();
  },

  async enrollInCuratedRoadmap(id: number | string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/curated-roadmaps/${id}/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    if (!response.ok && response.status !== 409) {
      throw new Error(data.error || 'Enrollment failed');
    }
    return { data, status: response.status, ok: response.ok };
  },

  async generateRoadmap(role: string) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/roadmaps/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    return response.json();
  },

  async saveRoadmap(roadmapData: any) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/roadmaps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(roadmapData),
    });

    return response.json();
  },

  async getUserRoadmaps() {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/users/roadmaps`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  },

  async deleteRoadmap(roadmapId: string) {
    const token = getToken();
    
    const response = await fetch(`${API_BASE_URL}/roadmaps/${roadmapId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response.json();
  },

  // AI Services
  async getCareerSuggestion(interests: string) {
    const response = await fetch(`${API_BASE_URL}/ai/career-suggestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interests }),
    });

    return response.json();
  },

  async evaluateQuiz(answers: string) {
    const response = await fetch(`${API_BASE_URL}/ai/quiz-evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answers }),
    });

    return response.json();
  },

  async generateLessonContent(lessonTitle: string, moduleTitle: string, courseTitle: string) {
    const response = await fetch(`${API_BASE_URL}/ai/lesson-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lesson_title: lessonTitle,
        module_title: moduleTitle,
        course_title: courseTitle,
      }),
    });

    const data = await response.json();
    return data.content;
  },

  async getPublicStats() {
    const response = await fetch(`${API_BASE_URL}/stats`);
    return response.json();
  },

  // Support Chat
  async getSupportMessages() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/support/messages`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  async sendSupportMessage(message: string, receiverId: string = '1') {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/support/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, receiver_id: receiverId }),
    });
    return response.json();
  },

  async getAdminConversations() {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/support/conversations`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  async getAdminMessages(userId: string) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/support/messages/${userId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  async getGuestMessages(guestId: string) {
    const response = await fetch(`${API_BASE_URL}/public/support/messages/${guestId}`);
    return response.json();
  },

  async sendGuestMessage(message: string, guestId: string) {
    const response = await fetch(`${API_BASE_URL}/public/support/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, guest_id: guestId }),
    });
    return response.json();
  },

  async deleteSupportMessage(messageId: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/admin/support/messages/${messageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.json();
  },

  // ── Careers (BiT Admin) ───────────────────────────────────────────────────

  async getBitCareers(params: { search?: string; category?: string; status?: string } = {}) {
    const token = getToken();
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    const response = await fetch(`${API_BASE_URL}/bit/careers${qs ? '?' + qs : ''}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch careers');
    return data;
  },

  async createCareer(payload: {
    title: string; description: string; category: string;
    thumbnail_url?: string; required_skills?: string[]; status?: string;
  }) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/bit/careers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create career');
    return data;
  },

  async updateCareer(id: number, payload: Partial<{
    title: string; description: string; category: string;
    thumbnail_url: string | null; required_skills: string[]; status: string;
  }>) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/bit/careers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update career');
    return data;
  },

  async deleteCareer(id: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/bit/careers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete career');
    return data;
  },

  async publishCareer(id: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/bit/careers/${id}/publish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to publish career');
    return data;
  },

  async unpublishCareer(id: number) {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/bit/careers/${id}/unpublish`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to unpublish career');
    return data;
  },

  // ── Careers (Public / Students) ───────────────────────────────────────────

  async getPublishedCareers(params: { search?: string; category?: string } = {}) {
    // Filter out empty string values so they don't appear as ?search=&category=
    const filtered: Record<string, string> = {};
    if (params.search) filtered.search = params.search;
    if (params.category) filtered.category = params.category;
    const qs = new URLSearchParams(filtered).toString();
    const response = await fetch(`${API_BASE_URL}/careers${qs ? '?' + qs : ''}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch careers');
    // Always return an array
    return Array.isArray(data) ? data : [];
  },

  async getCareerCategories() {
    const response = await fetch(`${API_BASE_URL}/careers/categories`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  },

  async getCareer(id: number) {
    const response = await fetch(`${API_BASE_URL}/careers/${id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Career not found');
    return data;
  },
};

export { getToken, saveToken, removeToken };
