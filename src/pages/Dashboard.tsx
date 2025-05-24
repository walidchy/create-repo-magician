
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import MemberDashboard from './dashboard/MemberDashboard';
import TrainerDashboard from './dashboard/TrainerDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import { Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';

const Dashboard: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gym-secondary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'member':
        return <MemberDashboard />;
      case 'trainer':
        return <TrainerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <MemberDashboard />;
    }
  };

  return (
    <MainLayout>
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {renderDashboard()}
      </div>
    </MainLayout>
  );
};

export default Dashboard;
