
export interface RoadmapResource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'documentation';
}

export interface RoadmapTopic {
  title: string;
  concepts: string[]; // Specific concepts to learn (e.g., "Event Loop", "Closures")
  resources: RoadmapResource[];
}

export interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: RoadmapTopic[];
}

export interface DetailedRoadmap {
  title: string;
  description: string;
  role: string;
  phases: RoadmapPhase[];
}

export interface Lesson {
  title: string;
  content: string; // Markdown content for the lesson
  duration: string;
  isCompleted?: boolean;
}

export interface CourseModule {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modules: CourseModule[];
  author: 'AI Architect' | string;
  duration: string;
  enrolled: number;
  rating: number;
  progress?: number;
  completed_lessons?: string[];
}

export interface CareerSuggestion {
  career: string;
  reason: string;
  topSkills: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'bit';
  academicYear?: string;
  enrolledPaths: string[];
  xp: number;
  streak: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
}

// Dashboard Router Props
export interface DashboardRouterProps {
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

// Student Dashboard Props
export interface StudentDashboardLayoutProps {
  user: User & { role: 'student' };
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

// Teacher Dashboard Props
export interface TeacherDashboardLayoutProps {
  user: User & { role: 'teacher' };
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

// Admin Dashboard Props
export interface AdminDashboardLayoutProps {
  user: User & { role: 'admin' };
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

// Teacher Statistics
export interface TeacherStats {
  totalResources: number;
  approvedResources: number;
  pendingResources: number;
  rejectedResources: number;
  totalRoadmaps: number;
  totalStudents: number;
}

// Platform Analytics
export interface PlatformAnalytics {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_admins: number;
  total_roadmaps: number;
  total_resources: number;
  pending_resources: number;
  approved_resources: number;
  rejected_resources: number;
}

// Resource Model
export interface Resource {
  id: number;
  title: string;
  description: string;
  resource_type: 'article' | 'video' | 'course' | 'documentation' | 'tutorial';
  external_url?: string;
  category: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  uploaded_by: number;
  uploader_name?: string;
  created_at: string;
  updated_at?: string;
}

// Type Guards
export function isStudent(user: User): user is User & { role: 'student' } {
  return user.role === 'student';
}

export function isTeacher(user: User): user is User & { role: 'teacher' } {
  return user.role === 'teacher';
}

// BiT Dashboard Props
export interface BiTDashboardLayoutProps {
  user: User & { role: 'bit' };
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

export function isBiT(user: User): user is User & { role: 'bit' } {
  return user.role === 'bit';
}

export function isAdmin(user: User): user is User & { role: 'admin' } {
  return user.role === 'admin';
}
