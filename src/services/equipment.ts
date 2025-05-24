
import api from './api';
import { Equipment, ApiResponse } from '@/types';

export const getEquipment = async (queryParams?: string): Promise<Equipment[]> => {
  try {
    const url = `/equipment${queryParams ? `?${queryParams}` : ''}`;
    const response = await api.get<ApiResponse<Equipment[]>>(url);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching equipment:', error);
    throw error;
  }
};

export const createEquipment = async (equipmentData: Partial<Equipment>): Promise<Equipment> => {
  try {
    const response = await api.post<ApiResponse<Equipment>>('/equipment', equipmentData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating equipment:', error);
    throw error;
  }
};

export const updateEquipment = async (equipmentId: number, equipmentData: Partial<Equipment>): Promise<Equipment> => {
  try {
    const response = await api.put<ApiResponse<Equipment>>(`/equipment/${equipmentId}`, equipmentData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating equipment:', error);
    throw error;
  }
};

export const deleteEquipment = async (equipmentId: number): Promise<void> => {
  try {
    await api.delete(`/equipment/${equipmentId}`);
  } catch (error) {
    console.error('Error deleting equipment:', error);
    throw error;
  }
};

export const getEquipmentById = async (equipmentId: number): Promise<Equipment> => {
  try {
    const response = await api.get<ApiResponse<Equipment>>(`/equipment/${equipmentId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching equipment details:', error);
    throw error;
  }
};
