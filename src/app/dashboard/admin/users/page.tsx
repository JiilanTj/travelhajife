'use client';
import { useState, useEffect } from 'react';
import { User, UserRole } from '@/types/user';
import { getUsers, getUserById, updateUser } from '@/services/user';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FaSearch, FaFilter, FaChevronLeft, FaChevronRight, FaTimes, FaEye, FaEdit, FaCheck, FaBan, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import UserDetailModal from '@/components/users/UserDetailModal';
import UserFormModal from '@/components/users/UserFormModal';

interface FilterState {
  role?: UserRole;
  isActive?: boolean;
  search: string;
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: undefined,
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  const [tempSearch, setTempSearch] = useState('');
  const ITEMS_PER_PAGE = 10;

  // Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const roleOptions = [
    { id: 'SUPERADMIN', label: 'Super Admin' },
    { id: 'ADMIN', label: 'Admin' },
    { id: 'AGEN', label: 'Agen' },
    { id: 'MARKETING', label: 'Marketing' },
    { id: 'JAMAAH', label: 'Jamaah' }
  ];

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await getUsers({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: filters.search,
        role: filters.role,
        isActive: filters.isActive,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      setUsers(response.data);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data pengguna');
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

  const resetFilters = () => {
    setFilters({
      search: '',
      role: undefined,
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    setTempSearch('');
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  const handleViewUser = async (userId: string) => {
    try {
      const userData = await getUserById(userId);
      setSelectedUser(userData);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Gagal memuat detail pengguna');
    }
  };

  const handleEditUser = async (userId: string) => {
    try {
      const userData = await getUserById(userId);
      setSelectedUser(userData);
      setIsCreating(false);
      setIsFormModalOpen(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Gagal memuat detail pengguna');
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreating(true);
    setIsFormModalOpen(true);
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, userData);
        toast.success('Data pengguna berhasil diperbarui');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Gagal memperbarui data pengguna');
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPERADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Admin
          </span>
        );
      case 'AGEN':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Agen
          </span>
        );
      case 'MARKETING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Marketing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Jamaah
          </span>
        );
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <FaCheck className="w-3 h-3 mr-1" />
        Aktif
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <FaBan className="w-3 h-3 mr-1" />
        Nonaktif
      </span>
    );
  };

  const FilterModal = () => {
    if (!isFilterOpen) return null;

    return (
      <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900">Filter Pengguna</h3>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <FaTimes />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Role</label>
              <select
                value={filters.role || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  role: e.target.value ? e.target.value as UserRole : undefined 
                }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Semua Role</option>
                {roleOptions.map(role => (
                  <option key={role.id} value={role.id}>{role.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Semua Status</option>
                <option value="true">Aktif</option>
                <option value="false">Nonaktif</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Urut Berdasarkan</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    sortBy: e.target.value
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="createdAt">Tanggal Daftar</option>
                  <option value="fullname">Nama</option>
                  <option value="email">Email</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    sortOrder: e.target.value as 'ASC' | 'DESC'
                  }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                >
                  <option value="DESC">Menurun</option>
                  <option value="ASC">Menaik</option>
                </select>
              </div>
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
              <h1 className="text-2xl font-semibold text-white mb-2">Manajemen Pengguna</h1>
              <p className="text-green-50">Kelola semua pengguna aplikasi</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, atau nomor telepon..."
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
                  filters.role || filters.isActive !== undefined || filters.sortBy !== 'createdAt' || filters.sortOrder !== 'DESC'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FaFilter className={filters.role || filters.isActive !== undefined ? 'text-white' : 'text-gray-500'} />
                Filter
                {(filters.role || filters.isActive !== undefined) && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>
              
              <FilterModal />
            </div>
            <button
              onClick={handleCreateUser}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <FaUserPlus />
              Tambah Pengguna
            </button>
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
                        Nama
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Terdaftar
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          Tidak ada pengguna yang ditemukan
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {user.fullname}
                                </div>
                                {user.nik && (
                                  <div className="text-sm text-gray-500">
                                    NIK: {user.nik}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getRoleBadge(user.role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(user.isActive)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewUser(user.id)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                              >
                                <FaEye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user.id)}
                                className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-50"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
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
                  Menampilkan {users.length} dari {totalItems} pengguna
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

      {/* Modals */}
      <UserDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        user={selectedUser}
      />

      <UserFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleUpdateUser}
        user={isCreating ? null : selectedUser}
        title={isCreating ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}
      />
    </DashboardLayout>
  );
}
