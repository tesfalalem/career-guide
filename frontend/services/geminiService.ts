/**
 * Gemini AI Service - Now routes through backend API
 * This is more secure as the API key stays on the server
 */

import { CareerSuggestion, DetailedRoadmap, Course } from "../types";
import { apiClient } from "./apiClient";

// All AI calls now go through the backend
console.log("Gemini Service: Using backend API for all AI calls");

export const getCareerSuggestion = async (interests: string): Promise<CareerSuggestion> => {
  try {
    const result = await apiClient.getCareerSuggestion(interests);
    return result;
  } catch (error) {
    console.error("Career Suggestion Error:", error);
    // Return fallback
    return {
      career: "Software Engineer",
      reason: "Build amazing web applications using modern stacks.",
      topSkills: ["JavaScript", "Problem Solving", "Cloud Computing"],
      difficulty: "Intermediate"
    };
  }
};

export const generateRoadmap = async (role: string): Promise<DetailedRoadmap | null> => {
  try {
    const result = await apiClient.generateRoadmap(role);
    // Backend returns the roadmap object directly (not wrapped in { roadmap: ... })
    if (result && result.phases) return result as DetailedRoadmap;
    if (result && result.roadmap) return result.roadmap as DetailedRoadmap;
    return null;
  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    return null;
  }
};

export const evaluateCareerQuiz = async (answers: string): Promise<CareerSuggestion[]> => {
  try {
    const result = await apiClient.evaluateQuiz(answers);
    return result;
  } catch (error) {
    console.error("Quiz Evaluation Error:", error);
    return [];
  }
};

export const generateCourseDetails = async (role: string): Promise<Course | null> => {
  try {
    // This is handled by apiClient.generateCourse
    const result = await apiClient.generateCourse(role);
    return result as Course;
  } catch (error) {
    console.error("Course Generation Error:", error);
    return null;
  }
};

export const generateLessonContent = async (lessonTitle: string, moduleTitle: string, courseTitle: string): Promise<string> => {
  try {
    const content = await apiClient.generateLessonContent(lessonTitle, moduleTitle, courseTitle);
    return content;
  } catch (error) {
    console.error("Lesson generation failed", error);
    return "## Error Loading Content\nWe couldn't generate this lesson right now. Please try again later.";
  }
};
