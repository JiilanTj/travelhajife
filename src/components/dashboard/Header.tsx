'use client';
import { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaBell, FaChevronDown, FaUserCog, FaSignOutAlt } from 'react-icons/fa';

interface HeaderProps {
  user: {
    fullname: string;
    role: string;
  } | null;
  onLogout: () => void;
}

export default function Header({ user, onLogout }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* Notifications */}
      <button className="relative p-2 hover:bg-gray-50 rounded-full transition-all duration-300 group">
        <FaBell className="w-5 h-5 text-gray-600 group-hover:text-green-600" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
      </button>

      {/* User Menu */}
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden lg:block text-right">
            <p className="text-sm font-semibold text-gray-700">{user?.fullname}</p>
            <p className="text-xs text-green-600 font-medium">{user?.role}</p>
          </div>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-300 ${
              isDropdownOpen 
                ? 'bg-green-50 text-green-600 ring-2 ring-green-200' 
                : 'hover:bg-gray-50 text-gray-600'
            }`}
          >
            <FaUserCircle className="w-8 h-8" />
            <FaChevronDown className={`w-4 h-4 transition-transform duration-300 ${
              isDropdownOpen ? 'transform rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* Dropdown Menu */}
        <div 
          className={`
            absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-100 
            transform transition-all duration-200 origin-top-right z-50
            ${isDropdownOpen 
              ? 'opacity-100 scale-100 translate-y-0' 
              : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
          `}
        >
          {/* Mobile-only user info */}
          <div className="lg:hidden px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{user?.fullname}</p>
            <p className="text-xs text-green-600">{user?.role}</p>
          </div>

          <div className="p-2">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 rounded-md flex items-center gap-2 group transition-colors"
            >
              <FaUserCog className="w-4 h-4 text-gray-400 group-hover:text-green-600" />
              <span>Pengaturan Akun</span>
            </button>
            
            <button
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2 group transition-colors mt-1"
            >
              <FaSignOutAlt className="w-4 h-4 text-red-400 group-hover:text-red-600" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 