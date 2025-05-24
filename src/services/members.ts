
import api from './api';
import { Member, Membership, Booking, Payment, ApiResponse, MemberFormData, Activity } from '../types';

export const getMembers = async (): Promise<Member[]> => {
  try {
    const response = await api.get('/members');
    
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    if (response.data.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
};

export const createMember = async (memberData: Partial<MemberFormData>): Promise<Member> => {
  try {
    const response = await api.post<ApiResponse<Member>>('/members', memberData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
};

export const deleteMember = async (memberId: number): Promise<void> => {
  try {
    await api.delete(`/members/${memberId}`);
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
};

export const updateMemberProfile = async (memberData: Partial<Member>): Promise<Member> => {
  const response = await api.put<ApiResponse<Member>>('/member/profile', memberData);
  return response.data.data;
};

export const updateMember = async (memberId: number, memberData: Partial<Member>): Promise<Member> => {
  const response = await api.put<ApiResponse<Member>>(`/members/${memberId}`, memberData);
  return response.data.data;
};

export const getMemberMemberships = async (): Promise<Membership[]> => {
  try {
    const response = await api.get<ApiResponse<Membership[]>>('/member/memberships');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching member memberships:', error);
    return [];
  }
};

export const getMemberBookings = async (): Promise<Booking[]> => {
  const response = await api.get<ApiResponse<Booking[]>>('/member/bookings');
  return response.data.data;
};

export const getMemberActivities = async (): Promise<Activity[]> => {
  try {
    const response = await api.get<ApiResponse<Activity[]>>('/member/activities');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching member activities:', error);
    return [];
  }
};

export const leaveActivity = async (activityId: number): Promise<any> => {
  const response = await api.post<ApiResponse<any>>('/activities/leave', { activities_id: activityId });
  return response.data.data;
};

export const createBooking = async (bookingData: { activity_id: number, activity_schedule_id?: number, date: string }): Promise<Booking> => {
  const response = await api.post<ApiResponse<Booking>>('/member/bookings', bookingData);
  return response.data.data;
};

export const cancelBooking = async (bookingId: number, cancellation_reason?: string): Promise<Booking> => {
  const response = await api.put<ApiResponse<Booking>>(`/bookings/${bookingId}/cancel`, { cancellation_reason });
  return response.data.data;
};

export const getMemberPayments = async (): Promise<Payment[]> => {
  const response = await api.get<ApiResponse<Payment[]>>('/member/payments');
  return response.data.data;
};

export const makePayment = async (paymentData: { 
  membership_plan_id: number,
  payment_method: string,
  amount: number
}): Promise<Payment> => {
  const response = await api.post<ApiResponse<Payment>>('/member/payments', paymentData);
  return response.data.data;
};
