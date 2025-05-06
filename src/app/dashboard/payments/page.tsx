'use client';
import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Registration } from '@/types/registration';
import { getMyRegistrations } from '@/services/registration';
import { createPayment } from '@/services/payment';
import { CreatePaymentRequest } from '@/types/payment';
import { toast } from 'react-hot-toast';
import { 
  FaFileInvoiceDollar, 
  FaCreditCard, 
  FaMoneyBillWave, 
  FaCalendarAlt, 
  FaExclamationTriangle, 
  FaChevronDown, 
  FaChevronUp, 
  FaSpinner,
  FaUpload
} from 'react-icons/fa';

declare global {
  interface Window {
    snap: {
      pay: (token: string, options: {
        onSuccess: () => void;
        onPending: () => void;
        onError: () => void;
        onClose: () => void;
      }) => void;
    };
  }
}

const BASE_URL = "https://api.grasindotravel.id/";

interface PaymentInfo {
  registration: {
    id: string;
    package: {
      name: string;
      price: number;
      dp: number;
    };
    user: {
      fullname: string;
      email: string;
      phone: string;
    };
  };
  paymentStatus: {
    totalPaid: number;
    remainingAmount: number;
    isFullyPaid: boolean;
    isDpPaid: boolean;
  };
  payments: Array<{
    id: string;
    type: 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
    amount: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
    paymentDate: string | null;
    paymentMethod: string | null;
    midtransRedirectUrl: string | null;
    midtransPaymentCode: string | null;
    midtransPaymentType: string | null;
    midtransTransactionStatus: string | null;
  }>;
  nextPayment: {
    type: 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
    amount: number;
    dueAmount: number;
    dueDate: string;
  } | null;
}

interface PaymentListItem {
  id: string;
  type: 'DP' | 'INSTALLMENT' | 'FULL_PAYMENT';
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED';
  paymentDate: string | null;
  paymentMethod: string | null;
  midtransRedirectUrl: string | null;
  midtransPaymentCode: string | null;
  midtransPaymentType: string | null;
  midtransTransactionStatus: string | null;
}

