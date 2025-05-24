
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import CheckInForm from '@/components/admin/CheckInForm';

const AttendanceCheckIn = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-teal-600 rounded-xl shadow-sm p-8 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Manual Attendance Check-In</h1>
            <p className="text-teal-100 text-lg">Record member attendance manually</p>
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <CheckInForm />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AttendanceCheckIn;
