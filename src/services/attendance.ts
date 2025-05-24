
import api from './api';
import { toast } from 'sonner';

export interface Attendance {
  id: number;
  user_id: number;
  booking_id: number | null;
  check_in_time: string;
  check_out_time: string | null;
  status: string;
  location: string | null;
  verification_method: string | null;
  verification_token: string | null;
  notes: string | null;
  user: {
    id: number;
    name: string;
    email: string;
  };
  booking?: {
    id: number;
    title: string;
  } | null;
}

export interface AttendanceStats {
  total_check_ins: number;
  currently_checked_in: number;
  todays_check_ins: number;
  avg_duration: string;
}

export const getAttendances = async (params?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<{
  data: Attendance[];
  current_page: number;
  last_page: number;
  total: number;
}> => {
  try {
    const response = await api.get('/attendances', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching attendances:', error);
    return { data: [], current_page: 1, last_page: 1, total: 0 };
  }
};

export const getAttendanceStats = async (): Promise<AttendanceStats> => {
  try {
    const response = await api.get('/attendances/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    return {
      total_check_ins: 0,
      currently_checked_in: 0,
      todays_check_ins: 0,
      avg_duration: '0h 0m'
    };
  }
};

export const checkInUser = async (data: {
  user_id: number;
  booking_id?: number | null;
  verification_method?: string;
  location?: string | null;
  notes?: string | null;
}): Promise<Attendance> => {
  const response = await api.post('/attendances/check-in', data);
  return response.data;
};

export const checkOutUser = async (attendanceId: number): Promise<Attendance> => {
  const response = await api.post(`/attendances/${attendanceId}/check-out`);
  return response.data;
};
