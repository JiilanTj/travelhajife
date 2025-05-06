'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaPlus, FaEdit, FaTrash, FaEye, FaNewspaper, FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getBlogStats, getAllBlogPosts, getAllBlogCategories, createBlogCategory, deleteBlogPost } from '@/services/blog';
import { BlogPost, BlogStats, BlogPostFilters, BlogCategory, CreateBlogCategoryData } from '@/types/blog';

type PostStatus = 'published' | 'draft' | 'archived' | 'all';

export default function ContentManagementPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('SEMUA');
  const [selectedStatus, setSelectedStatus] = useState<'SEMUA' | PostStatus>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1,
    limit: 10
  });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<CreateBlogCategoryData>({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, selectedStatus, searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, postsData, categoriesData] = await Promise.all([
        getBlogStats(),
        getAllBlogPosts(),
        getAllBlogCategories()
      ]);

      setStats(statsData);
      setPosts(postsData.data);
      setPagination(postsData.pagination);
      setCategories(categoriesData.data);
    } catch (error) {
      console.error('Error fetching blog data:', error);
      toast.error('Gagal memuat data blog');
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async (paginationParams?: { page: number; limit: number }) => {
    try {
      const filters: BlogPostFilters = {
        page: paginationParams?.page || 1,
        limit: paginationParams?.limit || 10,
        search: searchQuery || undefined,
        categoryId: selectedCategory === 'SEMUA' ? undefined : selectedCategory,
        status: selectedStatus === 'SEMUA' ? undefined : selectedStatus.toLowerCase() as PostStatus,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      const postsData = await getAllBlogPosts(filters);
      setPosts(postsData.data);
      setPagination(postsData.pagination);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Gagal memuat artikel');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Artikel yang dihapus tidak dapat dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteBlogPost(id);
        Swal.fire({
          title: 'Terhapus!',
          text: 'Artikel berhasil dihapus.',
          icon: 'success',
          confirmButtonColor: '#10B981'
        });
        // Refresh posts list
        fetchPosts();
        // Refresh stats
        const statsData = await getBlogStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error deleting post:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus artikel.',
          icon: 'error',
          confirmButtonColor: '#10B981'
        });
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/dashboard/admin/content/edit/${id}`);
  };

/* eslint-disable @typescript-eslint/no-unused-vars */
  const handleView = (id: string) => {
    // TODO: Implement view functionality
    toast.success('Membuka preview konten...');
  };
/* eslint-enable @typescript-eslint/no-unused-vars */

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createBlogCategory(newCategory);
      toast.success('Kategori berhasil dibuat');
      setNewCategory({ name: '', description: '' });
      setShowCategoryModal(false);
      // Refresh categories list
      const categoriesData = await getAllBlogCategories();
      setCategories(categoriesData.data);
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Gagal membuat kategori');
    } finally {
      setIsSubmitting(false);
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
      <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
        {/* Header Section with Stats */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">Kelola artikel, promo, dan konten website</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Total Konten</p>
                  <p className="mt-1 text-sm sm:text-base font-bold text-emerald-600 truncate">
                    {stats?.totalPosts || 0}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-emerald-100 rounded-lg flex-shrink-0">
                  <FaNewspaper className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Published</p>
                  <p className="mt-1 text-sm sm:text-base font-bold text-blue-600 truncate">
                    {stats?.postsByStatus.published || 0}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <FaEye className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Draft</p>
                  <p className="mt-1 text-sm sm:text-base font-bold text-yellow-600 truncate">
                    {stats?.postsByStatus.draft || 0}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                  <FaEdit className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Archived</p>
                  <p className="mt-1 text-sm sm:text-base font-bold text-gray-600 truncate">
                    {stats?.postsByStatus.archived || 0}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-gray-100 rounded-lg flex-shrink-0">
                  <FaTrash className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 truncate">Total Views</p>
                  <p className="mt-1 text-sm sm:text-base font-bold text-green-600 truncate">
                    {stats?.views.total.toLocaleString() || 0}
                  </p>
                </div>
                <div className="ml-2 p-2 bg-green-100 rounded-lg flex-shrink-0">
                  <FaEye className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari konten..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 placeholder:text-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="SEMUA">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-700 bg-white"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'SEMUA' | PostStatus)}
              >
                <option value="SEMUA">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <div className="flex gap-2">
                <button
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setShowCategoryModal(true)}
                >
                  <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Tambah Kategori</span>
                  <span className="sm:hidden">Kategori</span>
                </button>
                <button
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  onClick={() => router.push('/dashboard/admin/content/create')}
                >
                  <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Buat Konten</span>
                  <span className="sm:hidden">Konten</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penulis</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="text-sm font-medium text-gray-900">{post.title}</div>
                      <div className="sm:hidden text-xs text-gray-500 mt-1">
                        {post.category.name} • {post.author.fullname}
                      </div>
                      <div className="sm:hidden text-xs text-gray-500">
                        {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })} • {post.viewCount} views
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${post.category.name === 'PROMO' ? 'bg-yellow-100 text-yellow-800' : 
                          post.category.name === 'ARTIKEL' ? 'bg-blue-100 text-blue-800' :
                          post.category.name === 'PANDUAN' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'}`}>
                        {post.category.name}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${post.status === 'published' ? 'bg-green-100 text-green-800' :
                          post.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">{post.author.fullname}</td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">
                      {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-sm text-gray-500">{post.viewCount.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium">
                      <div className="flex gap-2">
                        {/* <button
                          onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50"
                          title="Lihat"
                        >
                          <FaEye className="w-4 h-4" />
                        </button> */}
                        <button
                          onClick={() => handleEdit(post.id)}
                          className="text-emerald-600 hover:text-emerald-900 p-1 rounded-full hover:bg-emerald-50"
                          title="Edit"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Hapus"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Showing{' '}
                <span className="font-medium">
                  {posts.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </div>
              
              <div className="flex justify-center sm:justify-end gap-2">
                <button
                  onClick={() => {
                    if (pagination.page > 1) {
                      fetchPosts({ ...pagination, page: pagination.page - 1 });
                    }
                  }}
                  disabled={pagination.page <= 1}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    pagination.page <= 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Previous
                </button>
                
                <button
                  onClick={() => {
                    if (pagination.page < pagination.pages) {
                      fetchPosts({ ...pagination, page: pagination.page + 1 });
                    }
                  }}
                  disabled={pagination.page >= pagination.pages}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    pagination.page >= pagination.pages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tambah Kategori Baru</h3>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nama Kategori <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Masukkan nama kategori"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Deskripsi
                    </label>
                    <textarea
                      id="description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-emerald-500 focus:ring-emerald-500"
                      rows={3}
                      placeholder="Masukkan deskripsi kategori"
                    />
                  </div>

                  <div className="flex justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(false)}
                      className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-3 sm:px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-emerald-300 flex items-center gap-2"
                    >
                      {isSubmitting && <FaSpinner className="animate-spin w-4 h-4" />}
                      <span>Simpan</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 