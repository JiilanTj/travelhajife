'use client';
import { useEffect, useState } from 'react';
import { Package, PackageType } from '@/types/package';
import { getPackages } from '@/services/package';
import CustomerPackageCard from '@/components/packages/CustomerPackageCard';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaTimes, FaCalendarCheck } from 'react-icons/fa';
import ViewPackageModal from '@/components/packages/ViewPackageModal';
import RegisterPackageModal from '@/components/packages/RegisterPackageModal';
import { toast } from 'react-hot-toast';
import { startRegistration, getMyRegistrations } from '@/services/registration';
import { Registration } from '@/types/registration';

export default function MyPackagePage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'available' | 'booked'>('available');
  
  // Available packages state
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 12;
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Booked packages state
  const [bookedPackages, setBookedPackages] = useState<Registration[]>([]);
  const [loadingBooked, setLoadingBooked] = useState(false);
  
  const defaultFilters = {
    type: '',
    minPrice: '',
    maxPrice: '',
    startDate: '',
    endDate: '',
  };
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  useEffect(() => {
    if (activeTab === 'available') {
      fetchPackages();
    } else {
      fetchBookedPackages();
    }
  }, [currentPage, search, activeFilters, activeTab]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search,
        type: activeFilters.type,
        minPrice: activeFilters.minPrice,
        maxPrice: activeFilters.maxPrice,
        startDate: activeFilters.startDate,
        endDate: activeFilters.endDate,
      };

      const response = await getPackages(params);
      setPackages(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Gagal memuat data paket');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBookedPackages = async () => {
    setLoadingBooked(true);
    try {
      const response = await getMyRegistrations();
      setBookedPackages(response.data);
    } catch (error) {
      console.error('Error fetching booked packages:', error);
      toast.error('Gagal memuat data paket yang sudah dipesan');
    } finally {
      setLoadingBooked(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (activeTab === 'available') {
      fetchPackages();
    } else {
      fetchBookedPackages();
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActiveFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchPackages();
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setActiveFilters(defaultFilters);
    setCurrentPage(1);
    fetchPackages();
    setIsFilterOpen(false);
  };

  const handleViewDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsViewModalOpen(true);
  };

  const handleRegister = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsRegisterModalOpen(true);
  };

  const handleRegistrationSubmit = async (
    packageId: string,
    roomType: string,
    roomPreferences: Record<string, string | null>,
    specialRequests: string
  ): Promise<void> => {
    try {
      const registrationData = {
        packageId,
        roomType,
        roomPreferences,
        specialRequests: specialRequests || null
      };

      await startRegistration(registrationData);
      toast.success('Pendaftaran berhasil! Harap segera lengkapi dokumen dan lakukan pembayaran');
      
      // Refresh booked packages if on that tab
      if (activeTab === 'booked') {
        fetchBookedPackages();
      }
    } catch (error) {
      console.error('Error registering for package:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal mendaftar paket. Silakan coba lagi';
      toast.error(errorMessage);
      throw error;
    }
  };

  const renderBookedPackages = () => {
    if (loadingBooked) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      );
    }

    if (bookedPackages.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Anda belum memesan paket apapun</p>
          <p className="text-gray-400 mt-2">Silakan pilih paket yang tersedia untuk memulai perjalanan Anda</p>
          <button 
            onClick={() => setActiveTab('available')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Lihat Paket Tersedia
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {bookedPackages.map((registration) => (
          <div key={registration.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-4">
            <div className="flex items-center mb-3">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                <FaCalendarCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{registration.Package.name}</h3>
                <p className="text-sm text-gray-600">ID: {registration.id.substring(0, 8)}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  registration.status === 'DRAFT' || registration.status === 'WAITING_PAYMENT' ? 'bg-yellow-100 text-yellow-800' :
                  registration.status === 'DOCUMENT_REVIEW' ? 'bg-blue-100 text-blue-800' :
                  registration.status === 'DOCUMENT_REJECTED' ? 'bg-red-100 text-red-800' :
                  registration.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  registration.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  registration.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {registration.status === 'DRAFT' || registration.status === 'WAITING_PAYMENT' ? 'Menunggu Pembayaran' :
                   registration.status === 'DOCUMENT_REVIEW' ? 'Review Dokumen' :
                   registration.status === 'DOCUMENT_REJECTED' ? 'Dokumen Ditolak' :
                   registration.status === 'APPROVED' ? 'Disetujui' :
                   registration.status === 'CANCELLED' ? 'Dibatalkan' :
                   registration.status === 'COMPLETED' ? 'Selesai' :
                   registration.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tanggal Daftar</span>
                <span className="text-gray-800">{new Date(registration.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Keberangkatan</span>
                <span className="text-gray-800">{new Date(registration.Package.departureDate).toLocaleDateString('id-ID')}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tipe Kamar</span>
                <span className="text-gray-800">{registration.roomType}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 flex space-x-2">
              <button
                onClick={() => handleViewDetails({
                  id: registration.packageId,
                  name: registration.Package.name,
                  type: registration.Package.type as PackageType,
                  departureDate: registration.Package.departureDate,
                  price: registration.Package.price,
                  dp: registration.Package.dp,
                  remainingQuota: 0, // Default since we don't have this info
                  quota: 0, // Default since we don't have this info
                  duration: 0, // Default since we don't have this info
                  description: '', // Default since we don't have this info
                  facilities: [],
                  image: { path: '', url: '' },
                  additionalImages: [],
                  isActive: true,
                  createdAt: '',
                  updatedAt: ''
                })}
                className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm"
              >
                Detail Paket
              </button>
              <button
                // onClick={() => handleViewBookingDetails(registration.id)}
                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
              >
                Kelola Booking
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="container px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Paket Perjalanan</h1>
          <p className="text-gray-600">Kelola dan cari paket umroh atau haji untuk perjalanan Anda</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === 'available'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Paket Tersedia
          </button>
          <button
            onClick={() => setActiveTab('booked')}
            className={`py-3 px-6 text-sm font-medium ${
              activeTab === 'booked'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Paket Saya
          </button>
        </div>

        {activeTab === 'available' && (
          <>
            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari paket..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-700"
                  >
                    Cari
                  </button>
                </div>
              </form>
              
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <FaFilter className="mr-2" />
                Filter
              </button>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Filter Paket</h3>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe Paket
                    </label>
                    <select
                      name="type"
                      value={activeFilters.type}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Semua Tipe</option>
                      <option value="UMROH">Umroh</option>
                      <option value="HAJI">Haji</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Minimum (Rp)
                    </label>
                    <input
                      type="number"
                      name="minPrice"
                      value={activeFilters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Harga minimum"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Harga Maksimum (Rp)
                    </label>
                    <input
                      type="number"
                      name="maxPrice"
                      value={activeFilters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Harga maksimum"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Mulai
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={activeFilters.startDate}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={activeFilters.endDate}
                      onChange={handleFilterChange}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Terapkan Filter
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                {packages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">Tidak ada paket yang tersedia saat ini</p>
                    <p className="text-gray-400 mt-2">Silakan coba cari dengan kata kunci lain atau ubah filter</p>
                  </div>
                ) : (
                  <>
                    {/* Grid packages */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {packages.map((pkg) => (
                        <CustomerPackageCard 
                          key={pkg.id} 
                          package={pkg}
                          onViewDetails={handleViewDetails}
                          onRegister={handleRegister}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6">
                      <p className="text-sm text-gray-600">
                        Menampilkan {packages.length} dari {totalItems} paket
                      </p>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:text-gray-400 disabled:bg-gray-100"
                        >
                          <FaChevronLeft className="w-4 h-4" />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                              currentPage === page
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg border border-gray-300 text-gray-600 disabled:text-gray-400 disabled:bg-gray-100"
                        >
                          <FaChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'booked' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            {renderBookedPackages()}
          </div>
        )}
        
        {/* View Package Modal */}
        {selectedPackage && (
          <>
            <ViewPackageModal
              isOpen={isViewModalOpen}
              onClose={() => setIsViewModalOpen(false)}
              package={selectedPackage}
            />
            
            <RegisterPackageModal
              isOpen={isRegisterModalOpen}
              onClose={() => setIsRegisterModalOpen(false)}
              package={selectedPackage}
              onRegister={handleRegistrationSubmit}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 