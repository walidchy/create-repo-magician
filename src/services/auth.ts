import api from './api';
import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';

export const login = async (credentials: LoginCredentials): Promise<{ user: User; token: string; message: string }> => {
  const response = await api.post<{ user: User; token: string; message: string }>('/login', credentials);
  return response.data;
};

export const handleGoogleCallback = async (token: string): Promise<User> => {
  // Set the token in the headers
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  
  // Get the user data
  const response = await api.get<User>('/user');
  return response.data;
};

export const register = async (userData: RegisterData): Promise<{ user: User; message: string }> => {
  const response = await api.post<{ user: User; message: string }>('/register', userData);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post('/logout');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/user');
  return response.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await api.post('/forgot-password', { email });
};

export const resetPassword = async (token: string, email: string, password: string, password_confirmation: string): Promise<void> => {
  await api.post('/reset-password', {
    token,
    email,
    password,
    password_confirmation,
  });
};

export const updateProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put<ApiResponse<User>>('/user', userData);
  return response.data.data;
};
