'use client';
import { useEffect, useState } from 'react';
import { Package } from '@/types/package';
import { getPackages } from '@/services/package';
import PackageCard from '@/components/packages/PackageCard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';
import PackageModal from '@/components/packages/PackageModal';
import { createPackage, updatePackage, deletePackage } from '@/services/package';
import Swal from 'sweetalert2';
import { toast } from 'react-hot-toast';

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12; // 3 rows x 4 columns = 12 items per page
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | undefined>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const defaultFilters = {
    type: '',
    minPrice: '',
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
    startDate: '',
    endDate: '',
  };
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  useEffect(() => {
    fetchPackages();
  }, [currentPage, search, activeFilters]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search || undefined,
        type: activeFilters.type || undefined,
        minPrice: activeFilters.minPrice || undefined,
        maxPrice: activeFilters.maxPrice || undefined,
        minDuration: activeFilters.minDuration || undefined,
        maxDuration: activeFilters.maxDuration || undefined,
        startDate: activeFilters.startDate || undefined,
        endDate: activeFilters.endDate || undefined,
        isActive: true
      };

      const response = await getPackages(queryParams);
      
      setPackages(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      toast.error('Gagal memuat data paket');
      if (error instanceof Error) {
        console.error('Error fetching packages:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: FormData) => {
    try {
      await createPackage(formData);
      setIsModalOpen(false);
      fetchPackages();
      toast.success('Paket berhasil dibuat');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error creating package:', error.message);
        toast.error('Gagal membuat paket');
      }
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!selectedPackage) return;
    try {
      await updatePackage(selectedPackage.id, formData);
      setIsModalOpen(false);
      setSelectedPackage(undefined);
      fetchPackages();
      toast.success('Paket berhasil diperbarui');
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating package:', error.message);
        toast.error('Gagal memperbarui paket');
      }
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Paket yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#22C55E',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      background: '#FFFFFF',
      customClass: {
        title: 'text-gray-800 text-xl font-semibold',
        htmlContainer: 'text-gray-600',
        actions: 'gap-2',
        confirmButton: 'rounded-lg px-4 py-2 font-medium',
        cancelButton: 'rounded-lg px-4 py-2 font-medium'
      }
    });

    if (result.isConfirmed) {
      try {
        await deletePackage(id);
        Swal.fire({
          title: 'Terhapus!',
          text: 'Paket berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#22C55E',
          customClass: {
            confirmButton: 'rounded-lg px-4 py-2 font-medium'
          }
        });
        fetchPackages();
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error deleting package:', error.message);
          Swal.fire({
            title: 'Error!',
            text: `Gagal menghapus paket: ${error.message}`,
            icon: 'error',
            confirmButtonColor: '#22C55E',
            customClass: {
              confirmButton: 'rounded-lg px-4 py-2 font-medium'
            }
          });
        } else {
          Swal.fire({
            title: 'Error!',
            text: 'Gagal menghapus paket.',
            icon: 'error',
            confirmButtonColor: '#22C55E',
            customClass: {
              confirmButton: 'rounded-lg px-4 py-2 font-medium'
            }
          });
        }
      }
    }
  };

  const handleResetFilters = () => {
    setActiveFilters(defaultFilters);
    setIsFilterOpen(false);
  };

  const FilterModal = ({ 
    isOpen, 
    onClose, 
    initialFilters, 
    onApply, 
    onReset 
  }: {
    isOpen: boolean;
    onClose: () => void;
    initialFilters: typeof defaultFilters;
    onApply: (filters: typeof defaultFilters) => void;
    onReset: () => void;
  }) => {
    const [localFilters, setLocalFilters] = useState(initialFilters);

    // Reset local filters when modal opens with new initial filters
    useEffect(() => {
      setLocalFilters(initialFilters);
    }, [initialFilters]);

    if (!isOpen) return null;

    const handleApply = () => {
      onApply(localFilters);
      onClose();
    };

    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Filter Paket</h3>
            <button 
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Tipe Paket</label>
              <select
                value={localFilters.type}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Semua Tipe</option>
                <option value="UMROH">Umroh</option>
                <option value="HAJI">Haji</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Rentang Harga</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-600"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Durasi (Hari)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minDuration}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, minDuration: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-600"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxDuration}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, maxDuration: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 placeholder-gray-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Tanggal Keberangkatan</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={localFilters.startDate}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
                <input
                  type="date"
                  value={localFilters.endDate}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onReset}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
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
              <h1 className="text-2xl font-semibold text-white mb-2">Manajemen Paket</h1>
              <p className="text-green-50">Kelola semua paket umrah dan haji Anda di sini</p>
            </div>
          </div>

          {/* Search and Filter dengan styling baru */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cari paket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-0 rounded-xl shadow-sm focus:ring-2 focus:ring-green-500 bg-white text-gray-900 placeholder-gray-500"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`px-6 py-3 shadow-sm rounded-xl flex items-center gap-2 transition-colors ${
                  Object.values(activeFilters).some(value => value !== '')
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter className={Object.values(activeFilters).some(value => value !== '') ? 'text-white' : 'text-gray-500'} />
                Filter
                {Object.values(activeFilters).some(value => value !== '') && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>
              
              <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                initialFilters={activeFilters}
                onApply={setActiveFilters}
                onReset={handleResetFilters}
              />
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm"
            >
              Tambah Paket
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Grid packages */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {packages.map((pkg) => (
                  <PackageCard 
                    key={pkg.id} 
                    package={pkg}
                    onDelete={handleDelete}
                    onEdit={(pkg) => {
                      setSelectedPackage(pkg);
                      setIsModalOpen(true);
                    }}
                  />
                ))}
              </div>

              {/* Updated pagination with item count */}
              <div className="flex items-center justify-between border-t pt-6">
                <p className="text-sm text-gray-500">
                  Menampilkan {packages.length} dari {totalItems} paket
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

      <PackageModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPackage(undefined);
        }}
        onSubmit={selectedPackage ? handleUpdate : handleCreate}
        initialData={selectedPackage}
        title={selectedPackage ? 'Edit Paket' : 'Tambah Paket Baru'}
      />
    </DashboardLayout>
  );
} 