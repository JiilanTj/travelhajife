"use client";

import { useEffect, useState } from 'react';
import { getMyCommissions } from '@/services/agent/commission';
import { Commission, CommissionStats } from '@/types/agent';
import { formatCurrency } from '@/utils/format';
import { FaCoins, FaClock, FaCheckCircle, FaUsers } from 'react-icons/fa';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { toast } from 'react-hot-toast';

export default function CommissionPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const response = await getMyCommissions();
      setCommissions(response.data.commissions);
      setStats(response.data.stats);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      toast.error('Gagal memuat data komisi');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Komisi Saya</h1>
            <p className="text-gray-600 mt-2">
              Pantau perkembangan komisi dari jamaah referral Anda
            </p>
          </div>
      
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaCoins className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Total Komisi</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats?.totalCommission || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaClock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Komisi Pending</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats?.pendingCommission || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaCheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Komisi Dibayar</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats?.paidCommission || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaUsers className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Total Jamaah</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats?.totalJamaah || 0}
              </p>
            </div>
          </div>

          {/* Commission Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Riwayat Komisi</h2>
              <p className="text-gray-600 mt-1">Detail komisi dari setiap jamaah referral Anda</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jamaah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga Paket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate Komisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Komisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center">
                        <FaCoins className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Belum Ada Komisi
                        </h3>
                        <p className="text-gray-600">
                          Anda belum memiliki komisi dari jamaah referral
                        </p>
                      </td>
                    </tr>
                  ) : (
                    commissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {commission.Registration.User.fullname}
                          </div>
                          <div className="text-sm text-gray-500">
                            {commission.Registration.User.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {commission.Registration.Package.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(commission.Registration.Package.departureDate).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(parseFloat(commission.packagePrice))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {parseFloat(commission.commissionRate)}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(parseFloat(commission.commissionAmount))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={commission.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: Commission['status'] }) {
  const getStatusColor = (status: Commission['status']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(status)}`}>
      {status}
    </span>
  );
} 