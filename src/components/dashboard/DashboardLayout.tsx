'use client';
import { useAuth } from '@/hooks/useAuth';
import { PropsWithChildren, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FaKaaba, FaBars } from 'react-icons/fa';

// Definisikan tagline untuk setiap role
const roleTaglines: Record<string, string> = {
  SUPERADMIN: 'Super Administrator Panel',
  ADMIN: 'Administrator Panel',
  AGEN: 'Portal Agen Resmi',
  MARKETING: 'Marketing Dashboard',
  JAMAAH: 'Portal Jamaah Umrah'
};

export default function DashboardLayout({ children }: PropsWithChildren) {
  const { user, loading, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  const tagline = user?.role ? roleTaglines[user.role] : 'Portal Umrah';
  const userRole = user?.role as 'SUPERADMIN' | 'ADMIN' | 'AGEN' | 'MARKETING' | 'JAMAAH' | undefined;

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 w-64 bg-white border-r border-gray-200 flex flex-col z-30
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-16 justify-center px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-2xl text-green-600">
              <FaKaaba />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Grasindo Travel
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {tagline}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll">
          <Sidebar userRole={userRole} onCloseMobile={() => setIsSidebarOpen(false)} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <FaBars className="w-6 h-6" />
            </button>

            {/* Header content */}
            <div className="flex-1 flex justify-end">
              <Header user={user} onLogout={logout} />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>

        {/* Global CSS untuk scrollbar */}
        <style jsx global>{`
          .sidebar-scroll::-webkit-scrollbar {
            width: 4px;
          }
          .sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 20px;
          }
          .sidebar-scroll::-webkit-scrollbar-thumb:hover {
            background-color: rgba(0, 0, 0, 0.2);
          }
          .sidebar-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
          }
        `}</style>
      </div>
    </div>
  );
} 