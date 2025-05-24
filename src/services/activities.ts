
import api from './api';
import { Activity, ApiResponse } from '@/types';

export const getActivities = async (queryParams?: string): Promise<Activity[]> => {
  try {
    const url = `/activities${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get<ApiResponse<Activity[]>>(url);
    
    // Handle both response formats - direct data array or nested in data property
    if (response.data && response.data.data) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

export const getActivityById = async (activityId: number): Promise<Activity> => {
  try {
    const response = await api.get<ApiResponse<Activity>>(`/activities/${activityId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching activity details:', error);
    throw error;
  }
};

export const createActivity = async (activityData: Partial<Activity>): Promise<Activity> => {
  try {
    const response = await api.post<ApiResponse<Activity>>('/activities', activityData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

export const updateActivity = async (activityId: number, activityData: Partial<Activity>): Promise<Activity> => {
  try {
    const response = await api.put<ApiResponse<Activity>>(`/activities/${activityId}`, activityData);
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

export const joinActivity = async (activityId: number): Promise<Activity> => {
  try {
    const response = await api.post<ApiResponse<Activity>>(`/activities/${activityId}/join`);
    return response.data.data;
  } catch (error) {
    console.error('Error joining activity:', error);
    throw error;
  }
};
