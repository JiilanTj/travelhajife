'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FaUsers, FaPlane, FaMoneyBillWave, FaChartBar, 
  FaUsersCog, FaHandshake, FaUserTie, FaTachometerAlt, FaWallet, FaWhatsapp, FaPassport, FaBell,
  FaComments, FaFileInvoiceDollar, FaPercent, FaUserPlus, FaPeopleCarry, FaNewspaper, FaMoneyCheck
} from 'react-icons/fa';
import { IconType } from 'react-icons';

type UserRole = 'SUPERADMIN' | 'ADMIN' | 'AGEN' | 'MARKETING' | 'JAMAAH';

interface MenuItem {
  icon: IconType;
  label: string;
  href: string;
}

const menuItems: Record<UserRole, MenuItem[]> = {
  SUPERADMIN: [
    { icon: FaTachometerAlt, label: 'Dashboard', href: '/dashboard' },
    { icon: FaPlane, label: 'Manajemen Paket', href: '/dashboard/admin/packages' },
    { icon: FaUsers, label: 'Manajemen User', href: '/dashboard/admin/users' },
    { icon: FaPassport, label: 'Manajemen Dokumen', href: '/dashboard/admin/documents' },
    { icon: FaFileInvoiceDollar, label: 'Manajemen Pembayaran', href: '/dashboard/admin/payments' },
    { icon: FaPeopleCarry, label: 'Manajemen Jamaah', href: '/dashboard/admin/jamaah' },
    { icon: FaUserPlus, label: 'Manajemen Agen', href: '/dashboard/admin/agents' },
    { icon: FaPercent, label: 'Komisi & Afiliasi', href: '/dashboard/admin/commissions' },
    { icon: FaMoneyBillWave, label: 'Laporan Keuangan', href: '/dashboard/admin/finance' },
    { icon: FaChartBar, label: 'Laporan & Statistik', href: '/dashboard/admin/reports' },
    { icon: FaComments, label: 'Chat Support', href: '/dashboard/admin/support' },
    { icon: FaNewspaper, label: 'Content Management', href: '/dashboard/admin/content' },
  ],
  ADMIN: [
    { icon: FaTachometerAlt, label: 'Dashboard', href: '/dashboard' },
    { icon: FaPlane, label: 'Manajemen Paket', href: '/dashboard/admin/packages' },
    { icon: FaPassport, label: 'Manajemen Dokumen', href: '/dashboard/admin/documents' },
    { icon: FaFileInvoiceDollar, label: 'Manajemen Pembayaran', href: '/dashboard/admin/payments' },
    { icon: FaPeopleCarry, label: 'Manajemen Jamaah', href: '/dashboard/admin/jamaah' },
    { icon: FaPercent, label: 'Komisi & Afiliasi', href: '/dashboard/admin/commissions' },
    { icon: FaMoneyBillWave, label: 'Laporan Keuangan', href: '/dashboard/admin/finance' },
    { icon: FaChartBar, label: 'Laporan & Statistik', href: '/dashboard/admin/reports' },
    { icon: FaComments, label: 'Chat Support', href: '/dashboard/admin/support' },
  ],
  AGEN: [
    { icon: FaTachometerAlt, label: 'Dashboard', href: '/dashboard' },
    { icon: FaUsersCog, label: 'Jamaah Saya', href: '/dashboard/agent/my-jamaah' },
    { icon: FaMoneyBillWave, label: 'Komisi', href: '/dashboard/agent/commission' },
    { icon: FaMoneyCheck, label: 'Pencairan Komisi', href: '/dashboard/agent/withdrawals' },
    { icon: FaHandshake, label: 'Manager Referral', href: '/dashboard/agent/referral' },
    { icon: FaComments, label: 'Chat Support', href: '/dashboard/admin/support' },
  ],
  MARKETING: [
    { icon: FaTachometerAlt, label: 'Dashboard', href: '/dashboard' },
    { icon: FaHandshake, label: 'Prospek', href: '/dashboard/prospects' },
    { icon: FaMoneyBillWave, label: 'Komisi', href: '/dashboard/commission' },
  ],
  JAMAAH: [
    { 
      icon: FaTachometerAlt, 
      label: 'Dashboard', 
      href: '/dashboard' 
    },
    { 
      icon: FaUserTie, 
      label: 'Profil Saya', 
      href: '/dashboard/profile' 
    },
    { 
      icon: FaPassport, 
      label: 'Dokumen Saya', 
      href: '/dashboard/documents' 
    },
    { 
      icon: FaPlane, 
      label: 'Paket Saya', 
      href: '/dashboard/my-package' 
    },
    { 
      icon: FaWallet, 
      label: 'Pembayaran', 
      href: '/dashboard/payments' 
    },
    { 
      icon: FaBell, 
      label: 'Notifikasi', 
      href: '/dashboard/notifications' 
    },
    { 
      icon: FaWhatsapp, 
      label: 'Chat Support', 
      href: '/dashboard/support' 
    },
    { 
      icon: FaHandshake, 
      label: 'Program Referral', 
      href: '/dashboard/referral' 
    }
  ],
};

interface SidebarProps {
  userRole?: UserRole;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  
  if (!userRole) return null;

  const items = menuItems[userRole];

  return (
    <nav className="mt-4 pr-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-6 py-3 mx-3 mb-1 rounded-lg transition-all duration-300 ${
              isActive 
                ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 hover:text-green-600'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${
              isActive ? 'transform rotate-6' : ''
            }`} />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
      
      {/* Bagian Bantuan di bawah sidebar */}
      <div className="mt-8 pt-6 px-6 border-t border-gray-100 pb-8">
        <div className="bg-green-50 p-4 rounded-xl">
          <h5 className="text-sm font-medium text-green-800 mb-2">Butuh bantuan?</h5>
          <p className="text-xs text-green-700 mb-3">
            Jika Anda memiliki pertanyaan atau kendala dalam penggunaan aplikasi, hubungi kami.
          </p>
          <Link 
            href="/dashboard/support" 
            className="flex items-center text-xs font-medium text-green-700 hover:text-green-800"
          >
            <FaWhatsapp className="w-3 h-3 mr-1" />
            <span>WhatsApp Support</span>
          </Link>
          <div className="mt-2">
            <Link 
              href="/dashboard/faq" 
              className="text-xs font-medium text-green-700 hover:text-green-800 mr-3"
            >
              FAQ
            </Link>
            <Link 
              href="/dashboard/help" 
              className="text-xs font-medium text-green-700 hover:text-green-800"
            >
              Panduan
            </Link>
          </div>
        </div>
        <div className="text-center mt-3">
          <span className="text-xs text-gray-500">
            Grasindo Travel © {new Date().getFullYear()}
          </span>
          <div className="flex flex-col items-center justify-center mt-2 text-xs">
            <span className="text-gray-500 font-medium">Technology By</span>
            <a 
              href="https://erazorre.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-green-600 hover:text-green-700 hover:underline mt-1 font-medium inline-flex items-center"
            >
              Erazorre Technology Bandung
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 ml-0.5">
                <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
} 