import { User, Gender, MaritalStatus } from '@/types/user';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaPhone, FaIdCard, FaMapMarkerAlt, FaGraduationCap, FaUserTag, FaBriefcase, FaCalendarAlt, FaVenusMars, FaRing, FaHeart } from 'react-icons/fa';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
  if (!user) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const genderLabels: Record<Gender, string> = {
    'MALE': 'Laki-laki',
    'FEMALE': 'Perempuan'
  };

  const maritalStatusLabels: Record<MaritalStatus, string> = {
    'SINGLE': 'Belum Menikah',
    'MARRIED': 'Menikah',
    'DIVORCED': 'Cerai',
    'WIDOWED': 'Janda/Duda'
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
            Super Admin
          </span>
        );
      case 'ADMIN':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Admin
          </span>
        );
      case 'AGEN':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            Agen
          </span>
        );
      case 'MARKETING':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            Marketing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            Jamaah
          </span>
        );
    }
  };

  const InfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value || '-'}</div>
      </div>
    </div>
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    Detail Pengguna
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* User Profile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Basic Information */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-center mb-6 py-4">
                      <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-4xl mb-4">
                        {user.fullname.charAt(0).toUpperCase()}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.fullname}</h2>
                      <div className="mb-3">{getRoleBadge(user.role)}</div>
                      <p className="text-sm text-gray-500">
                        Terdaftar sejak {formatDate(user.createdAt)}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Dasar</h3>
                      <InfoItem 
                        icon={<FaEnvelope />} 
                        label="Email" 
                        value={user.email} 
                      />
                      <InfoItem 
                        icon={<FaPhone />} 
                        label="No. Handphone" 
                        value={user.phone} 
                      />
                      <InfoItem 
                        icon={<FaIdCard />} 
                        label="NIK" 
                        value={user.nik || '-'} 
                      />
                      <InfoItem 
                        icon={<FaMapMarkerAlt />} 
                        label="Alamat" 
                        value={user.address || '-'} 
                      />
                      <InfoItem 
                        icon={<FaUserTag />} 
                        label="Status" 
                        value={
                          user.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Aktif</span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Nonaktif</span>
                          )
                        } 
                      />
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Pribadi</h3>
                    
                    <InfoItem 
                      icon={<FaCalendarAlt />} 
                      label="Tanggal Lahir" 
                      value={formatDate(user.birthDate)} 
                    />
                    <InfoItem 
                      icon={<FaMapMarkerAlt />} 
                      label="Tempat Lahir" 
                      value={user.birthPlace || '-'} 
                    />
                    <InfoItem 
                      icon={<FaVenusMars />} 
                      label="Jenis Kelamin" 
                      value={user.gender ? genderLabels[user.gender] : '-'} 
                    />
                    <InfoItem 
                      icon={<FaRing />} 
                      label="Status Pernikahan" 
                      value={user.maritalStatus ? maritalStatusLabels[user.maritalStatus] : '-'} 
                    />
                    <InfoItem 
                      icon={<FaBriefcase />} 
                      label="Pekerjaan" 
                      value={user.occupation || '-'} 
                    />
                    <InfoItem 
                      icon={<FaGraduationCap />} 
                      label="Pendidikan" 
                      value={user.education || '-'} 
                    />
                    <InfoItem 
                      icon={<FaHeart />} 
                      label="Golongan Darah" 
                      value={user.bloodType || '-'} 
                    />
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-6">
                    {/* Emergency Contact */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Kontak Darurat</h3>
                      
                      <InfoItem 
                        icon={<FaUser />} 
                        label="Nama" 
                        value={user.emergencyContact.name || '-'} 
                      />
                      <InfoItem 
                        icon={<FaUserTag />} 
                        label="Hubungan" 
                        value={user.emergencyContact.relation || '-'} 
                      />
                      <InfoItem 
                        icon={<FaPhone />} 
                        label="No. Handphone" 
                        value={user.emergencyContact.phone || '-'} 
                      />
                      <InfoItem 
                        icon={<FaMapMarkerAlt />} 
                        label="Alamat" 
                        value={user.emergencyContact.address || '-'} 
                      />
                    </div>

                    {/* Bank Information - Only for Agen & Marketing */}
                    {(user.role === 'AGEN' || user.role === 'MARKETING') && (
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Bank</h3>
                        
                        <InfoItem 
                          icon={<FaUser />} 
                          label="Nama Bank" 
                          value={user.bankInfo.bankName || '-'} 
                        />
                        <InfoItem 
                          icon={<FaIdCard />} 
                          label="No. Rekening" 
                          value={user.bankInfo.accountNumber || '-'} 
                        />
                        <InfoItem 
                          icon={<FaUser />} 
                          label="Atas Nama" 
                          value={user.bankInfo.accountHolder || '-'} 
                        />
                      </div>
                    )}

                    {/* Referral Information - Only for Agen & Marketing */}
                    {(user.role === 'AGEN' || user.role === 'MARKETING') && (
                      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">Informasi Referral</h3>
                        
                        <InfoItem 
                          icon={<FaIdCard />} 
                          label="Kode Referral" 
                          value={user.referralCode || '-'} 
                        />
                        <InfoItem 
                          icon={<FaUser />} 
                          label="Total Jamaah" 
                          value={user.totalJamaah.toString()} 
                        />
                        <InfoItem 
                          icon={<FaIdCard />} 
                          label="Total Komisi" 
                          value={`Rp ${Number(user.totalCommission).toLocaleString('id-ID')}`} 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 