import api from './api';

export const getDashboardStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

export const getRevenueData = async () => {
  const response = await api.get('/revenue');
  return response.data;
};

export const getMemberActivity = async () => {
  const response = await api.get('/activities');
  return response.data;
};

export const getMembershipDistribution = async () => {
  const response = await api.get('/memberships');
  return response.data;
};

export const getRecentActivities = async () => {
  const response = await api.get('/activities');
  return response.data;
};

export const getTopActivities = async () => {
  const response = await api.get('/activities');
  return response.data;
};

export const getEquipmentStatus = async () => {
  const response = await api.get('/equipment');
  return response.data;
};