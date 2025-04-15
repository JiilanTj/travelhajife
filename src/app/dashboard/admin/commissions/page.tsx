'use client';

import { useState, useEffect } from 'react';
import { getAllCommissions, getAllPaymentRequests, processPaymentRequest } from '@/services/admin/commission';
import { Commission, CommissionPaymentRequest } from '@/types/commission';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { formatCurrency } from '@/utils/format';
import { FaMoneyBill, FaHistory, FaSpinner, FaCheckCircle, FaTimesCircle, FaClock, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface ApiError extends Error {
  message: string;
  status?: number;
}

export default function AdminCommissionsPage() {
  const [activeTab, setActiveTab] = useState<'commissions' | 'requests'>('commissions');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<CommissionPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'commissions') {
        const response = await getAllCommissions();
        setCommissions(response.data);
      } else {
        const response = await getAllPaymentRequests();
        setPaymentRequests(response.data);
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Error fetching data:', apiError);
      toast.error(apiError?.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (requestId: string, currentStatus: string) => {
    let nextStatus: 'PROCESS' | 'DONE' | 'REJECTED';
    let actionText: string;
    let buttonColor: string;

    switch (currentStatus) {
      case 'PENDING':
        nextStatus = 'PROCESS';
        actionText = 'memproses';
        buttonColor = '#EAB308'; // Yellow
        break;
      case 'PROCESS':
        nextStatus = 'DONE';
        actionText = 'menyelesaikan';
        buttonColor = '#10B981'; // Green
        break;
      default:
        return;
    }

    const result = await Swal.fire({
      title: `Konfirmasi ${actionText} pembayaran`,
      input: 'text',
      inputLabel: 'Catatan (opsional)',
      inputPlaceholder: 'Masukkan catatan...',
      showCancelButton: true,
      confirmButtonText: `Ya, ${actionText}`,
      cancelButtonText: 'Batal',
      confirmButtonColor: buttonColor,
      showDenyButton: currentStatus === 'PENDING',
      denyButtonText: 'Tolak',
      denyButtonColor: '#EF4444', // Red
    });

    if (result.isDenied) {
      // Handle rejection
      const rejectResult = await Swal.fire({
        title: 'Tolak Pembayaran',
        input: 'text',
        inputLabel: 'Alasan Penolakan',
        inputPlaceholder: 'Masukkan alasan penolakan...',
        inputValidator: (value) => {
          if (!value) {
            return 'Anda harus memasukkan alasan penolakan!';
          }
          return null;
        },
        confirmButtonText: 'Tolak',
        confirmButtonColor: '#EF4444',
        showCancelButton: true,
        cancelButtonText: 'Batal',
      });

      if (rejectResult.isConfirmed) {
        try {
          await processPaymentRequest(requestId, {
            status: 'REJECTED',
            notes: rejectResult.value || 'Pembayaran ditolak',
          });
          toast.success('Pembayaran berhasil ditolak');
          fetchData();
        } catch (error) {
          const apiError = error as ApiError;
          toast.error(apiError?.message || 'Gagal menolak pembayaran');
        }
      }
    } else if (result.isConfirmed) {
      try {
        await processPaymentRequest(requestId, {
          status: nextStatus,
          notes: result.value || `Pembayaran ${actionText}`,
        });
        toast.success(`Pembayaran berhasil ${actionText}`);
        fetchData();
      } catch (error) {
        const apiError = error as ApiError;
        toast.error(apiError?.message || `Gagal ${actionText} pembayaran`);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <FaClock className="inline-block mr-1" />
            Menunggu
          </span>
        );
      case 'PROCESS':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <FaSpinner className="inline-block mr-1 animate-spin" />
            Diproses
          </span>
        );
      case 'DONE':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="inline-block mr-1" />
            Selesai
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="inline-block mr-1" />
            Ditolak
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

  return (
    <DashboardLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header Section with Stats */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manajemen Komisi</h1>
          <p className="text-gray-600">Kelola komisi dan permintaan pencairan dari agen</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Komisi</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(commissions.reduce((sum, commission) => 
                      sum + parseFloat(commission.commissionAmount), 0
                    ))}
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FaMoneyBill className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Permintaan Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {paymentRequests.filter(req => req.status === 'PENDING').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <FaClock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Dalam Proses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {paymentRequests.filter(req => req.status === 'PROCESS').length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex p-2">
            <button
              onClick={() => setActiveTab('commissions')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'commissions'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaMoneyBill className={activeTab === 'commissions' ? 'text-white' : 'text-gray-400'} />
              <span>Semua Komisi</span>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === 'requests'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaHistory className={activeTab === 'requests' ? 'text-white' : 'text-gray-400'} />
              <span>Permintaan Pencairan</span>
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
                placeholder="Cari berdasarkan nama agen atau email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 placeholder-gray-500"
              />
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <FaFilter className="mr-2" />
                Filter
              </button>
              <select className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 bg-white">
                <option value="" className="text-gray-700">Semua Status</option>
                <option value="PENDING" className="text-gray-700">Pending</option>
                <option value="PROCESS" className="text-gray-700">Diproses</option>
                <option value="DONE" className="text-gray-700">Selesai</option>
                <option value="REJECTED" className="text-gray-700">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
            <FaSpinner className="animate-spin text-4xl text-emerald-500 mb-4" />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'commissions' ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Agen
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Harga Paket
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Rate Komisi
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Jumlah Komisi
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {commissions.map((commission) => (
                        <tr key={commission.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {commission.User.fullname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {commission.User.email}
                            </div>
                            <div className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full inline-block mt-1">
                              {commission.User.referralCode}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(parseFloat(commission.packagePrice))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {commission.commissionRate}%
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-emerald-600">
                              {formatCurrency(parseFloat(commission.commissionAmount))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(commission.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              {new Date(commission.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {paymentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pencairan untuk {request.Agent.fullname}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">{request.Agent.email}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-sm text-gray-500">{request.Agent.phone}</span>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Informasi Bank</p>
                        <p className="text-base font-semibold text-gray-900">
                          {request.bankName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {request.accountNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          a.n {request.accountName}
                        </p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-emerald-600 mb-2">Total Pencairan</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(parseFloat(request.amount))}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm font-medium text-gray-500 mb-3">
                        Detail Komisi ({request.Commissions.length})
                      </p>
                      <div className="space-y-2">
                        {request.Commissions.map((commission) => (
                          <div
                            key={commission.id}
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm text-gray-600 font-medium">
                              #{commission.id.slice(0, 8)}
                            </span>
                            <span className="text-sm font-semibold text-emerald-600">
                              {formatCurrency(parseFloat(commission.commissionAmount))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(request.status === 'PENDING' || request.status === 'PROCESS') && (
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          onClick={() => handleProcessPayment(request.id, request.status)}
                          className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${
                            request.status === 'PENDING'
                              ? 'bg-yellow-500 hover:bg-yellow-600 shadow-lg shadow-yellow-100'
                              : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100'
                          }`}
                        >
                          {request.status === 'PENDING' ? 'Proses Pembayaran' : 'Selesaikan'}
                        </button>
                      </div>
                    )}

                    <div className="mt-4 flex items-center text-sm text-gray-500">
                      <FaClock className="mr-2" />
                      Diajukan pada:{' '}
                      {new Date(request.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}

                {paymentRequests.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col items-center">
                      <FaHistory className="text-4xl text-gray-300 mb-4" />
                      <p className="text-gray-500">Tidak ada permintaan pencairan saat ini</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}