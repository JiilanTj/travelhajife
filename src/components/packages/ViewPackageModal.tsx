import { Package } from '@/types/package';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaUsers, FaStar, FaHotel, FaPlane } from 'react-icons/fa';
import Image from 'next/image';

interface ViewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
}

export default function ViewPackageModal({ isOpen, onClose, package: pkg }: ViewPackageModalProps) {
  const departureDate = new Date(pkg.departureDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formattedPrice = new Intl.NumberFormat('id-ID').format(
    typeof pkg.price === 'string' ? parseFloat(pkg.price) : pkg.price
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    Detail Paket
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* Image */}
                <div className="relative h-64 w-full mb-6 rounded-xl overflow-hidden">
                  <Image
                    src={pkg.image?.url || '/placeholder.jpg'}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pkg.type === 'UMROH' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {pkg.type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                    <p className="text-gray-600">{pkg.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <FaStar className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Harga Paket</p>
                          <p className="font-semibold text-gray-900">Rp {formattedPrice}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaStar className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Down Payment (DP)</p>
                          <p className="font-semibold text-gray-900">
                            {pkg.dp}% (Rp {new Intl.NumberFormat('id-ID').format(
                              typeof pkg.price === 'string' 
                                ? parseFloat(pkg.price) * (pkg.dp / 100) 
                                : pkg.price * (pkg.dp / 100)
                            )})
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Durasi Perjalanan</p>
                          <p className="font-semibold text-gray-900">{pkg.duration} Hari</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <FaCalendarAlt className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Tanggal Keberangkatan</p>
                          <p className="font-semibold text-gray-900">{departureDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaUsers className="w-5 h-5 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Kuota Jamaah</p>
                          <p className="font-semibold text-gray-900">
                            <span className="text-green-600">{pkg.remainingQuota}</span>
                            <span className="text-gray-500"> / {pkg.quota} Orang</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Fasilitas</h4>
                    <div className="flex flex-wrap gap-2">
                      {pkg.facilities.map((facility, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-gray-50 text-gray-700 rounded-full text-sm flex items-center"
                        >
                          {facility.includes('Hotel') ? <FaHotel className="mr-2" /> : 
                           facility.includes('Pesawat') ? <FaPlane className="mr-2" /> : null}
                          {facility}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 