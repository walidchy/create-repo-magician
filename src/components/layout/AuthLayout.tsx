
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side with image or gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0e3b5f] relative overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12">
          <div className="logo-container mb-8">
            <div className="dumbbell-logo">
              <div className="dumbbell-bar"></div>
              <div className="dumbbell-weight left"></div>
              <div className="dumbbell-weight right"></div>
            </div>
          </div>
          <p className="text-xl max-w-md text-center">
            Transform your fitness journey with our advanced gym management platform.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Members</h3>
              <p className="text-sm">Access workouts, schedule classes, and track your progress</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Trainers</h3>
              <p className="text-sm">Manage clients, create programs, and optimize schedules</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Classes</h3>
              <p className="text-sm">Book sessions, explore new activities and improve skills</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-semibold mb-2">Progress</h3>
              <p className="text-sm">Track goals, metrics, and celebrate your achievements</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link to="/" className="inline-block mb-6">
              <div className="dumbbell-logo">
                <div className="dumbbell-bar"></div>
                <div className="dumbbell-weight left"></div>
                <div className="dumbbell-weight right"></div>
              </div>
            </Link>
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
          </div>
          
          {children}
        </div>
      </div>

      {/* Global CSS for the new logo */}
      <style>
        {`
        .dumbbell-logo {
          position: relative;
          width: 110px;
          height: 60px;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0 auto;
        }
        
        .dumbbell-bar {
          width: 60px;
          height: 10px;
          background-color: white;
          border-radius: 4px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        
        .dumbbell-weight {
          width: 20px;
          height: 50px;
          background-color: white;
          border-radius: 4px;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
        
        .dumbbell-weight.left {
          left: 10px;
        }
        
        .dumbbell-weight.right {
          right: 10px;
        }
        
        @media (prefers-color-scheme: dark) {
          .dumbbell-logo .dumbbell-bar,
          .dumbbell-logo .dumbbell-weight {
            background-color: white;
          }
        }
        
        /* Right side logo (black version for light background) */
        .w-full .dumbbell-logo .dumbbell-bar,
        .w-full .dumbbell-logo .dumbbell-weight {
          background-color: #0e3b5f;
        }
        `}
      </style>
    </div>
  );
};

export default AuthLayout;
