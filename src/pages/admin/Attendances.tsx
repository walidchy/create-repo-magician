
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AttendanceList from '@/components/admin/AttendanceList';
import AttendanceStats from '@/components/admin/AttendanceStats';

const Attendances = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-blue-600 rounded-xl shadow-sm p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Attendance Management</h1>
            <p className="text-blue-100 text-lg">Track and manage member gym attendance</p>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
            <AttendanceStats />
          </div>

          {/* Records Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <AttendanceList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Attendances;
