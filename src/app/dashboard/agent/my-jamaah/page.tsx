 'use client';

import { useEffect, useState } from 'react';
import { FaUsers, FaStar, FaArrowUp, FaMoneyBillWave, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getAgentStats } from '@/services/agent/stats';
import { AgentStats } from '@/types/agent';

export default function MyJamaahPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AgentStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getAgentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Gagal memuat data statistik');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(parseFloat(amount));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Jamaah Saya</h1>
            <p className="text-gray-600 mt-2">
              Kelola dan pantau perkembangan jamaah referral Anda
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Current Tier */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaStar className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Tier Saat Ini</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.tier}</p>
            </div>

            {/* Total Jamaah */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaUsers className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Total Jamaah</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.totalJamaah}</p>
            </div>

            {/* Next Tier Progress */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaArrowUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Menuju {stats?.nextTier.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.nextTier.jamaahNeeded} Jamaah Lagi
              </p>
            </div>

            {/* Total Commission */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaMoneyBillWave className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Total Komisi Tersedia</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.totalCommission ? formatCurrency(stats.totalCommission) : 'Rp 0'}
              </p>
            </div>
          </div>

          {/* Next Tier Benefits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Benefit Tier Selanjutnya - {stats?.nextTier.name}
            </h2>
            <p className="text-gray-600 mb-4">{stats?.nextTier.benefits.description}</p>
            <ul className="space-y-2">
              {stats?.nextTier.benefits.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Referred Jamaah List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Daftar Jamaah Referral</h2>
              <p className="text-gray-600 mt-1">Jamaah yang mendaftar menggunakan kode referral Anda</p>
            </div>

            {stats?.referredJamaah.length === 0 ? (
              <div className="p-6 text-center">
                <FaUserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Belum Ada Jamaah Referral
                </h3>
                <p className="text-gray-600">
                  Bagikan kode referral Anda untuk mulai mengundang jamaah
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Lengkap
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. Telepon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Registrasi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats?.referredJamaah.map((jamaah) => (
                      <tr key={jamaah.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{jamaah.fullname}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{jamaah.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{jamaah.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(jamaah.registeredAt)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}