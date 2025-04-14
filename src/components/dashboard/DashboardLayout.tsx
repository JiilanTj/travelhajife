'use client';
import { useAuth } from '@/hooks/useAuth';
import { PropsWithChildren } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FaKaaba } from 'react-icons/fa';

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

  if (loading) {
    return <div>Loading...</div>;
  }

  const tagline = user?.role ? roleTaglines[user.role] : 'Portal Umrah';
  const userRole = user?.role as 'SUPERADMIN' | 'ADMIN' | 'AGEN' | 'MARKETING' | 'JAMAAH' | undefined;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="flex flex-col h-16 justify-center px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-2xl text-green-600">
              <FaKaaba />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Al-Amin Travel
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {tagline}
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll">
          <Sidebar userRole={userRole} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 h-16 bg-white border-b border-gray-200 z-10">
          <div className="flex justify-end items-center h-full px-6">
            <Header user={user} onLogout={logout} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="pt-16 p-6">
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