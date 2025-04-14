import { Package } from '@/types/package';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { FaTimes, FaBed, FaHotel } from 'react-icons/fa';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface RegisterPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
  onRegister: (packageId: string, roomType: string, roomPreferences: Record<string, string | null>, specialRequests: string) => Promise<void>;
}

export default function RegisterPackageModal({ isOpen, onClose, package: pkg, onRegister }: RegisterPackageModalProps) {
  const [roomType, setRoomType] = useState('DOUBLE');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [tentSection, setTentSection] = useState('');
  const [dormitorySection, setDormitorySection] = useState('');
  const [loading, setLoading] = useState(false);

  const roomTypeOptions = [
    { value: 'SINGLE', label: 'Single (Kamar Sendiri)', icon: FaBed },
    { value: 'DOUBLE', label: 'Double (2 Orang)', icon: FaBed },
    { value: 'TRIPLE', label: 'Triple (3 Orang)', icon: FaBed },
    { value: 'QUAD', label: 'Quad (4 Orang)', icon: FaBed },
    { value: 'TENT_A', label: 'Tenda Tipe A (8 Orang)', icon: FaHotel },
    { value: 'TENT_B', label: 'Tenda Tipe B (12 Orang)', icon: FaHotel },
    { value: 'DORMITORY', label: 'Asrama/Dormitory', icon: FaHotel }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate tent section if TENT_A or TENT_B is selected
    if (['TENT_A', 'TENT_B'].includes(roomType) && !tentSection) {
      toast.error('Pilihan seksi tenda diperlukan untuk tipe tenda');
      return;
    }

    // Validate dormitory section if DORMITORY is selected
    if (roomType === 'DORMITORY' && !dormitorySection) {
      toast.error('Pilihan seksi asrama diperlukan untuk tipe asrama');
      return;
    }

    setLoading(true);
    try {
      const roomPreferences = {
        preferredLocation: preferredLocation || 'standard',
        specialNeeds: specialNeeds || null,
        tentSection: ['TENT_A', 'TENT_B'].includes(roomType) ? tentSection : null,
        dormitorySection: roomType === 'DORMITORY' ? dormitorySection : null
      };

      await onRegister(pkg.id, roomType, roomPreferences, specialRequests);
      toast.success('Pendaftaran berhasil dimulai');
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

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
                    Pendaftaran Paket {pkg.name}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Package Info */}
                  <div className="flex items-center p-4 bg-green-50 rounded-lg mb-4">
                    <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden mr-4">
                      <Image
                        src={pkg.image?.url || '/placeholder.jpg'}
                        alt={pkg.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-green-800">{pkg.name}</h3>
                      <p className="text-sm text-green-600">
                        Keberangkatan: {new Date(pkg.departureDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-green-600">
                        Durasi: {pkg.duration} Hari | Harga: Rp {new Intl.NumberFormat('id-ID').format(
                          typeof pkg.price === 'string' ? parseFloat(pkg.price) : pkg.price
                        )}
                      </p>
                      <p className="text-sm text-green-600 font-medium">
                        DP: {pkg.dp}% (Rp {new Intl.NumberFormat('id-ID').format(
                          typeof pkg.price === 'string' 
                            ? parseFloat(pkg.price) * (pkg.dp / 100) 
                            : pkg.price * (pkg.dp / 100)
                        )})
                      </p>
                    </div>
                  </div>

                  {/* Room Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipe Kamar <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roomTypeOptions.map((option) => (
                        <div key={option.value}>
                          <input
                            type="radio"
                            id={`room-${option.value}`}
                            name="roomType"
                            value={option.value}
                            checked={roomType === option.value}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="peer hidden"
                          />
                          <label
                            htmlFor={`room-${option.value}`}
                            className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 peer-checked:border-green-500 peer-checked:bg-green-50"
                          >
                            <option.icon className="w-5 h-5 mr-3 text-gray-500 peer-checked:text-green-600" />
                            <span className="text-sm text-gray-800">{option.label}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Room Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferensi Lokasi Kamar
                    </label>
                    <input
                      type="text"
                      value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                      placeholder="Contoh: Dekat lift, lantai bawah, dsb"
                    />
                  </div>

                  {/* Special Needs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kebutuhan Khusus
                    </label>
                    <input
                      type="text"
                      value={specialNeeds}
                      onChange={(e) => setSpecialNeeds(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                      placeholder="Contoh: Akses kursi roda, ramah untuk lansia, dsb"
                    />
                  </div>

                  {/* Tent Section - Only show if TENT_A or TENT_B is selected */}
                  {['TENT_A', 'TENT_B'].includes(roomType) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seksi Tenda <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tentSection}
                        onChange={(e) => setTentSection(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                        required
                      >
                        <option value="" className="text-gray-800">Pilih Seksi Tenda</option>
                        <option value="front" className="text-gray-800">Depan</option>
                        <option value="middle" className="text-gray-800">Tengah</option>
                        <option value="back" className="text-gray-800">Belakang</option>
                      </select>
                    </div>
                  )}

                  {/* Dormitory Section - Only show if DORMITORY is selected */}
                  {roomType === 'DORMITORY' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Seksi Asrama <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={dormitorySection}
                        onChange={(e) => setDormitorySection(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                        required
                      >
                        <option value="" className="text-gray-800">Pilih Seksi Asrama</option>
                        <option value="section-a" className="text-gray-800">Seksi A</option>
                        <option value="section-b" className="text-gray-800">Seksi B</option>
                        <option value="section-c" className="text-gray-800">Seksi C</option>
                      </select>
                    </div>
                  )}

                  {/* Special Requests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Permintaan Khusus
                    </label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                      placeholder="Contoh: Diet khusus, kebutuhan medis, dll"
                    />
                  </div>

                  {/* Information Notes */}
                  <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
                    <p className="font-medium mb-2">Informasi Penting:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Pendaftaran akan memulai proses booking paket ini</li>
                      <li>Anda akan diminta melengkapi dokumen dan informasi tambahan</li>
                      <li>Pembayaran DP sebesar {pkg.dp}% (Rp {new Intl.NumberFormat('id-ID').format(
                          typeof pkg.price === 'string' 
                            ? parseFloat(pkg.price) * (pkg.dp / 100) 
                            : pkg.price * (pkg.dp / 100)
                        )}) diperlukan untuk mengamankan booking</li>
                      <li>Kuota kamar terbatas dan dapat berubah sewaktu-waktu</li>
                    </ul>
                  </div>

                  {/* Submit button */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Mendaftar...
                        </>
                      ) : (
                        'Daftar Sekarang'
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 