import { Package } from '@/types/package';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';

interface PackageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
}

export default function PackageViewModal({ 
  isOpen, 
  onClose, 
  package: packageData 
}: PackageViewModalProps) {
  if (!isOpen) return null;

  // Format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(amount));
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header with Image */}
          <div className="relative h-64 w-full">
            <Image
              src={packageData.image.url}
              alt={packageData.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 left-6 text-white">
              <h3 className="text-2xl font-bold">{packageData.name}</h3>
              <p className="text-sm opacity-90">{packageData.type}</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Price and Basic Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Harga Paket</p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(packageData.price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Down Payment (DP)</p>
                <p className="text-xl font-semibold text-gray-900">{packageData.dp}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Durasi</p>
                <p className="text-lg font-medium text-gray-900">{packageData.duration} Hari</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Keberangkatan</p>
                <p className="text-lg font-medium text-gray-900">{formatDate(packageData.departureDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kuota</p>
                <p className="text-lg font-medium text-gray-900">
                  {packageData.remainingQuota} / {packageData.quota} Orang
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-lg font-medium text-gray-900">
                  {packageData.isActive ? 'Aktif' : 'Tidak Aktif'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Deskripsi</h4>
              <p className="text-gray-600 whitespace-pre-line">{packageData.description}</p>
            </div>

            {/* Facilities */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Fasilitas</h4>
              <ul className="list-disc list-inside space-y-1">
                {packageData.facilities.map((facility, index) => (
                  <li key={index} className="text-gray-600">{facility}</li>
                ))}
              </ul>
            </div>

            {/* Additional Images */}
            {packageData.additionalImages && packageData.additionalImages.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Galeri</h4>
                <div className="grid grid-cols-3 gap-4">
                  {packageData.additionalImages.map((image, index) => (
                    <div key={index} className="relative h-32">
                      <Image
                        src={image.url}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 