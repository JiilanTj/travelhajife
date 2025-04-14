import { Package } from '@/types/package';
import { FaCalendarAlt, FaClock, FaUsers, FaStar, FaEye, FaAngleRight } from 'react-icons/fa';
import Image from 'next/image';

interface CustomerPackageCardProps {
  package: Package;
  onViewDetails: (pkg: Package) => void;
  onRegister: (pkg: Package) => void;
}

export default function CustomerPackageCard({ package: pkg, onViewDetails, onRegister }: CustomerPackageCardProps) {
  const imageUrl = pkg.image?.url || '/placeholder.jpg';
  
  // Format date
  const departureDate = new Date(pkg.departureDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Format price
  const formattedPrice = new Intl.NumberFormat('id-ID').format(
    typeof pkg.price === 'string' ? parseFloat(pkg.price) : pkg.price
  );

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      {/* Image container */}
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={pkg.name}
          fill
          className="object-cover"
        />
        {/* Package type badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            pkg.type === 'UMROH' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {pkg.type}
          </span>
        </div>
        
        {/* View details button */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onViewDetails(pkg)}
            className="p-2 bg-white/90 hover:bg-white rounded-lg text-gray-700 hover:text-blue-600 shadow-sm backdrop-blur-sm transition-all duration-200 group"
          >
            <FaEye className="w-4 h-4 transform group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 text-lg">{pkg.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{pkg.description}</p>
        
        {/* Package details with icons */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center">
              <FaStar className="w-4 h-4 mr-2 text-gray-400" />
              Harga
            </span>
            <span className="font-medium text-gray-900">
              Rp {formattedPrice}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center">
              <FaClock className="w-4 h-4 mr-2 text-gray-400" />
              Durasi
            </span>
            <span className="text-gray-900">{pkg.duration} Hari</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center">
              <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-400" />
              Keberangkatan
            </span>
            <span className="text-gray-900">{departureDate}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center">
              <FaUsers className="w-4 h-4 mr-2 text-gray-400" />
              Kuota Tersedia
            </span>
            <span className="text-gray-900">
              <span className="font-medium text-green-600">{pkg.remainingQuota}</span>
              <span className="text-gray-500"> / {pkg.quota} Orang</span>
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 flex items-center">
              <FaStar className="w-4 h-4 mr-2 text-green-400" />
              DP ({pkg.dp}%)
            </span>
            <span className="font-medium text-green-600">
              Rp {new Intl.NumberFormat('id-ID').format(
                typeof pkg.price === 'string' 
                  ? parseFloat(pkg.price) * (pkg.dp / 100) 
                  : pkg.price * (pkg.dp / 100)
              )}
            </span>
          </div>
        </div>
        
        {/* Register Button */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onRegister(pkg)}
            className="w-full flex justify-center items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200"
          >
            Daftar Sekarang
            <FaAngleRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
} 