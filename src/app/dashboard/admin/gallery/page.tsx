'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getAllGalleryItems, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/services/gallery';
import { GalleryItem } from '@/types/gallery';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaTimes, FaImage } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Image from 'next/image';

// Gallery Form Modal Component
const GalleryFormModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: GalleryItem;
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPreviewUrl(initialData.imageUrl);
    } else {
      setName('');
      setImage(null);
      setPreviewUrl('');
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      if (image) {
        formData.append('image', image);
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting gallery item:', error);
      toast.error('Gagal menyimpan item galeri');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Galeri' : 'Tambah Foto Baru'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Nama Foto
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-600"
                placeholder="Masukkan nama foto"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Foto
              </label>
              <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-2 text-center">
                  {previewUrl ? (
                    <div className="relative w-full h-48 mb-4">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!initialData}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : initialData ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | undefined>();

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await getAllGalleryItems();
      console.log('Gallery items response:', response.data); // Debug response
      setGalleryItems(response.data);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      toast.error('Gagal memuat data galeri');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData: FormData) => {
    try {
      await createGalleryItem({
        name: formData.get('name') as string,
        image: formData.get('image') as File,
      });
      toast.success('Foto berhasil ditambahkan');
      fetchGalleryItems();
    } catch (error) {
      console.error('Error creating gallery item:', error);
      toast.error('Gagal menambahkan foto');
    }
  };

  const handleUpdate = async (formData: FormData) => {
    if (!selectedItem) return;
    try {
      await updateGalleryItem(selectedItem.id, {
        name: formData.get('name') as string,
        image: formData.get('image') as File,
      });
      toast.success('Foto berhasil diperbarui');
      fetchGalleryItems();
    } catch (error) {
      console.error('Error updating gallery item:', error);
      toast.error('Gagal memperbarui foto');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Penghapusan',
      text: 'Apakah Anda yakin ingin menghapus foto ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#22C55E',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteGalleryItem(id);
        toast.success('Foto berhasil dihapus');
        fetchGalleryItems();
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        toast.error('Gagal menghapus foto');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-6">
          {/* Header */}
          <div className="relative mb-8 p-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
            <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
            <div className="relative">
              <h1 className="text-2xl font-semibold text-white mb-2">Galeri Foto</h1>
              <p className="text-green-50">Kelola koleksi foto untuk website Anda</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="mb-6">
            <button 
              onClick={() => {
                setSelectedItem(undefined);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center"
            >
              <FaPlus className="mr-2" />
              Tambah Foto
            </button>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative"
                  >
                    <div className="w-full h-64 overflow-hidden rounded-lg bg-gray-100">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setIsModalOpen(true);
                          }}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <FaEdit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <FaTrash className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>

                    {/* Image name */}
                    <div className="mt-2 px-2">
                      <p className="text-sm font-medium text-gray-900 truncate text-center">
                        {item.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {galleryItems.length === 0 && (
                <div className="text-center py-12">
                  <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada foto</h3>
                  <p className="mt-1 text-sm text-gray-500">Mulai dengan menambahkan foto baru ke galeri.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <GalleryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(undefined);
        }}
        onSubmit={selectedItem ? handleUpdate : handleCreate}
        initialData={selectedItem}
      />
    </DashboardLayout>
  );
} 