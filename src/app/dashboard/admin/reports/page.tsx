'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';
import { getFinanceDashboardStats, getAllPayments, getAllCommissionPayments, getPackagesFinancial } from '@/services/finance';
import { FinanceDashboardStats, Payment, CommissionPayment, PackageFinance } from '@/types/finance';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FaChartBar, FaChartPie, FaChartLine, FaSpinner } from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FinanceDashboardStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [commissions, setCommissions] = useState<CommissionPayment[]>([]);
  const [packages, setPackages] = useState<PackageFinance[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, paymentsData, commissionsData, packagesData] = await Promise.all([
        getFinanceDashboardStats(),
        getAllPayments(),
        getAllCommissionPayments(),
        getPackagesFinancial()
      ]);

      setStats(statsData);
      setPayments(paymentsData.payments);
      setCommissions(commissionsData.commissionPayments);
      setPackages(packagesData.packages);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data statistik');
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for Monthly Income Chart
  const monthlyIncomeData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Income',
        data: [65, 59, 80, 81, 56, 55, 40, 88, 96, 97, 85, stats?.monthlyIncome || 0],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  // Prepare data for Payment Status Chart
  const paymentStatusData = {
    labels: ['Paid', 'Pending', 'Failed'],
    datasets: [
      {
        data: [
          payments.filter(p => p.status === 'PAID').length,
          payments.filter(p => p.status === 'PENDING').length,
          payments.filter(p => p.status === 'FAILED').length,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(234, 179, 8, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(234, 179, 8)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for Package Revenue Chart
  const packageRevenueData = {
    labels: packages.map(pkg => pkg.name),
    datasets: [
      {
        label: 'Revenue per Package',
        data: packages.map(pkg => pkg.totalRevenue),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl text-emerald-500 mb-4" />
            <p className="text-gray-500">Memuat data statistik...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Laporan & Statistik</h1>
          <p className="text-gray-600">Analisis data keuangan dan performa bisnis</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Pendapatan</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.totalIncome || 0)}</p>
              </div>
              <FaChartLine className="w-8 h-8 opacity-80" />
            </div>
            <div className="mt-4 text-sm opacity-90">
              <span className="bg-emerald-400/30 px-2 py-1 rounded">
                +{((stats?.monthlyIncome || 0) / (stats?.totalIncome || 1) * 100).toFixed(1)}% bulan ini
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Transaksi</p>
                <p className="text-2xl font-bold mt-1">{payments.length}</p>
              </div>
              <FaChartBar className="w-8 h-8 opacity-80" />
            </div>
            <div className="mt-4 text-sm opacity-90">
              <span className="bg-blue-400/30 px-2 py-1 rounded">
                {payments.filter(p => p.status === 'PAID').length} transaksi sukses
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Komisi</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stats?.totalCommissionPaid || 0)}</p>
              </div>
              <FaChartPie className="w-8 h-8 opacity-80" />
            </div>
            <div className="mt-4 text-sm opacity-90">
              <span className="bg-purple-400/30 px-2 py-1 rounded">
                {commissions.length} pembayaran komisi
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Paket Aktif</p>
                <p className="text-2xl font-bold mt-1">{packages.length}</p>
              </div>
              <FaChartBar className="w-8 h-8 opacity-80" />
            </div>
            <div className="mt-4 text-sm opacity-90">
              <span className="bg-orange-400/30 px-2 py-1 rounded">
                {packages.reduce((acc, pkg) => acc + pkg.registrations, 0)} total registrasi
              </span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Income Trend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tren Pendapatan Bulanan</h3>
            <div className="h-[300px]">
              <Line
                data={monthlyIncomeData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Payment Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Status Pembayaran</h3>
            <div className="h-[300px] flex items-center justify-center">
              <div className="w-[300px]">
                <Doughnut
                  data={paymentStatusData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Package Revenue */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pendapatan per Paket</h3>
            <div className="h-[300px]">
              <Bar
                data={packageRevenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Performing Packages</h3>
            <div className="space-y-3">
              {packages
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 3)
                .map((pkg, index) => (
                  <div key={pkg.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{pkg.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(pkg.totalRevenue)}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Transactions</h3>
            <div className="space-y-3">
              {payments
                .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                .slice(0, 3)
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.Registration.User.fullname}</p>
                      <p className="text-xs text-gray-500">{payment.type}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(Number(payment.amount))}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Commission Summary</h3>
            <div className="space-y-3">
              {commissions
                .sort((a, b) => Number(b.amount) - Number(a.amount))
                .slice(0, 3)
                .map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{commission.Agent.fullname}</p>
                      <p className="text-xs text-gray-500">{commission.status}</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(Number(commission.amount))}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 