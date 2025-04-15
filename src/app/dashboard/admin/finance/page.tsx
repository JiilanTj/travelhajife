"use client";

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/format';
import { getFinanceDashboardStats, getAllPayments, getAllCommissionPayments, getPackagesFinancial } from '@/services/finance';
import { FinanceDashboardStats, Payment, CommissionPayment, PackageFinance } from '@/types/finance';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FaMoneyBill, FaHistory, FaSpinner, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaFilter } from 'react-icons/fa';

export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState(0);
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
      console.error('Error fetching finance data:', error);
      toast.error('Gagal memuat data keuangan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="inline-block mr-1" />
            Selesai
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="inline-block mr-1" />
            Menunggu
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="inline-block mr-1" />
            Gagal
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl text-emerald-500 mb-4" />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header Section with Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Finance Dashboard</h1>
          <p className="text-gray-600">Kelola dan monitor keuangan perusahaan</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Total Income</p>
                  <p className="mt-1 text-base font-bold text-emerald-600 truncate" style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(stats?.totalIncome || 0)}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                  <FaMoneyBill className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Monthly Income</p>
                  <p className="mt-1 text-base font-bold text-blue-600 truncate" style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(stats?.monthlyIncome || 0)}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FaMoneyBill className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Pending Amount</p>
                  <p className="mt-1 text-base font-bold text-yellow-600 truncate" style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(stats?.pendingAmount || 0)}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                  <FaClock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Commission Paid</p>
                  <p className="mt-1 text-base font-bold text-red-600 truncate" style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(stats?.totalCommissionPaid || 0)}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-red-100 rounded-lg flex-shrink-0">
                  <FaMoneyBill className="w-4 h-4 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Net Income</p>
                  <p className="mt-1 text-base font-bold text-green-600 truncate" style={{ fontFamily: 'monospace' }}>
                    {formatCurrency(stats?.netIncome || 0)}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <FaMoneyBill className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex p-2">
            <button
              onClick={() => setActiveTab(0)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === 0
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaMoneyBill className={activeTab === 0 ? 'text-white' : 'text-gray-400'} />
              <span>Payments</span>
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === 1
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaHistory className={activeTab === 1 ? 'text-white' : 'text-gray-400'} />
              <span>Commissions</span>
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === 2
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaMoneyBill className={activeTab === 2 ? 'text-white' : 'text-gray-400'} />
              <span>Packages</span>
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 placeholder-gray-500"
              />
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <FaFilter className="mr-2" />
                Filter
              </button>
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 bg-white">
                <option value="">Semua Status</option>
                <option value="PAID">Selesai</option>
                <option value="PENDING">Menunggu</option>
                <option value="FAILED">Gagal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Panels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{payment.Registration.User.fullname}</div>
                        <div className="text-sm text-gray-500">{payment.Registration.Package.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {formatCurrency(Number(payment.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.dueDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 1 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{commission.Agent.fullname}</div>
                        <div className="text-sm text-gray-500">{commission.Agent.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {formatCurrency(Number(commission.amount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(commission.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{commission.bankName}</div>
                        <div className="text-sm text-gray-500">{commission.accountNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {commission.processedAt ? new Date(commission.processedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 2 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quota</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(pkg.departureDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pkg.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {formatCurrency(Number(pkg.price))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{pkg.registrations} / {pkg.quota}</div>
                        <div className="text-sm text-gray-500">{pkg.remainingQuota} remaining</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {formatCurrency(pkg.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 