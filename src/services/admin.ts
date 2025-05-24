
import api from './api';
import { ApiResponse, User } from '@/types';

export const getPendingVerifications = async (): Promise<ApiResponse<User[]>> => {
  try {
    const response = await api.get<ApiResponse<User[]>>('/admin/verifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching pending verifications:', error);
    return { data: [], status: 'error' };
  }
};

export const verifyUser = async (userId: number, verified: boolean): Promise<ApiResponse<User>> => {
  try {
    const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}/verify`, { 
      is_verified: verified 
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
};