// Get payment information for a registration
const getPaymentInfo = async (registrationId: string): Promise<PaymentInfo> => {
  try {
    const response = await fetch(`${BASE_URL}/payments/info/${registrationId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch payment information');
    }

    return data.data;
  } catch (error) {
    console.error('Payment service error:', error);
    throw error;
  }
};

export default function PaymentsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRegistration, setExpandedRegistration] = useState<string | null>(null);
  const [selectedRegistration, setSelectedRegistration] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loadingPaymentInfo, setLoadingPaymentInfo] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  
  // Form states
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [notes, setNotes] = useState('');
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    if (selectedRegistration) {
      fetchPaymentInfo(selectedRegistration);
    }
  }, [selectedRegistration]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await getMyRegistrations();
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentInfo = async (registrationId: string) => {
    setLoadingPaymentInfo(true);
    try {
      const data = await getPaymentInfo(registrationId);
      setPaymentInfo(data);
      // Update payments state with the payment history
      setPayments(data.payments);
    } catch (error) {
      console.error('Error fetching payment info:', error);
      toast.error('Gagal memuat informasi pembayaran');
    } finally {
      setLoadingPaymentInfo(false);
    }
  };

  const toggleExpand = (registrationId: string) => {
    if (expandedRegistration === registrationId) {
      setExpandedRegistration(null);
    } else {
      setExpandedRegistration(registrationId);
      setSelectedRegistration(registrationId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau PDF');
        return;
      }
      
      setTransferProof(file);
    }
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentInfo?.nextPayment || !selectedRegistration || !transferProof) {
      toast.error('Mohon lengkapi semua data pembayaran');
      return;
    }

    setProcessingPayment(true);
    try {
      const paymentData: CreatePaymentRequest = {
        registrationId: selectedRegistration,
        amount: paymentInfo.nextPayment.amount,
        type: paymentInfo.nextPayment.type,
        bankName,
        accountNumber,
        accountName,
        transferDate,
        notes,
        transferProof
      };

      await createPayment(paymentData);
      toast.success('Pembayaran berhasil dibuat. Menunggu verifikasi admin.', {
        duration: 5000, // 5 seconds
      });
      
      // Reset form
      setBankName('');
      setAccountNumber('');
      setAccountName('');
      setTransferDate('');
      setNotes('');
      setTransferProof(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh payment info
      fetchPaymentInfo(selectedRegistration);
      fetchRegistrations();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Gagal membuat pembayaran', {
        duration: 5000, // 5 seconds for error message too
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            Draft
          </span>
        );
      case 'WAITING_PAYMENT':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Menunggu Pembayaran
          </span>
        );
      case 'DOCUMENT_REVIEW':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Review Dokumen
          </span>
        );
      case 'DOCUMENT_REJECTED':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Dokumen Ditolak
          </span>
        );
      case 'APPROVED':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Disetujui
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Dibatalkan
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Selesai
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Menunggu
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
            Gagal
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
      case 'VERIFYING':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Verifikasi
          </span>
        );
      case 'VERIFIED':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Terverifikasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Ditolak
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

  const formatCurrency = (price: string | number) => {
    // Handle undefined or null
    if (price === undefined || price === null) {
      console.warn('Received undefined or null price value');
      return 'Rp0';
    }

    let numPrice: number;
    
    if (typeof price === 'string') {
      // Remove any non-numeric characters except decimal point
      const cleanPrice = price.replace(/[^0-9.]/g, '');
      numPrice = parseFloat(cleanPrice);
    } else {
      numPrice = price;
    }

    // Handle NaN case
    if (isNaN(numPrice)) {
      console.warn('Invalid price value:', price);
      return 'Rp0';
    }

    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const getPaymentMethodIcon = (method: string | null) => {
    if (!method) return null;
    
    switch (method.toLowerCase()) {
      case 'bank_transfer':
        return <FaCreditCard className="w-3 h-3 mr-1" />;
      case 'credit_card':
        return <FaCreditCard className="w-3 h-3 mr-1" />;
      case 'gopay':
        return <FaMoneyBillWave className="w-3 h-3 mr-1" />;
      default:
        return <FaMoneyBillWave className="w-3 h-3 mr-1" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container px-4 mt-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pembayaran</h1>
          <p className="text-gray-600">Kelola pembayaran untuk perjalanan umrah atau haji Anda</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {registrations.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                <div className="flex justify-center mb-4">
                  <FaFileInvoiceDollar className="text-gray-300 text-6xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Pembayaran</h3>
                <p className="text-gray-500 mb-6">
                  Anda belum memiliki paket yang terdaftar. Silahkan pilih paket umrah atau haji terlebih dahulu.
                </p>
                <a
                  href="/dashboard/my-package"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center"
                >
                  <span>Lihat Paket Tersedia</span>
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {registrations.map((registration) => (
                  <div key={registration.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Header section */}
                    <div
                      className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleExpand(registration.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                          <FaFileInvoiceDollar className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{registration.Package.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <FaCalendarAlt className="w-3 h-3 mr-1" />
                            <span>Keberangkatan: {new Date(registration.Package.departureDate).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusBadge(registration.status)}
                        {expandedRegistration === registration.id ? (
                          <FaChevronUp className="text-gray-400" />
                        ) : (
                          <FaChevronDown className="text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded content */}
                    {expandedRegistration === registration.id && (
                      <div className="p-4 bg-gray-50">
                        {loadingPaymentInfo ? (
                          <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                          </div>
                        ) : paymentInfo ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left column - Payment details */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Detail Pembayaran</h4>
                              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                {/* Package price info */}
                                <div className="p-4 border-b border-gray-100">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Harga Paket</span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(paymentInfo.registration.package.price)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Down Payment (DP)</span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(paymentInfo.nextPayment?.amount || 0)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Total Sudah Dibayar</span>
                                    <span className="font-medium text-green-600">
                                      {formatCurrency(paymentInfo.paymentStatus.totalPaid)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Sisa Pembayaran</span>
                                    <span className="font-medium text-gray-900">
                                      {formatCurrency(paymentInfo.paymentStatus.remainingAmount)}
                                    </span>
                                  </div>
                                </div>

                                {/* Payment status */}
                                <div className="p-4">
                                  <div className="flex justify-between items-center mb-3">
                                    <span className="text-gray-600">Status Pembayaran</span>
                                    {!paymentInfo.paymentStatus.isDpPaid ? (
                                      <span className="text-yellow-600 font-medium flex items-center">
                                        <FaExclamationTriangle className="w-3 h-3 mr-1" />
                                        Menunggu Pembayaran DP
                                      </span>
                                    ) : !paymentInfo.paymentStatus.isFullyPaid ? (
                                      <span className="text-blue-600 font-medium">DP Lunas</span>
                                    ) : (
                                      <span className="text-green-600 font-medium">Lunas</span>
                                    )}
                                  </div>

                                  {/* Next payment section */}
                                  {paymentInfo.nextPayment && (
                                    <div className="pt-3 pb-1 border-t border-gray-100">
                                      <h5 className="font-medium text-gray-900 mb-2">Pembayaran Berikutnya</h5>
                                      <div className="p-3 bg-yellow-50 rounded-lg mb-3">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-gray-600 text-sm">Jenis Pembayaran</span>
                                          <span className="font-medium text-gray-800 text-sm">
                                            {paymentInfo.nextPayment.type === 'DP' ? 'Down Payment' : 
                                             paymentInfo.nextPayment.type === 'INSTALLMENT' ? 'Cicilan' : 'Pelunasan'}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-gray-600 text-sm">Jumlah</span>
                                          <span className="font-medium text-gray-800 text-sm">
                                            {formatCurrency(paymentInfo.nextPayment.amount)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-gray-600 text-sm">Jatuh Tempo</span>
                                          <span className="font-medium text-gray-800 text-sm">
                                            {new Date(paymentInfo.nextPayment.dueDate).toLocaleDateString('id-ID')}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Payment Form */}
                                      <form onSubmit={handleInitiatePayment} className="space-y-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Bank
                                          </label>
                                          <input
                                            type="text"
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-700"
                                            required
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nomor Rekening
                                          </label>
                                          <input
                                            type="text"
                                            value={accountNumber}
                                            onChange={(e) => setAccountNumber(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-700"
                                            required
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Pemilik Rekening
                                          </label>
                                          <input
                                            type="text"
                                            value={accountName}
                                            onChange={(e) => setAccountName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-700"
                                            required
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tanggal Transfer
                                          </label>
                                          <input
                                            type="date"
                                            value={transferDate}
                                            onChange={(e) => setTransferDate(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-700"
                                            required
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Catatan (Opsional)
                                          </label>
                                          <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-gray-700"
                                            rows={2}
                                          />
                                        </div>
                                        
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bukti Transfer
                                  </label>
                                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                                      <div className="flex text-sm text-gray-600">
                                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                                          <span>Upload file</span>
                                          <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="sr-only"
                                            onChange={handleFileChange}
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            required
                                          />
                                        </label>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        PNG, JPG, atau PDF maksimal 5MB
                                      </p>
                                      {transferProof && (
                                        <p className="text-sm text-green-600">
                                          File terpilih: {transferProof.name}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  type="submit"
                                  disabled={processingPayment}
                                  className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                  {processingPayment ? (
                                    <>
                                      <FaSpinner className="animate-spin mr-2" />
                                      Memproses...
                                    </>
                                  ) : (
                                    <>
                                      <FaMoneyBillWave className="mr-2" />
                                      Kirim Bukti Pembayaran
                                    </>
                                  )}
                                </button>
                              </form>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right column - Payment history */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-3">Riwayat Pembayaran</h4>
                              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                                {payments.length === 0 ? (
                                  <div className="text-center py-6">
                                    <p className="text-gray-500">Belum ada riwayat pembayaran</p>
                                  </div>
                                ) : (
                                  <div className="space-y-3">
                                    {payments.map((payment) => (
                                      <div key={payment.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                        <div className="flex justify-between items-center mb-1">
                                          <div className="flex items-center">
                                            <span className="text-sm text-gray-600">
                                              {payment.type === 'DP' ? 'Down Payment' : 
                                               payment.type === 'INSTALLMENT' ? 'Cicilan' : 'Pelunasan'}
                                            </span>
                                          </div>
                                          {getPaymentStatusBadge(payment.status)}
                                        </div>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs text-gray-500">
                                            {payment.paymentDate 
                                              ? new Date(payment.paymentDate).toLocaleDateString('id-ID', {
                                                  day: 'numeric',
                                                  month: 'long',
                                                  year: 'numeric'
                                                }) 
                                              : 'Belum dibayar'}
                                          </span>
                                          <span className="text-sm font-medium text-gray-800">
                                            {formatCurrency(payment.amount)}
                                          </span>
                                        </div>
                                        {payment.paymentMethod && (
                                          <div className="flex items-center text-xs text-gray-500">
                                            {getPaymentMethodIcon(payment.paymentMethod)}
                                            <span>{payment.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">Gagal memuat informasi pembayaran</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 