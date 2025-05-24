export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  trainer?: Trainer;
  active_members?: number;
  phone?: string;
  address?: string;
  bio?: string;
  birth_date?: string;
  gender?: string;
  role: 'member' | 'trainer' | 'admin';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  position?: string;
  department?: string;
  memberProfile?: {
    phone?: string;
  };
  trainerProfile?: {
    phone?: string;
    specialization?: string;
    certifications?: string[];
    experience_years?: number;
  };
  adminProfile?: {
    phone?: string;
    position?: string;
    department?: string;
  };
}

interface TrainerAvailability {
  id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface WeeklySchedule {
  [day: string]: {
    activities: Activity[];
    availability: TrainerAvailability[];
  };
}

interface ScheduleSummary {
  total_classes: number;
  busiest_day: string;
  busiest_day_count: number;
  total_participants: number;
  total_capacity: number;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  role?: string;
  is_verified?: boolean;
  phone?: string;
  avatar?: string;
  birth_date?: string;
  gender?: string;
  membership?: {
    id: number;
    member_id: number;
    membership_plan_id: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  memberships?: {
    id: number;
    name: string;
    is_active: boolean;
    end_date: string;
    membership_plan?: {
      name: string;
    };
  }[];
  activities?: Activity[]; // Added this field for joined activities
  created_at?: string;
  updated_at?: string;
}

export interface Trainer {
  user_id: number;
  specialization?: string;
  bio?: string;
  experience_years?: number;
  certifications?: string[];
  phone?: string;
}

export interface Admin {
  user_id: number;
  position?: string;
  department?: string;
  phone?: string;
}

export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

export interface Schedule {
  id: number;
  activity_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: string;
  type?: string;
  trainer?: { name: string };
  end_date: string;
  start_date: string;
  membership_plan?: {
    id: number;
    name: string;
    description?: string;
    duration_days: number;
    features?: string[];
  };
}

export interface Activity {
  id: number;
  name: string;
  description?: string;
  trainer_id?: number;
  trainer_name?: string;
  category: string;
  difficulty_level: string;
  duration_minutes: number;
  max_participants: number;
  location: string;
  equipment_needed?: string[] | string;
  schedules?: ActivitySchedule[];
  trainer?: { 
    name: string 
  };
  members?: Member[]; // Added this field for members who joined
  // Add missing properties from error messages
  type?: 'class' | 'personal_training' | 'workshop' | string;
  image_url?: string;
  title?: string;
  duration?: number;
  capacity?: number;
}

export interface ActivitySchedule {
  id: number;
  activity_id: number;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  activity_id: number;
  activity?: Activity;
  activity_schedule_id?: number;
  schedule?: Schedule;
  date: string;
  status: 'upcoming' | 'completed' | 'canceled';
  cancellation_reason?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Equipment {
  id: number;
  name: string;
  description: string;
  category: string;
  quantity: number;
  purchase_date: string;
  maintenance_date: string | null;
  status: 'available' | 'in_use' | 'maintenance' | 'retired';
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: string;
  created_at: string;
}

export interface Payment {
  id: number;
  user_id: number;
  membership_plan_id?: number;
  membership_plan?: MembershipPlan;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_date: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'member' | 'trainer' | 'admin';
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
  current_page?: number;
  total?: number;
  last_page?: number;
}

export interface TrainerClient extends User {
  progress: number;
  lastSession: string;
  nextSession: string;
  goals: string[];
  membership: {
    name: string;
    end_date: string;
  };
  notes: string;
  sessions_completed: number;
  sessions_missed: number;
}

export interface MemberFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  birth_date: string;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  avatar?: string;
}
