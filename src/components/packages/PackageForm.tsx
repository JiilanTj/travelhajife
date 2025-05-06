import { useState } from 'react';
import { Package } from '@/types/package';
import { FaUpload, FaInfoCircle, FaClipboardList, FaStar, FaChevronDown, FaImage, FaSpinner, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface PackageFormProps {
  initialData?: Package;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

interface PackageFormData {
    name: string;
    type: 'UMROH' | 'HAJI';
    description: string;
    price: number | undefined;
    dp: number | undefined;  // Tambah field dp
    duration: number | undefined;
    departureDate: string;
    quota: number | undefined;
    facilities: string[];
}

// Tambahkan interface untuk API Error
interface ApiError {
  message: string;
  status?: number;
}

// Tambahkan fungsi format rupiah
const formatRupiah = (value: string) => {
  // Hapus semua karakter non-digit
  const number = value.replace(/\D/g, '');
  
  // Format dengan titik sebagai pemisah ribuan
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Tambahkan fungsi untuk menghapus format rupiah
const unformatRupiah = (value: string) => {
  return value.replace(/\./g, '');
};

// Tambahkan validasi file type
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function PackageForm({ initialData, onSubmit, onCancel }: PackageFormProps) {
  const [loading, setLoading] = useState(false);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>(''); // Tambah state untuk error gambar
  const [formData, setFormData] = useState<PackageFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'UMROH',
    description: initialData?.description || '',
    price: initialData?.price ? Number(initialData.price) : undefined,
    dp: initialData?.dp || undefined,  // Tambah initial value untuk dp
    duration: initialData?.duration || undefined,
    departureDate: initialData?.departureDate ? 
      new Date(initialData.departureDate).toISOString().split('T')[0] : '',
    quota: initialData?.quota || undefined,
    facilities: initialData?.facilities || [],
  });

  // Update handler untuk file upload dengan validasi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError(''); // Reset error message
    
    if (file) {
      // Validasi tipe file
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setImageError('Hanya file JPG, JPEG, PNG & WEBP yang diperbolehkan');
        e.target.value = ''; // Reset input file
        setMainImage(null);
        return;
      }

      // Validasi ukuran file
      if (file.size > MAX_FILE_SIZE) {
        setImageError('Ukuran file maksimal 5MB');
        e.target.value = ''; // Reset input file
        setMainImage(null);
        return;
      }

      setMainImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi gambar sebelum submit
    if (!mainImage && !initialData?.image) {
      setImageError('Gambar utama wajib diupload');
      return;
    }

    if (imageError) {
      return; // Jangan lanjutkan submit jika ada error gambar
    }

    setLoading(true);

    try {
      // Pastikan data yang akan dikirim sesuai dengan yang diharapkan
      const dataToSend = {
        ...formData,
        type: formData.type,
        price: formData.price?.toString(),
        dp: formData.dp?.toString(),  // Tambah dp ke data yang dikirim
        duration: formData.duration?.toString(),
        quota: formData.quota?.toString(),
      };

      console.log('Form Data before sending:', formData);
      console.log('Data to be sent:', dataToSend);

      const submitFormData = new FormData();
      submitFormData.append('data', JSON.stringify(dataToSend));
      
      if (mainImage) {
        submitFormData.append('image', mainImage);
      }

      // Log the actual data being sent
      const jsonData = JSON.parse(submitFormData.get('data') as string);
      console.log('Final data being sent:', jsonData);

      await onSubmit(submitFormData);
      toast.success('Paket berhasil disimpan');
    } catch (error) {
      console.error('Form submission error:', error);
      // Type guard untuk error
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        // Handle API error
        const apiError = error as ApiError;
        toast.error(apiError.message);
      } else {
        // Fallback error message
        toast.error('Gagal menyimpan paket');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update handler untuk facilities dengan pemisah koma
  const handleFacilityChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Simpan value input langsung
    const inputValue = e.target.value;
    
    // Jika input terakhir bukan koma, update facilities
    if (!inputValue.endsWith(',')) {
      const facilities = inputValue
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
      setFormData(prev => ({ ...prev, facilities }));
    }
    
    // Update textarea value langsung
    const textarea = e.target as HTMLTextAreaElement;
    textarea.value = inputValue;
  };

  // Tambahkan handler untuk input number
  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Mencegah input karakter selain angka dan tombol kontrol
    if (!/[0-9]/.test(e.key) && 
        e.key !== 'Backspace' && 
        e.key !== 'Delete' && 
        e.key !== 'ArrowLeft' && 
        e.key !== 'ArrowRight' && 
        e.key !== 'Tab' && 
        !e.ctrlKey && 
        !e.metaKey) {
      e.preventDefault();
    }
  };

  // Handler khusus untuk input harga
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = unformatRupiah(value);
    
    // Format tampilan dengan titik
    e.target.value = formatRupiah(numericValue);
    
    // Update state dengan nilai numerik
    setFormData(prev => ({ 
      ...prev, 
      price: numericValue ? Number(numericValue) : undefined 
    }));
  };

  // Update class untuk semua input text, number, select, dan textarea
  const inputClassName = "w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-500 placeholder:text-gray-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section: Informasi Utama */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
            <FaInfoCircle className="text-green-600" />
          </span>
          Informasi Utama
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Paket</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={inputClassName}
              placeholder="Contoh: Paket Umroh VIP"
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Paket</label>
            <div className="relative">
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as 'UMROH' | 'HAJI' }))}
                className={`${inputClassName} appearance-none`}
                required
              >
                <option value="UMROH">Umroh</option>
                <option value="HAJI">Haji</option>
              </select>
              <FaChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Paket</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={inputClassName}
              placeholder="Jelaskan detail paket umroh/haji..."
              required
            />
          </div>
        </div>
      </div>

      {/* Section: Detail Paket */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <FaClipboardList className="text-blue-600" />
          </span>
          Detail Paket
        </h3>

        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Harga Paket
              <span className="text-xs text-gray-500 ml-1">(dalam Rupiah)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={formData.price ? formatRupiah(formData.price.toString()) : ''}
                onChange={handlePriceChange}
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) && 
                    e.key !== 'Backspace' && 
                    e.key !== 'Delete' && 
                    e.key !== 'ArrowLeft' && 
                    e.key !== 'ArrowRight' && 
                    e.key !== 'Tab' && 
                    !e.ctrlKey && 
                    !e.metaKey
                  ) {
                    e.preventDefault();
                  }
                }}
                className={`${inputClassName} pl-12`}
                required
                placeholder="Masukkan harga paket"
              />
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Down Payment (DP)
              <span className="text-xs text-gray-500 ml-1">(dalam persen)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.dp || ''}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  dp: e.target.value ? Number(e.target.value) : undefined 
                }))}
                onKeyDown={handleNumberInput}
                className={`${inputClassName} pr-8`}
                required
                min="1"
                max="100"
                placeholder="Masukkan persentase DP"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">%</span>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Durasi Perjalanan</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.duration || ''}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  duration: e.target.value ? Number(e.target.value) : undefined 
                }))}
                onKeyDown={handleNumberInput}
                className={`${inputClassName} pr-16`}
                required
                min="1"
                placeholder="Masukkan durasi"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">Hari</span>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Keberangkatan</label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={e => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
              className={inputClassName}
              required
            />
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Kuota Jamaah</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.quota || ''}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  quota: e.target.value ? Number(e.target.value) : undefined 
                }))}
                onKeyDown={handleNumberInput}
                className={`${inputClassName} pr-16`}
                required
                min="1"
                placeholder="Masukkan kuota jamaah"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">Orang</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Fasilitas & Gambar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center">
          <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
            <FaStar className="text-purple-600" />
          </span>
          Fasilitas & Media
        </h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fasilitas</label>
            <textarea
              defaultValue={formData.facilities.join(', ')}
              onChange={handleFacilityChange}
              rows={3}
              className={inputClassName}
              placeholder="Masukkan fasilitas (pisahkan dengan koma)&#10;Contoh: Hotel Bintang 5, Pesawat Direct Flight, Makan 3x Sehari"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gambar Utama
              <span className="text-xs text-gray-500 ml-1">
                (JPG, JPEG, PNG, WEBP | Maks. 5MB)
              </span>
              <span className="text-xs text-red-500 ml-1">*Wajib</span>
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="mainImage"
                  className={`flex items-center px-4 py-3 rounded-lg border-2 border-dashed 
                    ${imageError ? 'border-red-300 hover:border-red-500' : 'border-gray-300 hover:border-green-500'} 
                    cursor-pointer transition-all duration-200 group`}
                >
                  <FaUpload className={`${imageError ? 'text-red-400' : 'text-gray-400'} group-hover:${imageError ? 'text-red-500' : 'text-green-500'} mr-2`} />
                  <span className={`${imageError ? 'text-red-600' : 'text-gray-600'} group-hover:${imageError ? 'text-red-500' : 'text-green-500'}`}>
                    Pilih Gambar
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept={ALLOWED_FILE_TYPES.join(',')}
                    className="hidden"
                    id="mainImage"
                    required={!initialData?.image}
                  />
                </label>
                {mainImage && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <FaImage className="mr-2" />
                    {mainImage.name}
                  </span>
                )}
                {initialData?.image && !mainImage && (
                  <span className="text-sm text-gray-500 flex items-center">
                    <FaImage className="mr-2" />
                    Gambar sudah ada
                  </span>
                )}
              </div>
              {imageError && (
                <p className="text-sm text-red-500 mt-1">{imageError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          disabled={loading}
        >
          Batal
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 transition-all duration-200 focus:ring-2 focus:ring-green-200 flex items-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Menyimpan...
            </>
          ) : (
            <>
              <FaSave className="mr-2" />
              {initialData ? 'Update' : 'Simpan'}
            </>
          )}
        </button>
      </div>
    </form>
  );
} 