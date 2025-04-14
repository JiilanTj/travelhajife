'use client';
import { useEffect, useState, useCallback, Fragment } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AdminPaymentListItem, PaymentStatus, PaymentType } from '@/types/payment';
import { getAllPayments, verifyPayment } from '@/services/admin/payment';
import { toast } from 'react-hot-toast';
import { 
  FaFileInvoiceDollar, 
  FaSearch, 
  FaSpinner,
  FaEye,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { Dialog, Transition } from '@headlessui/react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<AdminPaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<PaymentStatus | ''>('');
  const [selectedType, setSelectedType] = useState<PaymentType | ''>('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentListItem | null>(null);

  const ITEMS_PER_PAGE = 10;

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllPayments({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search || undefined,
        status: selectedStatus || undefined,
        type: selectedType || undefined
      });
      
      console.log('Full API Response:', response);
      console.log('First payment item:', response.data[0]);
      
      // Type checking and data validation
      const validatedPayments = response.data.map(payment => {
        if (!payment.registration?.user?.fullname) {
          console.error('Missing registration.user.fullname for payment:', payment);
        }
        if (!payment.registration?.package?.name) {
          console.error('Missing registration.package.name for payment:', payment);
        }
        return payment;
      });
      
      setPayments(validatedPayments);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, selectedStatus, selectedType]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments();
  };

  const handleVerifyPayment = async (paymentId: string, isApproved: boolean) => {
    setProcessingId(paymentId);
    try {
      await verifyPayment(paymentId, {
        status: isApproved ? 'PAID' : 'FAILED',
        verificationNotes: verificationNotes
      });
      
      toast.success(`Pembayaran berhasil ${isApproved ? 'disetujui' : 'ditolak'}`);
      setShowVerificationModal(false);
      setVerificationNotes('');
      fetchPayments();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Gagal memverifikasi pembayaran');
    } finally {
      setProcessingId(null);
    }
  };

  const openVerificationModal = (payment: AdminPaymentListItem) => {
    setSelectedPayment(payment);
    setShowVerificationModal(true);
  };

  const formatCurrency = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFYING':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Menunggu Verifikasi
          </span>
        );
      case 'PAID':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Dibayar
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Ditolak
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Dibatalkan
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Kedaluwarsa
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="container px-4 mt-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pembayaran</h1>
          <p className="text-gray-600">Kelola dan verifikasi pembayaran dari jamaah</p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama jamaah atau email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Cari
            </button>
          </form>

          <div className="flex gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            >
              <option value="">Semua Status</option>
              <option value="VERIFYING">Menunggu Verifikasi</option>
              <option value="PAID">Dibayar</option>
              <option value="FAILED">Ditolak</option>
              <option value="CANCELLED">Dibatalkan</option>
              <option value="EXPIRED">Kedaluwarsa</option>
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as PaymentType | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
            >
              <option value="">Semua Tipe</option>
              <option value="DP">Down Payment</option>
              <option value="INSTALLMENT">Cicilan</option>
              <option value="FULL_PAYMENT">Pelunasan</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <FaFileInvoiceDollar className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500 text-lg">Tidak ada data pembayaran</p>
              </div>
            ) : (
              <>
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
                          Pembayaran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.registration.user.fullname}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.registration.user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.registration.package.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(payment.registration.package.price)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.type === 'DP' ? 'Down Payment' : 
                               payment.type === 'INSTALLMENT' ? 'Cicilan' : 'Pelunasan'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{payment.bankName}</div>
                            <div className="text-sm text-gray-500">
                              {payment.accountNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(payment.transferDate).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {payment.status === 'VERIFYING' ? (
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => openVerificationModal(payment)}
                                  className="text-green-600 hover:text-green-900"
                                  disabled={!!processingId}
                                >
                                  <FaEye className="w-5 h-5" />
                                </button>
                              </div>
                            ) : (
                              <a
                                href={payment.transferProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Lihat Bukti
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan {payments.length} dari {totalItems} pembayaran
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      <Transition.Root show={showVerificationModal} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50"
          onClose={() => setShowVerificationModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  {selectedPayment && (
                    <>
                      <Dialog.Title 
                        as="h3" 
                        className="text-lg font-medium leading-6 text-gray-900 mb-4"
                      >
                        Verifikasi Pembayaran
                      </Dialog.Title>
                      
                      <div className="space-y-6">
                        {/* Payment Details */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Jamaah</label>
                              <p className="mt-1 text-base text-gray-900">
                                {selectedPayment.registration.user.fullname}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <p className="mt-1 text-base text-gray-900">
                                {selectedPayment.registration.user.email}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Jumlah</label>
                              <p className="mt-1 text-base font-medium text-gray-900">
                                {formatCurrency(selectedPayment.amount)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Jenis Pembayaran</label>
                              <p className="mt-1 text-base text-gray-900">
                                {selectedPayment.type === 'DP' ? 'Down Payment' : 
                                 selectedPayment.type === 'INSTALLMENT' ? 'Cicilan' : 'Pelunasan'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Bank</label>
                              <p className="mt-1 text-base text-gray-900">
                                {selectedPayment.bankName}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">No. Rekening</label>
                              <p className="mt-1 text-base text-gray-900">
                                {selectedPayment.accountNumber}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Transfer Proof */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bukti Transfer
                          </label>
                          <div className="mt-1 flex flex-col items-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                            <img
                              src={selectedPayment.transferProof}
                              alt="Bukti Transfer"
                              className="max-h-64 object-contain rounded-lg shadow-sm"
                            />
                            <a
                              href={selectedPayment.transferProof}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <FaEye className="w-4 h-4 mr-2" />
                              Lihat Gambar Asli
                            </a>
                          </div>
                        </div>

                        {/* Verification Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catatan Verifikasi
                          </label>
                          <textarea
                            value={verificationNotes}
                            onChange={(e) => setVerificationNotes(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-700 shadow-sm"
                            rows={3}
                            placeholder="Tambahkan catatan verifikasi (opsional)"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowVerificationModal(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(selectedPayment.id, false)}
                          disabled={!!processingId}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === selectedPayment.id ? (
                            <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                          ) : (
                            <FaTimes className="w-4 h-4 mr-2" />
                          )}
                          Tolak
                        </button>
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(selectedPayment.id, true)}
                          disabled={!!processingId}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === selectedPayment.id ? (
                            <FaSpinner className="animate-spin w-4 h-4 mr-2" />
                          ) : (
                            <FaCheck className="w-4 h-4 mr-2" />
                          )}
                          Setujui
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </DashboardLayout>
  );
} 