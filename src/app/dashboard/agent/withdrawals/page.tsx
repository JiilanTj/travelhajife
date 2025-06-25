'use client';

import { useState, useEffect } from 'react';
import { getAvailableCommissions, getMyPaymentRequests, requestPayment } from '@/services/agent/commission';
import { Commission, CommissionPaymentRequest, CommissionBankInfo } from '@/types/commission';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { formatCurrency } from '@/utils/format';
import { FaMoneyCheck, FaHistory, FaSpinner, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

interface ApiError extends Error {
  message: string;
  status?: number;
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <FaClock className="w-3 h-3 mr-1" />,
          text: 'Menunggu',
          className: 'bg-amber-100 text-amber-800'
        };
      case 'PROCESS':
        return {
          icon: <FaSpinner className="w-3 h-3 mr-1 animate-spin" />,
          text: 'Diproses',
          className: 'bg-yellow-100 text-yellow-700'
        };
      case 'DONE':
        return {
          icon: <FaCheckCircle className="w-3 h-3 mr-1" />,
          text: 'Selesai',
          className: 'bg-emerald-100 text-emerald-800'
        };
      case 'REJECTED':
        return {
          icon: <FaTimesCircle className="w-3 h-3 mr-1" />,
          text: 'Ditolak',
          className: 'bg-red-100 text-red-800'
        };
      default:
        return {
          icon: null,
          text: status,
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-2 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

export default function WithdrawalsPage() {
  const [activeTab, setActiveTab] = useState<'available' | 'history'>('available');
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [totalAvailable, setTotalAvailable] = useState<string>('0');
  const [paymentRequests, setPaymentRequests] = useState<CommissionPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [bankInfo, setBankInfo] = useState<CommissionBankInfo>({
    bankName: '',
    accountNumber: '',
    accountName: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Calculate total selected amount
  const totalSelectedAmount = commissions
    .filter(commission => selectedCommissions.includes(commission.id))
    .reduce((sum, commission) => sum + parseFloat(commission.totalAmount), 0);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'available') {
        const response = await getAvailableCommissions();
        setCommissions(response.data.commissions);
        setTotalAvailable(response.data.totalAvailable);
      } else {
        const response = await getMyPaymentRequests();
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

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCommissions.length === 0) {
      toast.error('Pilih minimal satu komisi');
      return;
    }
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName) {
      toast.error('Lengkapi informasi bank');
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Konfirmasi Pencairan Komisi',
      html: `
        <div class="text-left">
          <p class="mb-4">Pastikan data berikut sudah sesuai:</p>
          <div class="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <p><span class="font-semibold">Total Pencairan:</span> ${formatCurrency(totalSelectedAmount)}</p>
            <p><span class="font-semibold">Bank:</span> ${bankInfo.bankName}</p>
            <p><span class="font-semibold">No. Rekening:</span> ${bankInfo.accountNumber}</p>
            <p><span class="font-semibold">Nama Pemilik:</span> ${bankInfo.accountName}</p>
          </div>
          <p class="mt-4 text-red-600 font-medium">Perhatian: Data pencairan tidak dapat diubah setelah diajukan!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Ya, Ajukan Pencairan',
      cancelButtonText: 'Cek Ulang',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        setSubmitting(true);
        await requestPayment({
          commissionIds: selectedCommissions,
          bankInfo,
        });
        
        await Swal.fire({
          title: 'Berhasil!',
          text: 'Permintaan pencairan komisi telah berhasil diajukan',
          icon: 'success',
          confirmButtonColor: '#10B981',
        });

        setShowRequestForm(false);
        setSelectedCommissions([]);
        setBankInfo({ bankName: '', accountNumber: '', accountName: '' });
        fetchData();
      } catch (error) {
        const apiError = error as ApiError;
        console.error('Error submitting payment request:', apiError);
        
        await Swal.fire({
          title: 'Gagal!',
          text: apiError?.message || 'Gagal mengajukan pencairan',
          icon: 'error',
          confirmButtonColor: '#10B981',
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Total Available */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Pencairan Komisi</h1>
            <div className="flex items-center justify-between mt-2">
              <p className="text-gray-600">
                Kelola dan ajukan pencairan komisi Anda
              </p>
              {activeTab === 'available' && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Komisi Tersedia:</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(parseFloat(totalAvailable))}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'available'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaMoneyCheck className="mr-2" />
              Komisi Tersedia
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center px-4 py-2 rounded-lg ${
                activeTab === 'history'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaHistory className="mr-2" />
              Riwayat Pencairan
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FaSpinner className="w-8 h-8 text-green-500 animate-spin" />
            </div>
          ) : activeTab === 'available' ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Komisi Tersedia</h2>
                  <p className="text-gray-600 mt-1">Pilih komisi yang ingin dicairkan</p>
                </div>
                {selectedCommissions.length > 0 && !showRequestForm && (
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Cairkan ({selectedCommissions.length})
                  </button>
                )}
              </div>

              {showRequestForm ? (
                <div className="p-8 max-w-2xl mx-auto">
                  <div className="flex items-center space-x-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <h3 className="text-xl font-semibold text-gray-900">Form Pencairan Komisi</h3>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Total Pencairan</p>
                        <p className="text-2xl font-bold text-green-700 mt-1">
                          {formatCurrency(totalSelectedAmount)}
                        </p>
                      </div>
                      <div className="bg-green-100 rounded-full p-3">
                        <FaMoneyCheck className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitRequest} className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Nama Bank
                        </label>
                        <input
                          type="text"
                          value={bankInfo.bankName}
                          onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 text-base"
                          placeholder="Contoh: BCA, Mandiri, BNI"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Nomor Rekening
                        </label>
                        <input
                          type="text"
                          value={bankInfo.accountNumber}
                          onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 text-base"
                          placeholder="Masukkan nomor rekening"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Nama Pemilik Rekening
                        </label>
                        <input
                          type="text"
                          value={bankInfo.accountName}
                          onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 text-base"
                          placeholder="Masukkan nama sesuai buku rekening"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 pt-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors duration-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Memproses...
                          </span>
                        ) : (
                          'Ajukan Pencairan'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRequestForm(false)}
                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          <input
                            type="checkbox"
                            checked={selectedCommissions.length === commissions.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCommissions(commissions.map(c => c.id));
                              } else {
                                setSelectedCommissions([]);
                              }
                            }}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Jamaah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Paket
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Jumlah Komisi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {commissions.map((commission) => (
                        <tr key={commission.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedCommissions.includes(commission.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCommissions([...selectedCommissions, commission.id]);
                                } else {
                                  setSelectedCommissions(selectedCommissions.filter(id => id !== commission.id));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {commission.Registration.User.fullname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {commission.Registration.User.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {commission.Registration.Package.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(commission.Registration.Package.departureDate).toLocaleDateString('id-ID')}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatCurrency(commission.totalAmount)}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={commission.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Riwayat Pencairan</h2>
                <p className="text-gray-600 mt-1">Daftar permintaan pencairan yang telah diajukan</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        ID Pencairan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Bank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tanggal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {request.id.slice(0, 8)}...
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(parseFloat(request.amount))}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {request.bankName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.accountNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 