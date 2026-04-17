import { apiClient } from './apiClient';
import { DetailedRoadmap } from '../types';

export interface SavedRoadmap {
  id: string;
  title: string;
  role: string;
  road_data: DetailedRoadmap;
  created_at: string;
}

export const saveRoadmap = async (roadmap: DetailedRoadmap, userId: string): Promise<SavedRoadmap | null> => {
  try {
    const data = await apiClient.saveRoadmap(roadmap);
    return data as SavedRoadmap;
  } catch (err) {
    console.error('Unexpected error saving roadmap:', err);
    return null;
  }
};

export const getUserRoadmaps = async (userId: string): Promise<SavedRoadmap[]> => {
  try {
    const data = await apiClient.getUserRoadmaps();
    return data as SavedRoadmap[];
  } catch (err) {
    console.error('Unexpected error fetching roadmaps:', err);
    return [];
  }
};

export const deleteRoadmap = async (roadmapId: string) => {
  try {
    await apiClient.deleteRoadmap(roadmapId);
  } catch (error) {
    throw error;
  }
};
