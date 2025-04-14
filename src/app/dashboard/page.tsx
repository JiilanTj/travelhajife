'use client';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Definisikan type untuk role
type UserRole = 'SUPERADMIN' | 'ADMIN' | 'AGEN' | 'MARKETING' | 'JAMAAH';

const roleGreetings: Record<UserRole, string> = {
  SUPERADMIN: 'Selamat datang, Super Admin!',
  ADMIN: 'Selamat datang, Admin!',
  AGEN: 'Selamat datang, Agen!',
  MARKETING: 'Selamat datang, Marketing!',
  JAMAAH: 'Selamat datang, Jamaah!'
};

const roleSummaries: Record<UserRole, Array<{ label: string; value: string }>> = {
  SUPERADMIN: [
    { label: 'Total Users', value: '1,234' },
    { label: 'Total Jamaah', value: '890' },
    { label: 'Total Pendapatan', value: 'Rp 1.2M' },
  ],
  ADMIN: [
    { label: 'Paket Aktif', value: '12' },
    { label: 'Jamaah Aktif', value: '234' },
    { label: 'Pembayaran Pending', value: '15' },
  ],
  AGEN: [
    { label: 'Jamaah Saya', value: '45' },
    { label: 'Total Komisi', value: 'Rp 15jt' },
    { label: 'Prospek Aktif', value: '8' },
  ],
  MARKETING: [
    { label: 'Prospek', value: '23' },
    { label: 'Konversi', value: '12' },
    { label: 'Total Komisi', value: 'Rp 8jt' },
  ],
  JAMAAH: [
    { label: 'Status Pembayaran', value: '80%' },
    { label: 'Dokumen Lengkap', value: '90%' },
    { label: 'Jadwal Keberangkatan', value: '45 hari' },
  ],
};

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>
  );

  const summaries = roleSummaries[user.role];
  const greeting = roleGreetings[user.role];

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaries.map((item, index) => (
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

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Aktivitas Terbaru
          </h2>
          <div className="space-y-4">
            {/* Placeholder activity items */}
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm text-gray-800">Aktivitas {i + 1}</p>
                  <p className="text-xs text-gray-500">2 jam yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 