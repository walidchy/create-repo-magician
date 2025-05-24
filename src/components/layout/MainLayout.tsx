
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {isAuthenticated && <Sidebar />}
      <div className={`flex flex-col flex-1 w-full ${isAuthenticated ? 'md:ml-64' : ''}`}>
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 pb-10">
          {children}
        </main>
        <footer className="py-4 px-6 border-t bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© 2025 GymLife System. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms of Service</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
