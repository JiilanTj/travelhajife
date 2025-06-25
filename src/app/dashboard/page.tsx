'use client';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useEffect, useState } from 'react';
import { getFinanceDashboardStats } from '@/services/finance';
import { getAgentStats } from '@/services/agent/stats';
import { getMyRegistrations } from '@/services/registration';
import { getMyDocuments } from '@/services/document';
import { getMyPayments } from '@/services/payment';
import { PaymentListItem } from '@/services/payment';
import { Registration } from '@/types/registration';

// Definisikan type untuk role
type UserRole = 'SUPERADMIN' | 'ADMIN' | 'AGEN' | 'MARKETING' | 'JAMAAH';

// Tambahkan interface untuk User
interface User {
  role: UserRole;
  // Tambahkan property lain yang diperlukan
}

interface DashboardItem {
  label: string;
  value: string;
}

// Tambahkan interface untuk quick actions
interface QuickAction {
  title: string;
  description: string;
  icon: string;
  link: string;
}

const roleGreetings: Record<UserRole, string> = {
  SUPERADMIN: 'Selamat datang, Super Admin!',
  ADMIN: 'Selamat datang, Admin!',
  AGEN: 'Selamat datang, Agen!',
  MARKETING: 'Selamat datang, Marketing!',
  JAMAAH: 'Selamat datang, Jamaah!'
};

// Fallback data jika API error
const fallbackData: Record<UserRole, DashboardItem[]> = {
  SUPERADMIN: [
    { label: 'Total Pendapatan', value: 'Rp 0' },
    { label: 'Total Jamaah', value: '0' },
    { label: 'Total Komisi', value: 'Rp 0' },
  ],
  ADMIN: [
    { label: 'Total Pendapatan', value: 'Rp 0' },
    { label: 'Total Jamaah', value: '0' },
    { label: 'Total Komisi', value: 'Rp 0' },
  ],
  AGEN: [
    { label: 'Jamaah Saya', value: '0' },
    { label: 'Total Komisi', value: 'Rp 0' },
    { label: 'Komisi Pending', value: 'Rp 0' },
  ],
  MARKETING: [
    { label: 'Total Leads', value: '0' },
    { label: 'Konversi', value: '0%' },
    { label: 'Target', value: '0%' },
  ],
  JAMAAH: [
    { label: 'Status Pembayaran', value: '0%' },
    { label: 'Dokumen Lengkap', value: '0%' },
    { label: 'Status Pendaftaran', value: 'Belum Terdaftar' },
  ],
};

const roleQuickActions: Record<UserRole, QuickAction[]> = {
  SUPERADMIN: [
    {
      title: 'Kelola Paket',
      description: 'Tambah atau edit paket Umrah & Haji',
      icon: '🎫',
      link: '/dashboard/admin/packages'
    },
    {
      title: 'Verifikasi Pembayaran',
      description: 'Periksa dan verifikasi pembayaran masuk',
      icon: '💳',
      link: '/dashboard/admin/payments'
    },
    {
      title: 'Verifikasi Dokumen',
      description: 'Periksa dokumen jamaah yang masuk',
      icon: '📄',
      link: '/dashboard/admin/documents'
    }
  ],
  ADMIN: [
    {
      title: 'Kelola Paket',
      description: 'Tambah atau edit paket Umrah & Haji',
      icon: '🎫',
      link: '/dashboard/admin/packages'
    },
    {
      title: 'Verifikasi Pembayaran',
      description: 'Periksa dan verifikasi pembayaran masuk',
      icon: '💳',
      link: '/dashboard/admin/payments'
    },
    {
      title: 'Verifikasi Dokumen',
      description: 'Periksa dokumen jamaah yang masuk',
      icon: '📄',
      link: '/dashboard/admin/documents'
    }
  ],
  AGEN: [
    {
      title: 'Kode Referral',
      description: 'Lihat dan bagikan kode referral Anda',
      icon: '🔗',
      link: '/dashboard/agent/referral'
    },
    {
      title: 'Jamaah Saya',
      description: 'Kelola data jamaah referral Anda',
      icon: '👥',
      link: '/dashboard/agent/my-jamaah'
    },
    {
      title: 'Tarik Komisi',
      description: 'Ajukan penarikan komisi Anda',
      icon: '💰',
      link: '/dashboard/agent/withdrawals'
    }
  ],
  MARKETING: [
    {
      title: 'Prospek Baru',
      description: 'Tambah data prospek baru',
      icon: '➕',
      link: '/dashboard/prospects/new'
    },
    {
      title: 'Komisi Saya',
      description: 'Lihat riwayat komisi Anda',
      icon: '💰',
      link: '/dashboard/commission'
    },
    {
      title: 'Target Marketing',
      description: 'Lihat pencapaian target',
      icon: '🎯',
      link: '/dashboard/targets'
    }
  ],
  JAMAAH: [
    {
      title: 'Upload Dokumen',
      description: 'Upload dokumen persyaratan Anda',
      icon: '📤',
      link: '/dashboard/documents'
    },
    {
      title: 'Bayar DP/Angsuran',
      description: 'Lakukan pembayaran DP atau angsuran',
      icon: '💳',
      link: '/dashboard/payments'
    },
    {
      title: 'Info Keberangkatan',
      description: 'Lihat jadwal dan info keberangkatan',
      icon: '✈️',
      link: '/dashboard/my-package'
    }
  ]
};

