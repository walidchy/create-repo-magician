
import api from './api';
import { Membership, ApiResponse } from '@/types';

// Get all memberships
export const getMemberships = async (queryParams?: string): Promise<Membership[]> => {
  try {
    const response = await api.get<ApiResponse<Membership[]>>(`/memberships${queryParams ? `?${queryParams}` : ''}`);

    if (response.data && response.data.data) {
      // Check if data is wrapped in a data property (paginated response)
      const membershipData = Array.isArray(response.data.data) ? response.data.data : response.data.data || [];
      
      return membershipData.map(m => ({
        ...m,
        // Check if 'features' is a string, and only parse it if it's a string
        features: typeof m.features === 'string' ? JSON.parse(m.features) : m.features || []
      }));
    } else if (Array.isArray(response.data)) {
      return response.data.map(m => ({
        ...m,
        // Check if 'features' is a string, and only parse it if it's a string
        features: typeof m.features === 'string' ? JSON.parse(m.features) : m.features || []
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return [];
  }
};

// Get membership by ID
export const getMembershipById = async (id: number): Promise<Membership | null> => {
  try {
    const response = await api.get<ApiResponse<Membership>>(`/memberships/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching membership:', error);
    return null;
  }
};

// Create new membership
export const createMembership = async (membershipData: Partial<Membership>): Promise<Membership> => {
  const response = await api.post<ApiResponse<Membership>>('/memberships', membershipData);
  return response.data.data;
};

// Update membership
export const updateMembership = async (id: number, membershipData: Partial<Membership>): Promise<Membership> => {
  const response = await api.put<ApiResponse<Membership>>(`/memberships/${id}`, membershipData);
  return response.data.data;
};

// Delete membership
export const deleteMembership = async (id: number): Promise<void> => {
  await api.delete(`/memberships/${id}`);
};

// Subscribe to a membership plan
export const subscribeMembership = async (membershipPlanId: number): Promise<Membership> => {
  const response = await api.post<ApiResponse<Membership>>('/memberships/subscribe', { membership_plan_id: membershipPlanId });
  return response.data.data;
};

// Get current member's membership
export const getMyMembership = async (): Promise<{
  current_active_membership: Membership | null;
  all_active_memberships: Membership[];
  has_current_active: boolean;
  expires_in_days: number;
} | null> => {
  try {
    const response = await api.get('/my-membership');
    
    if (response.data) {
      // Process feature data if needed
      if (response.data.all_active_memberships) {
        response.data.all_active_memberships = response.data.all_active_memberships.map(m => ({
          ...m,
          features: typeof m.membership_plan.features === 'string' 
            ? JSON.parse(m.membership_plan.features) 
            : m.membership_plan.features || []
        }));
      }
      
      if (response.data.current_active_membership) {
        response.data.current_active_membership = {
          ...response.data.current_active_membership,
          features: typeof response.data.current_active_membership.membership_plan.features === 'string'
            ? JSON.parse(response.data.current_active_membership.membership_plan.features)
            : response.data.current_active_membership.membership_plan.features || []
        };
      }
      
      return response.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching member membership:', error);
    return null;
  }
};
