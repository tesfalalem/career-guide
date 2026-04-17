import { apiClient } from './apiClient';
import { Course } from '../types';

export const createCourseFromRoadmap = async (role: string, userId: string): Promise<Course | null> => {
  const data = await apiClient.generateCourse(role);

  // Backend returns the saved course object directly
  if (!data || data.error) {
    throw new Error(data?.error || 'Failed to generate course');
  }

  // Ensure modules is an array (backend may return it already parsed)
  if (data.modules && typeof data.modules === 'string') {
    data.modules = JSON.parse(data.modules);
  }

  return data as Course;
};

export const enrollInCourse = async (courseId: string, userId: string) => {
  try {
    await apiClient.enrollCourse(courseId);
  } catch (error) {
    throw error;
  }
};

export const getUserCourses = async (userId: string) => {
  try {
    const courses = await apiClient.getUserCourses();
    return courses;
  } catch (error) {
    throw error;
  }
};

export const getStudentStats = async (userId: string) => {
  try {
    const stats = await apiClient.getStats();
    return stats;
  } catch (err) {
    console.error("Error fetching stats:", err);
    return { coursesEnrolled: 0, completedLessons: 0, totalXP: 0 };
  }
};

export const getRecentActivity = async (userId: string) => {
  try {
    const activity = await apiClient.getActivity();
    return activity;
  } catch (err) {
    console.error("Error fetching activity:", err);
    return [];
  }
};