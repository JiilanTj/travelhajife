'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getAgents, createAgent, updateAgent, deactivateAgent } from '@/services/admin/agent';
import { getAgentTiers, createAgentTier, updateAgentTier, deleteAgentTier } from '@/services/admin/agentTier';
import { Agent, AgentTier } from '@/types/agent';
import { toast } from 'react-hot-toast';
import { 
  FaSearch, 
  FaUser, 
  FaPhone, 
  FaEnvelope, 
  FaIdCard, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaVenusMars,
  FaCrown,
  FaUsers,
  FaStar,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaMoneyBillWave
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const formatCurrency = (price: string | number) => {
  // Handle undefined or null
  if (price === undefined || price === null) {
    console.warn('Received undefined or null price value');
    return 'Rp0';
  }

  let numPrice: number;
  
  if (typeof price === 'string') {
    // Remove any non-numeric characters except decimal point
    const cleanPrice = price.replace(/[^0-9.]/g, '');
    numPrice = parseFloat(cleanPrice);
  } else {
    numPrice = price;
  }

  // Handle NaN case
  if (isNaN(numPrice)) {
    console.warn('Invalid price value:', price);
    return 'Rp0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
};

// Add TierForm component
const TierForm = ({ 
  tier, 
  onClose, 
  onSuccess 
}: { 
  tier?: AgentTier | null; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: tier?.name || '',
    commissionAmount: tier?.commissionAmount ? parseFloat(tier.commissionAmount) : 0,
    bonusAmount: tier?.bonusAmount ? parseFloat(tier.bonusAmount) : 0,
    minimumJamaah: tier?.minimumJamaah || 0,
    benefits: tier?.benefits ? tier.benefits.join('\n') : ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = {
        name: formData.name,
        commissionAmount: formData.commissionAmount,
        bonusAmount: formData.bonusAmount,
        minimumJamaah: formData.minimumJamaah,
        benefits: formData.benefits.split('\n').filter(f => f.trim())
      };

      if (tier) {
        await updateAgentTier(tier.id, data);
        toast.success('Tier berhasil diperbarui');
      } else {
        await createAgentTier(data);
        toast.success('Tier berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving tier:', error);
      toast.error('Gagal menyimpan tier');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {tier ? 'Edit Tier' : 'Tambah Tier Baru'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Nama Tier
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Contoh: BRONZE, SILVER, GOLD"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Komisi Tetap (Rp)
              </label>
              <input
                type="number"
                value={formData.commissionAmount}
                onChange={(e) => setFormData({ ...formData, commissionAmount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Contoh: 200000"
                required
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Bonus Tetap (Rp)
              </label>
              <input
                type="number"
                value={formData.bonusAmount}
                onChange={(e) => setFormData({ ...formData, bonusAmount: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Contoh: 50000"
                required
                min="0"
                step="1000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Minimum Jamaah
              </label>
              <input
                type="number"
                value={formData.minimumJamaah}
                onChange={(e) => setFormData({ ...formData, minimumJamaah: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Contoh: 5"
                required
                min="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Benefits (satu per baris)
              </label>
              <textarea
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Masukkan benefits (satu per baris)"
                rows={5}
                required
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              {isSubmitting ? 'Menyimpan...' : tier ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface AgentFormData {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  agentTierId: string;
  isActive: boolean;
  password: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

// Add AgentForm component
const AgentForm = ({ 
  agent, 
  onClose, 
  onSuccess 
}: { 
  agent?: Agent | null; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tiers, setTiers] = useState<AgentTier[]>([]);
  const [formData, setFormData] = useState<AgentFormData>({
    fullname: agent?.fullname || '',
    email: agent?.email || '',
    phone: agent?.phone || '',
    address: agent?.address || '',
    nik: agent?.nik || '',
    birthPlace: agent?.birthPlace || '',
    birthDate: agent?.birthDate || '',
    gender: agent?.gender || 'MALE',
    agentTierId: agent?.agentTierId || '',
    isActive: agent?.isActive ?? true,
    password: '',
    bankInfo: {
      bankName: agent?.bankInfo?.bankName || '',
      accountNumber: agent?.bankInfo?.accountNumber || '',
      accountHolder: agent?.bankInfo?.accountHolder || ''
    }
  });

  useEffect(() => {
    const fetchTiers = async () => {
      try {
        const response = await getAgentTiers();
        setTiers(response.data);
      } catch (error) {
        console.error('Error fetching tiers:', error);
        toast.error('Gagal memuat data tier');
      }
    };

    fetchTiers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (agent) {
        // Update agent
        await updateAgent(agent.id, {
          fullname: formData.fullname,
          phone: formData.phone,
          agentTierId: formData.agentTierId,
          bankInfo: formData.bankInfo
        });
        toast.success('Agent berhasil diperbarui');
      } else {
        // Create new agent
        await createAgent({
          email: formData.email,
          password: formData.password,
          fullname: formData.fullname,
          phone: formData.phone,
          agentTierId: formData.agentTierId,
          bankInfo: formData.bankInfo
        });
        toast.success('Agent berhasil ditambahkan');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving agent:', error);
      toast.error('Gagal menyimpan agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {agent ? 'Edit Agent' : 'Tambah Agent Baru'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Masukkan nama lengkap agent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="contoh: agent@travelhaji.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="contoh: 081234567890"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                NIK
              </label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Masukkan nomor KTP"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="contoh: Jakarta"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'MALE' | 'FEMALE' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="MALE">Laki-laki</option>
                <option value="FEMALE">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Tier Agent
              </label>
              <select
                value={formData.agentTierId}
                onChange={(e) => setFormData({ ...formData, agentTierId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">Pilih Tier Agent</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} - Komisi {formatCurrency(tier.commissionAmount)}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Alamat
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                rows={3}
                placeholder="Masukkan alamat lengkap"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Nama Bank
              </label>
              <input
                type="text"
                value={formData.bankInfo.bankName}
                onChange={(e) => setFormData({
                  ...formData,
                  bankInfo: { ...formData.bankInfo, bankName: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="contoh: BCA, Mandiri, BRI"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                value={formData.bankInfo.accountNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  bankInfo: { ...formData.bankInfo, accountNumber: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Masukkan nomor rekening"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                value={formData.bankInfo.accountHolder}
                onChange={(e) => setFormData({
                  ...formData,
                  bankInfo: { ...formData.bankInfo, accountHolder: e.target.value }
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                placeholder="Nama sesuai rekening"
                required
              />
            </div>
            {!agent && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="Minimal 8 karakter"
                  required
                />
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
              {isSubmitting ? 'Menyimpan...' : agent ? 'Perbarui' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function AdminAgentsPage() {
  // Agent states
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Tier states
  const [tiers, setTiers] = useState<AgentTier[]>([]);
  const [loadingTiers, setLoadingTiers] = useState(true);
  const [showTierForm, setShowTierForm] = useState(false);
  const [editingTier, setEditingTier] = useState<AgentTier | null>(null);
  const [activeTab, setActiveTab] = useState<'agents' | 'tiers'>('agents');

  // Agent form states
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (activeTab === 'agents') {
      fetchAgents();
    } else {
      fetchTiers();
    }
  }, [currentPage, search, activeTab]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await getAgents(currentPage, ITEMS_PER_PAGE, search);
      setAgents(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Gagal memuat data agent');
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchTiers = async () => {
    setLoadingTiers(true);
    try {
      const response = await getAgentTiers();
      setTiers(response.data);
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast.error('Gagal memuat data tier');
    } finally {
      setLoadingTiers(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchAgents();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleDeleteTier = async (id: string) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Penghapusan',
      text: 'Apakah Anda yakin ingin menghapus tier ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteAgentTier(id);
        toast.success('Tier berhasil dihapus');
        fetchTiers();
      } catch (error) {
        console.error('Error deleting tier:', error);
        toast.error('Gagal menghapus tier');
      }
    }
  };

  const handleDeleteAgent = async (id: string) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Penghapusan',
      text: 'Apakah Anda yakin ingin menonaktifkan agent ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Nonaktifkan',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deactivateAgent(id);
        toast.success('Agent berhasil dinonaktifkan');
        fetchAgents();
      } catch (error) {
        console.error('Error deactivating agent:', error);
        toast.error('Gagal menonaktifkan agent');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="container px-4 mt-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Data Agent</h1>
          <p className="text-gray-600">Kelola data agent dan tier yang terdaftar</p>
        </div>

        {/* Search and Add Agent Button */}
        {activeTab === 'agents' && (
          <div className="mb-6 flex gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama, email, atau nomor telepon..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </form>
            <button
              onClick={() => {
                setEditingAgent(null);
                setShowAgentForm(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
            >
              <FaPlus className="mr-2" />
              Tambah Agent
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('agents')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'agents'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Daftar Agent
              </button>
              <button
                onClick={() => setActiveTab('tiers')}
                className={`border-b-2 py-4 px-1 text-sm font-medium ${
                  activeTab === 'tiers'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Agent Tiers
              </button>
            </nav>
          </div>
        </div>

        {/* Agent List */}
        {activeTab === 'agents' && (
          <>
            {loadingAgents ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {agents.length === 0 ? (
                  <div className="text-center py-8">
                    <FaUser className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mt-4 text-gray-500 text-lg">Tidak ada data agent</p>
                  </div>
                ) : (
                  <>
                    {/* Agent list */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Informasi Pribadi
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kontak
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Info Agent
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {agents.map((agent) => (
                            <tr key={agent.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                      <FaUser className="w-5 h-5 text-green-600" />
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{agent.fullname}</div>
                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                      <FaIdCard className="w-4 h-4 mr-1" />
                                      {agent.nik || '-'}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                      <FaVenusMars className="w-4 h-4 mr-1" />
                                      {agent.gender === 'MALE' ? 'Laki-laki' : agent.gender === 'FEMALE' ? 'Perempuan' : '-'}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center mt-1">
                                      <FaCalendarAlt className="w-4 h-4 mr-1" />
                                      {agent.birthDate ? formatDate(agent.birthDate) : '-'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500">
                                  <div className="flex items-center mb-2">
                                    <FaEnvelope className="w-4 h-4 mr-2" />
                                    {agent.email}
                                  </div>
                                  <div className="flex items-center mb-2">
                                    <FaPhone className="w-4 h-4 mr-2" />
                                    {agent.phone}
                                  </div>
                                  <div className="flex items-start">
                                    <FaMapMarkerAlt className="w-4 h-4 mr-2 mt-1" />
                                    <span className="flex-1">{agent.address || '-'}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500">
                                  <div className="flex items-center mb-2">
                                    <FaCrown className="w-4 h-4 mr-2" />
                                    {agent.AgentTier?.name || '-'}
                                  </div>
                                  <div className="flex items-center mb-2">
                                    <FaMoneyBillWave className="w-4 h-4 mr-2" />
                                    Komisi: {agent.AgentTier ? formatCurrency(agent.AgentTier.commissionAmount) : '-'}
                                  </div>
                                  <div className="flex items-center mb-2">
                                    <FaUsers className="w-4 h-4 mr-2" />
                                    Total Jamaah: {agent.totalJamaah}
                                  </div>
                                  <div className="flex items-center">
                                    <FaStar className="w-4 h-4 mr-2" />
                                    Total Komisi: {formatCurrency(agent.totalCommission)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    agent.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {agent.isActive ? 'Aktif' : 'Nonaktif'}
                                  </span>
                                  <button
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                      setEditingAgent(agent);
                                      setShowAgentForm(true);
                                    }}
                                  >
                                    <FaEdit />
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => handleDeleteAgent(agent.id)}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Menampilkan {agents.length} dari {totalItems} agent
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        >
                          Sebelumnya
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                        >
                          Selanjutnya
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Tier List */}
        {activeTab === 'tiers' && (
          <>
            {loadingTiers ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Agent Tiers</h2>
                  <button
                    onClick={() => setShowTierForm(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    Tambah Tier
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Tier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Komisi & Bonus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Minimum Jamaah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Benefits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tiers.map((tier) => (
                        <tr key={tier.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{tier.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center mb-1">
                                <FaMoneyBillWave className="w-4 h-4 mr-2" />
                                Komisi: {formatCurrency(tier.commissionAmount)}
                              </div>
                              <div className="flex items-center">
                                <FaStar className="w-4 h-4 mr-2" />
                                Bonus: {formatCurrency(tier.bonusAmount)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              <div className="flex items-center">
                                <FaUsers className="w-4 h-4 mr-2" />
                                {tier.minimumJamaah} Jamaah
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500">
                              <ul className="list-disc list-inside">
                                {tier.benefits.map((feature: string, index: number) => (
                                  <li key={index}>{feature}</li>
                                ))}
                              </ul>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                  setEditingTier(tier);
                                  setShowTierForm(true);
                                }}
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteTier(tier.id)}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Agent Form Modal */}
        {showAgentForm && (
          <AgentForm
            agent={editingAgent}
            onClose={() => {
              setShowAgentForm(false);
              setEditingAgent(null);
            }}
            onSuccess={fetchAgents}
          />
        )}

        {/* Tier Form Modal */}
        {showTierForm && (
          <TierForm
            tier={editingTier}
            onClose={() => {
              setShowTierForm(false);
              setEditingTier(null);
            }}
            onSuccess={fetchTiers}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 