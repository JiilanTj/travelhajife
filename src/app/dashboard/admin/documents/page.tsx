'use client';
import { useState, useEffect } from 'react';
import { DocumentType, DocumentStatus } from '@/types/document';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaTimes, FaCheckCircle, FaTimesCircle, FaEye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { getAllDocuments, verifyDocument, rejectDocument, DocumentWithUser } from '@/services/document';

interface FilterState {
  status?: DocumentStatus;
  type?: DocumentType;
  search: string;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: undefined,
    type: undefined
  });
  const [tempSearch, setTempSearch] = useState('');
  const ITEMS_PER_PAGE = 10;

  const documentTypes = [
    { id: 'KTP', label: 'KTP' },
    { id: 'PASSPORT', label: 'Paspor' },
    { id: 'KK', label: 'Kartu Keluarga' },
    { id: 'FOTO', label: 'Pas Foto' },
    { id: 'VAKSIN', label: 'Sertifikat Vaksin' },
    { id: 'BUKU_NIKAH', label: 'Buku Nikah' },
    { id: 'IJAZAH', label: 'Ijazah' }
  ];

  const statusOptions = [
    { id: 'PENDING', label: 'Menunggu Verifikasi' },
    { id: 'APPROVED', label: 'Terverifikasi' },
    { id: 'REJECTED', label: 'Ditolak' }
  ];

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, filters]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const response = await getAllDocuments({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: filters.search,
        status: filters.status,
        type: filters.type
      });
      
      setDocuments(response.data);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Gagal memuat dokumen');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: tempSearch }));
    setCurrentPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await verifyDocument(id);
      toast.success('Dokumen berhasil diverifikasi');
      fetchDocuments();
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Gagal memverifikasi dokumen');
    }
  };

  const handleReject = async (id: string) => {
    const { value: reason } = await Swal.fire({
      title: 'Alasan Penolakan',
      input: 'textarea',
      inputLabel: 'Berikan alasan penolakan dokumen',
      inputPlaceholder: 'Tulis alasan penolakan di sini...',
      inputAttributes: {
        'aria-label': 'Tulis alasan penolakan di sini'
      },
      showCancelButton: true,
      confirmButtonColor: '#22C55E',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Tolak Dokumen',
      cancelButtonText: 'Batal',
      preConfirm: (text) => {
        if (!text) {
          Swal.showValidationMessage('Alasan penolakan harus diisi')
        }
        return text
      }
    });

    if (reason) {
      try {
        await rejectDocument(id, reason);
        toast.success('Dokumen berhasil ditolak');
        fetchDocuments();
      } catch (error) {
        console.error('Error rejecting document:', error);
        toast.error('Gagal menolak dokumen');
      }
    }
  };

  const viewDocument = async (document: DocumentWithUser) => {
    Swal.fire({
      title: `${document.type} - ${document.User.fullname}`,
      html: `
        <div class="space-y-2 text-left mb-4">
          <p class="font-medium">Email: <span class="font-normal">${document.User.email}</span></p>
          ${document.number ? `<p class="font-medium">Nomor: <span class="font-normal">${document.number}</span></p>` : ''}
          ${document.expiryDate ? `<p class="font-medium">Kadaluarsa: <span class="font-normal">${new Date(document.expiryDate).toLocaleDateString('id-ID')}</span></p>` : ''}
          <p class="font-medium">Status: <span class="font-normal">${
            document.status === 'PENDING' ? 'Menunggu Verifikasi' : 
            document.status === 'APPROVED' ? 'Terverifikasi' : 
            'Ditolak'
          }</span></p>
          ${document.rejectionReason ? `<p class="font-medium">Alasan Penolakan: <span class="font-normal text-red-600">${document.rejectionReason}</span></p>` : ''}
        </div>
        ${document.file.url.toLowerCase().endsWith('.pdf') ? 
          `<div class="bg-gray-100 py-8 px-4 rounded flex justify-center items-center">
            <a href="${document.file.url}" target="_blank" class="text-blue-600 underline">Lihat PDF</a>
          </div>` : 
          `<img src="${document.file.url}" alt="Document" class="max-h-[400px] object-contain mx-auto border rounded-lg">`
        }
      `,
      width: 800,
      confirmButtonColor: '#22C55E',
      confirmButtonText: 'Tutup',
      showDenyButton: document.status === 'PENDING',
      showCancelButton: document.status === 'PENDING',
      denyButtonText: 'Tolak',
      denyButtonColor: '#EF4444',
      cancelButtonText: 'Verifikasi',
      cancelButtonColor: '#22C55E',
    }).then((result) => {
      if (result.isDenied) {
        handleReject(document.id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        handleVerify(document.id);
      }
    });
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: undefined,
      type: undefined
    });
    setTempSearch('');
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="w-3 h-3 mr-1" />
            Terverifikasi
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaTimesCircle className="w-3 h-3 mr-1" />
            Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <div className="w-3 h-3 mr-1 animate-pulse rounded-full bg-yellow-400" />
            Menunggu
          </span>
        );
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const docType = documentTypes.find(d => d.id === type);
    return docType ? docType.label : type;
  };

  const FilterModal = () => {
    if (!isFilterOpen) return null;

    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Filter Dokumen</h3>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value ? e.target.value as DocumentStatus : undefined 
                }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Semua Status</option>
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Tipe Dokumen</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  type: e.target.value ? e.target.value as DocumentType : undefined 
                }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Semua Tipe</option>
                {documentTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Terapkan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-6">
          {/* Header dengan gradient */}
          <div className="relative mb-8 p-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
            <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
            <div className="relative">
              <h1 className="text-2xl font-semibold text-white mb-2">Manajemen Dokumen</h1>
              <p className="text-green-50">Verifikasi dan kelola dokumen jamaah</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama jamaah atau email..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 bg-white text-gray-900 placeholder-gray-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <button
                onClick={handleSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
              >
                Cari
              </button>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-6 py-3 shadow-sm rounded-xl flex items-center gap-2 transition-colors ${
                  filters.status || filters.type
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter className={filters.status || filters.type ? 'text-white' : 'text-gray-500'} />
                Filter
                {(filters.status || filters.type) && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>
              
              <FilterModal />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jamaah
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe Dokumen
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nomor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload/Update
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          Tidak ada dokumen yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {doc.User.fullname}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {doc.User.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">
                              {getDocumentTypeLabel(doc.type)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.number || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(doc.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(doc.updatedAt).toLocaleString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewDocument(doc)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                              >
                                <FaEye className="w-4 h-4" />
                              </button>
                              
                              {doc.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleVerify(doc.id)}
                                    className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                                  >
                                    <FaCheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReject(doc.id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                                  >
                                    <FaTimesCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t px-6 py-4">
                <p className="text-sm text-gray-500">
                  Menampilkan {documents.length} dari {totalItems} dokumen
                  {/* Optional: tampilkan range */}
                  <span className="ml-1">
                    (Item {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)})
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => {
                    // Tampilkan hanya 5 halaman sekitar halaman aktif
                    if (
                      i + 1 === 1 ||
                      i + 1 === totalPages ||
                      (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`min-w-[40px] h-10 rounded-lg ${
                            currentPage === i + 1
                              ? 'bg-green-600 text-white font-medium shadow-sm'
                              : 'text-gray-600 hover:bg-gray-100'
                          } transition-colors`}
                        >
                          {i + 1}
                        </button>
                      );
                    } else if (
                      i + 1 === currentPage - 3 ||
                      i + 1 === currentPage + 3
                    ) {
                      return <span key={i} className="px-1">...</span>;
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FaChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 