export default function Dashboard() {
  const { user, loading } = useAuth() as { user: User | null, loading: boolean };
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        let data: DashboardItem[] = [];
        switch (user.role) {
          case 'SUPERADMIN':
          case 'ADMIN':
            const financeStats = await getFinanceDashboardStats();
            if (financeStats) {
              data = [
                { label: 'Total Pendapatan', value: `Rp ${financeStats.totalIncome.toLocaleString()}` },
                { label: 'Total Jamaah', value: '0' }, // This needs to be fetched from a different API
                { label: 'Total Komisi', value: `Rp ${financeStats.totalCommissionPaid.toLocaleString()}` },
              ];
            }
            break;

          case 'AGEN':
            const agentStats = await getAgentStats();
            if (agentStats.data) {
              data = [
                { label: 'Jamaah Saya', value: agentStats.data.totalJamaah.toString() },
                { label: 'Total Komisi', value: `Rp ${agentStats.data.totalCommission}` },
                { label: 'Next Tier', value: agentStats.data.nextTier 
                  ? `${agentStats.data.nextTier.jamaahNeeded} jamaah lagi`
                  : 'Tier Lebih tinggi' },
              ];
            }
            break;

          case 'JAMAAH':
            try {
              const [registrations, documents, payments] = await Promise.all([
                getMyRegistrations(),
                getMyDocuments(),
                getMyPayments()
              ]);
              
              // Get the latest registration
              const latestRegistration = registrations.data[0] as Registration;
              
              // Calculate document completion
              const totalRequiredDocs = 5; // Assume 5 required documents
              const completedDocs = documents.filter(doc => doc.status === 'APPROVED').length;
              const docPercentage = Math.round((completedDocs / totalRequiredDocs) * 100);

              // Calculate payment completion
              const latestPayment = payments[0] as PaymentListItem;
              const paymentStatus = latestPayment ? 
                `${Math.round((latestPayment.amount / latestPayment.dueAmount) * 100)}%` : '0%';

              data = [
                { label: 'Status Pembayaran', value: paymentStatus },
                { label: 'Dokumen Lengkap', value: `${docPercentage}%` },
                { label: 'Status Pendaftaran', value: latestRegistration?.status || 'Belum Terdaftar' },
              ];
            } catch (err) {
              console.error('Error fetching jamaah data:', err);
              data = fallbackData.JAMAAH;
            }
            break;

          default:
            data = [];
        }

        // If no data was fetched, use fallback data
        if (data.length === 0 && user.role in fallbackData) {
          data = fallbackData[user.role];
        }

        setDashboardData(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Gagal memuat data dashboard');
        // Use fallback data on error
        if (user.role in fallbackData) {
          setDashboardData(fallbackData[user.role]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading || isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  if (!user) return null;

  // Memastikan user.role adalah UserRole yang valid
  const userRole = user.role as UserRole;
  const greeting = roleGreetings[userRole];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            {greeting}
          </h1>
          <p className="text-gray-600 mt-1">
            Berikut adalah ringkasan data Anda
          </p>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardData?.map((item: DashboardItem, index: number) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-300 group"
            >
              <p className="text-sm text-gray-600 group-hover:text-green-600 transition-colors">
                {item.label}
              </p>
              <p className="text-2xl font-bold mt-2 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {item.value}
              </p>
            </div>
          ))}
        </div>
        
        {/* Quick Actions Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Menu Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user && roleQuickActions[user.role]?.map((action, i) => (
              <a
                key={i}
                href={action.link}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-colors group"
              >
                <div className="text-2xl">{action.icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800 group-hover:text-green-600 transition-colors">
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}