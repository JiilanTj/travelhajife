'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard, FaSave } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { updateProfile } from '@/services/auth';

// Update interfaces sesuai dengan response API
interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
  address: string;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface ProfileData {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  occupation: string;
  education: string;
  bloodType: 'A' | 'B' | 'AB' | 'O';
  emergencyContact: EmergencyContact;
  bankinfo?: BankInfo;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullname: '',
    email: '',
    phone: '',
    address: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    gender: 'MALE',
    maritalStatus: 'SINGLE',
    occupation: '',
    education: '',
    bloodType: 'A',
    emergencyContact: {
      name: '',
      relation: '',
      phone: '',
      address: ''
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        nik: user.nik || '',
        birthPlace: user.birthPlace || '',
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        gender: user.gender || 'MALE',
        maritalStatus: user.maritalStatus || 'SINGLE',
        occupation: user.occupation || '',
        education: user.education || '',
        bloodType: user.bloodType || 'A',
        emergencyContact: {
          name: user.emergencyContact?.name || '',
          relation: user.emergencyContact?.relation || '',
          phone: user.emergencyContact?.phone || '',
          address: user.emergencyContact?.address || ''
        }
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested emergencyContact fields
    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setProfileData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(profileData);
      toast.success('Profil berhasil diperbarui');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Gagal memperbarui profil');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-6">
          {/* Header dengan gradient */}
          <div className="relative mb-8 p-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
            <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
            <div className="relative">
              <h1 className="text-2xl font-semibold text-white mb-2">Profil Saya</h1>
              <p className="text-green-50">Kelola informasi profil dan data pribadi Anda</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Data Pribadi Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b">Data Pribadi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nama Lengkap */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="fullname"
                          value={profileData.fullname}
                          onChange={handleChange}
                          className="pl-10 w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleChange}
                          className="pl-10 w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* NIK */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        NIK
                      </label>
                      <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={16}
                          name="nik"
                          value={profileData.nik}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setProfileData(prev => ({
                              ...prev,
                              nik: value
                            }));
                          }}
                          placeholder="Masukkan 16 digit NIK"
                          className="pl-10 w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Format: 16 digit angka</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={13}
                          name="phone"
                          value={profileData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setProfileData(prev => ({
                              ...prev,
                              phone: value
                            }));
                          }}
                          placeholder="Contoh: 08123456789"
                          className="pl-10 w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Format: 10-13 digit angka</p>
                    </div>

                    {/* Tempat Lahir */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        name="birthPlace"
                        value={profileData.birthPlace}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Tanggal Lahir */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        value={profileData.birthDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Jenis Kelamin */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Kelamin
                      </label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      >
                        <option value="MALE">Laki-laki</option>
                        <option value="FEMALE">Perempuan</option>
                      </select>
                    </div>

                    {/* Pekerjaan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pekerjaan
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={profileData.occupation}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Status Pernikahan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Pernikahan
                      </label>
                      <select
                        name="maritalStatus"
                        value={profileData.maritalStatus}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      >
                        <option value="SINGLE">Belum Menikah</option>
                        <option value="MARRIED">Menikah</option>
                        <option value="DIVORCED">Cerai</option>
                        <option value="WIDOWED">Janda/Duda</option>
                      </select>
                    </div>

                    {/* Pendidikan */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pendidikan Terakhir
                      </label>
                      <input
                        type="text"
                        name="education"
                        value={profileData.education}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    {/* Golongan Darah */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Golongan Darah
                      </label>
                      <select
                        name="bloodType"
                        value={profileData.bloodType}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="AB">AB</option>
                        <option value="O">O</option>
                      </select>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat Lengkap
                    </label>
                    <div className="relative">
                      <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
                      <textarea
                        name="address"
                        value={profileData.address}
                        onChange={handleChange}
                        rows={3}
                        className="pl-10 w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Kontak Darurat Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Kontak Darurat</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Kontak Darurat
                      </label>
                      <input
                        type="text"
                        name="emergencyContact.name"
                        value={profileData.emergencyContact.name}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hubungan
                      </label>
                      <input
                        type="text"
                        name="emergencyContact.relation"
                        value={profileData.emergencyContact.relation}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nomor Telepon Darurat
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={13}
                        name="emergencyContact.phone"
                        value={profileData.emergencyContact.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setProfileData(prev => ({
                            ...prev,
                            emergencyContact: {
                              ...prev.emergencyContact,
                              phone: value
                            }
                          }));
                        }}
                        placeholder="Contoh: 08123456789"
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                      <p className="mt-1 text-xs text-gray-500">Format: 10-13 digit angka</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat Kontak Darurat
                      </label>
                      <textarea
                        name="emergencyContact.address"
                        value={profileData.emergencyContact.address}
                        onChange={handleChange}
                        rows={2}
                        className="w-full rounded-lg border border-gray-200 bg-white py-2.5 px-3 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium shadow-sm hover:shadow-lg hover:shadow-green-500/25 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <FaSave className="w-4 h-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 