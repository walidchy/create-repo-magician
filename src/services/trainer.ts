import api from './api';
import { Activity, ApiResponse, User, Member } from '@/types';

// Define the function to get activities for a trainer
export const getTrainerActivities = async (): Promise<Activity[]> => {
  try {
    const response = await api.get<ApiResponse<Activity[]>>('/trainers/activities');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching trainer activities:', error);
    return [];
  }
};

export const getMembers = async (): Promise<Member[]> => {
  try {
    const response = await api.get('/members');
    
    // Handle the new API response format
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // Fallback to handle legacy format if needed
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

// Define an interface for trainer form data to fix type issues
export interface TrainerFormData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  specialization: string;
  experience_years: number;
  bio?: string;
}

// services/trainer.ts
export const createTrainer = async (trainerData: TrainerFormData): Promise<User> => {
  try {
    const formattedData = {
      name: trainerData.name,
      email: trainerData.email,
      password: trainerData.password,
      phone: trainerData.phone,
      bio: trainerData.bio,
      specialization: trainerData.specialization,
      experience_years: trainerData.experience_years,
    };
    
    const response = await api.post<ApiResponse<User>>('/trainers', formattedData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating trainer:', error);
    throw error;
  }
};

export const createActivity = async (activityData: Partial<Activity>): Promise<Activity> => {
  try {
    const response = await api.post<{ data: Activity }>('/activities', activityData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

export const updateActivity = async (activityId: number, activityData: Partial<Activity>): Promise<Activity> => {
  try {
    const response = await api.put<{ data: Activity }>(`/trainer/activities/${activityId}`, activityData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

export const deleteActivity = async (activityId: number): Promise<void> => {
  try {
    await api.delete(`/activities/${activityId}`);
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};

export const getTrainers = async (queryParams?: string): Promise<User[]> => {
  try {
    const url = `/trainers`;
    const response = await api.get(url);
    
    // Handle the new API response format
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // Fallback to handle legacy format if needed
    if (response.data.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return [];
  }
};

export const deleteTrainer = async (userId: number): Promise<void> => {
  try {
    await api.delete(`/trainers/${userId}`);
  } catch (error) {
    console.error('Error deleting trainer:', error);
    throw error;
  }
};

export const updateTrainer = async (userId: number, trainerData: Partial<User>): Promise<User> => {
  try {
    const response = await api.put<ApiResponse<User>>(`/trainers/${userId}`, trainerData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating trainer:', error);
    throw error;
  }
};

export const getTrainerSchedule = async (weekStart: string) => {
  try {
    // Use the api service with correct authentication
    const response = await api.get('/schedule', {
      params: { week_start: weekStart }
    });

    // Log response to help debug
    console.log('Schedule API response:', response.data);
    
    // Handle different response formats
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching trainer schedule:', error);
    throw error;
  }
};

export const updateTrainerAvailability = async (availability: {
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}) => {
  try {
    const response = await api.post('/schedule/availability', availability);
    return response.data.data;
  } catch (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
};
