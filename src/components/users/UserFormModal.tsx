import { User, UserRole } from '@/types/user';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: Partial<User>) => Promise<void>;
  user?: User | null;
  title: string;
}

export default function UserFormModal({ isOpen, onClose, onSubmit, user, title }: UserFormModalProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showBankInfo, setShowBankInfo] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(user);
      setShowBankInfo(user.role === 'AGEN' || user.role === 'MARKETING');
    } else {
      setFormData({
        role: 'JAMAAH',
        isActive: true,
        emergencyContact: {
          name: null,
          relation: null,
          phone: null,
          address: null
        },
        bankInfo: {
          bankName: null,
          accountNumber: null,
          accountHolder: null
        },
        totalJamaah: 0,
        totalCommission: '0.00'
      });
      setShowBankInfo(false);
    }
    setErrors({});
  }, [user, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...((prev[parent as keyof Partial<User>] as unknown) || {}),
          [child]: value
        }
      }));
    } else if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        [name]: value as UserRole
      }));
      setShowBankInfo(value === 'AGEN' || value === 'MARKETING');
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.fullname) newErrors.fullname = 'Nama lengkap harus diisi';
    if (!formData.email) newErrors.email = 'Email harus diisi';
    if (!formData.phone) newErrors.phone = 'Nomor handphone harus diisi';
    
    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting user form:', error);
    } finally {
      setSaving(false);
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <Dialog.Title className="text-xl font-semibold text-gray-900">
                    {title}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullname"
                        value={formData.fullname || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.fullname ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                      />
                      {errors.fullname && (
                        <p className="mt-1 text-xs text-red-500">{errors.fullname}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No. Handphone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIK
                      </label>
                      <input
                        type="text"
                        name="nik"
                        value={formData.nik || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.nik ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat
                      </label>
                      <textarea
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        rows={2}
                        className={`w-full px-3 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="role"
                        value={formData.role || ''}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                      >
                        <option value="SUPERADMIN">Super Admin</option>
                        <option value="ADMIN">Admin</option>
                        <option value="AGEN">Agen</option>
                        <option value="MARKETING">Marketing</option>
                        <option value="JAMAAH">Jamaah</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="isActive"
                        value={formData.isActive === true ? 'true' : formData.isActive === false ? 'false' : ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          isActive: e.target.value === 'true'
                        }))}
                        className={`w-full px-3 py-2 border ${errors.isActive ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                      >
                        <option value="true">Aktif</option>
                        <option value="false">Nonaktif</option>
                      </select>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">Informasi Pribadi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tempat Lahir
                        </label>
                        <input
                          type="text"
                          name="birthPlace"
                          value={formData.birthPlace || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.birthPlace ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tanggal Lahir
                        </label>
                        <input
                          type="date"
                          name="birthDate"
                          value={formData.birthDate ? formData.birthDate.split('T')[0] : ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Jenis Kelamin
                        </label>
                        <select
                          name="gender"
                          value={formData.gender || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        >
                          <option value="">Pilih Jenis Kelamin</option>
                          <option value="MALE">Laki-laki</option>
                          <option value="FEMALE">Perempuan</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status Pernikahan
                        </label>
                        <select
                          name="maritalStatus"
                          value={formData.maritalStatus || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.maritalStatus ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        >
                          <option value="">Pilih Status Pernikahan</option>
                          <option value="SINGLE">Belum Menikah</option>
                          <option value="MARRIED">Menikah</option>
                          <option value="DIVORCED">Cerai</option>
                          <option value="WIDOWED">Janda/Duda</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pekerjaan
                        </label>
                        <input
                          type="text"
                          name="occupation"
                          value={formData.occupation || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.occupation ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pendidikan
                        </label>
                        <input
                          type="text"
                          name="education"
                          value={formData.education || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.education ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Golongan Darah
                        </label>
                        <select
                          name="bloodType"
                          value={formData.bloodType || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors.bloodType ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        >
                          <option value="">Pilih Golongan Darah</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="AB">AB</option>
                          <option value="O">O</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">Kontak Darurat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama
                        </label>
                        <input
                          type="text"
                          name="emergencyContact.name"
                          value={formData.emergencyContact?.name || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors['emergencyContact.name'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hubungan
                        </label>
                        <input
                          type="text"
                          name="emergencyContact.relation"
                          value={formData.emergencyContact?.relation || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors['emergencyContact.relation'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. Handphone
                        </label>
                        <input
                          type="text"
                          name="emergencyContact.phone"
                          value={formData.emergencyContact?.phone || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors['emergencyContact.phone'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alamat
                        </label>
                        <input
                          type="text"
                          name="emergencyContact.address"
                          value={formData.emergencyContact?.address || ''}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border ${errors['emergencyContact.address'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Bank Information - Only for Agen & Marketing */}
                  {showBankInfo && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">Informasi Bank</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Bank
                          </label>
                          <input
                            type="text"
                            name="bankInfo.bankName"
                            value={formData.bankInfo?.bankName || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors['bankInfo.bankName'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            No. Rekening
                          </label>
                          <input
                            type="text"
                            name="bankInfo.accountNumber"
                            value={formData.bankInfo?.accountNumber || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors['bankInfo.accountNumber'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Atas Nama
                          </label>
                          <input
                            type="text"
                            name="bankInfo.accountHolder"
                            value={formData.bankInfo?.accountHolder || ''}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${errors['bankInfo.accountHolder'] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800`}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
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
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan'
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