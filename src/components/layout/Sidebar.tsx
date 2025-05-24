import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  Users, 
  User, 
  CreditCard, 
  Clock, 
  Dumbbell, 
  ChevronRight, 
  Heart,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MembershipWidget from '@/components/sidebar/MembershipWidget';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  // Navigation links based on user role
  const memberLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Activities', path: '/activities', icon: <Dumbbell className="h-5 w-5" /> },
    { name: 'My Bookings', path: '/bookings', icon: <Calendar className="h-5 w-5" /> },
    { name: 'Membership', path: '/membership', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'My Profile', path: '/member/profile', icon: <User className="h-5 w-5" /> },
  ];
  
  const trainerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'My Activities', path: '/trainer/activities', icon: <Dumbbell className="h-5 w-5" /> },
    { name: 'My Schedule', path: '/trainer/schedule', icon: <Clock className="h-5 w-5" /> },
    { name: 'My Clients', path: '/trainer/clients', icon: <Users className="h-5 w-5" /> },
    { name: 'My Profile', path: '/trainer/profile', icon: <User className="h-5 w-5" /> },
  ];
  
  const adminLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Members', path: '/admin/members', icon: <Users className="h-5 w-5" /> },
    { name: 'Trainers', path: '/admin/trainers', icon: <Users className="h-5 w-5" /> },
    { name: 'Activities', path: '/admin/activities', icon: <Dumbbell className="h-5 w-5" /> },
    { name: 'Attendances', path: '/admin/attendances', icon: <CheckCircle className="h-5 w-5" /> },
    { name: 'Memberships', path: '/admin/memberships', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Equipment', path: '/admin/equipment', icon: <Dumbbell className="h-5 w-5" /> },
    { name: 'My Profile', path: '/admin/profile', icon: <User className="h-5 w-5" /> },
  ];
  
  const getNavigationLinks = () => {
    switch (user?.role) {
      case 'trainer':
        return trainerLinks;
      case 'admin':
        return adminLinks;
      case 'member':
      default:
        return memberLinks;
    }
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 border-r bg-white shadow-sm z-10">
      <div className="flex flex-col h-full">
        <div className="flex items-center h-16 px-4 border-b bg-gym-secondary text-white">
          <Link to="/" className="text-xl font-bold">
            GYM<span className="ml-1 font-light">LIFE</span>
          </Link>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-3 py-5 space-y-1.5">
            {getNavigationLinks().map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  isActive(item.path)
                    ? 'bg-gray-100 text-gym-secondary font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gym-secondary',
                  'group flex items-center px-3 py-2.5 rounded-md transition-all duration-200'
                )}
              >
                <div className={cn(
                  isActive(item.path) ? 'text-gym-secondary' : 'text-gray-400 group-hover:text-gym-secondary',
                  'mr-3 transition-colors'
                )}>
                  {item.icon}
                </div>
                {item.name}
                <ChevronRight 
                  className={cn(
                    isActive(item.path) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                    'ml-auto h-4 w-4 text-gray-400 transition-opacity'
                  )} 
                />
              </Link>
            ))}
          </nav>
          
          {user?.role === 'member' ? (
            <MembershipWidget />
          ) : (
            <div className="p-4 border-t mt-auto">
              <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Heart className="h-5 w-5 text-gym-primary mr-2" />
                  Health Tips
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Stay hydrated! Aim to drink at least 8 glasses of water daily for optimal performance.
                </p>
                <a href="#" className="mt-2 text-xs text-gym-secondary flex items-center hover:underline">
                  More tips
                  <ChevronRight className="ml-1 h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
