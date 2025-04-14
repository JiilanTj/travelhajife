'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { User, getUsers } from '@/services/admin/user';
import { toast } from 'react-hot-toast';
import { FaSearch, FaUser, FaPhone, FaEnvelope, FaIdCard, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaTint, FaCalendarAlt, FaVenusMars } from 'react-icons/fa';

export default function AdminJamaahPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: search,
      });
      setUsers(response.data);
      setTotalPages(response.pagination.pages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal memuat data jamaah');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <DashboardLayout>
      <div className="container px-4 mt-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Jamaah</h1>
          <p className="text-gray-600">Kelola data jamaah yang terdaftar</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, atau nomor telepon..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <FaUser className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500 text-lg">Tidak ada data jamaah</p>
              </div>
            ) : (
              <>
                {/* User list */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Informasi Pribadi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kontak
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kontak Darurat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Info Tambahan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <FaUser className="w-5 h-5 text-green-600" />
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.fullname}</div>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaIdCard className="w-4 h-4 mr-1" />
                                  {user.nik}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaVenusMars className="w-4 h-4 mr-1" />
                                  {user.gender === 'MALE' ? 'Laki-laki' : 'Perempuan'}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <FaCalendarAlt className="w-4 h-4 mr-1" />
                                  {formatDate(user.birthDate)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center mb-2">
                                <FaEnvelope className="w-4 h-4 mr-2" />
                                {user.email}
                              </div>
                              <div className="flex items-center mb-2">
                                <FaPhone className="w-4 h-4 mr-2" />
                                {user.phone}
                              </div>
                              <div className="flex items-start">
                                <FaMapMarkerAlt className="w-4 h-4 mr-2 mt-1" />
                                <span className="flex-1">{user.address}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 font-medium mb-1">
                              {user.emergencyContact.name}
                            </div>
                            <div className="text-sm text-gray-500 mb-1">
                              {user.emergencyContact.relation}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mb-1">
                              <FaPhone className="w-4 h-4 mr-1" />
                              {user.emergencyContact.phone}
                            </div>
                            <div className="text-sm text-gray-500 flex items-start">
                              <FaMapMarkerAlt className="w-4 h-4 mr-1 mt-1" />
                              <span className="flex-1">{user.emergencyContact.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center mb-2">
                                <FaBriefcase className="w-4 h-4 mr-2" />
                                {user.occupation}
                              </div>
                              <div className="flex items-center mb-2">
                                <FaGraduationCap className="w-4 h-4 mr-2" />
                                {user.education}
                              </div>
                              <div className="flex items-center">
                                <FaTint className="w-4 h-4 mr-2" />
                                Golongan Darah: {user.bloodType}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Menampilkan {users.length} dari {totalItems} jamaah
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
    </DashboardLayout>
  );
} 