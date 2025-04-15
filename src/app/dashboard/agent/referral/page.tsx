'use client';

import { useEffect, useState } from 'react';
import { FaCopy, FaQrcode, FaShare } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { generateReferralCode, checkReferral } from '@/services/agent/referral';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface ReferralData {
  referralCode: string | null;
}

export default function ReferralPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData>({ referralCode: null });

  useEffect(() => {
    const fetchReferralStatus = async () => {
      try {
        const response = await checkReferral();
        if (response.success) {
          setReferralData({
            referralCode: response.data.referralCode
          });
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferralStatus();
  }, []);

  const handleGenerateReferral = async () => {
    setIsGenerating(true);
    try {
      const response = await generateReferralCode();
      if (response.success) {
        toast.success('Referral code berhasil dibuat!');
        setReferralData({
          referralCode: response.data.referralCode
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Referral code berhasil disalin!');
  };

  const shareReferral = () => {
    if (referralData.referralCode) {
      const shareText = `Gunakan kode referral saya: ${referralData.referralCode} untuk mendapatkan diskon khusus!`;
      if (navigator.share) {
        navigator.share({
          title: 'Kode Referral Travel Haji',
          text: shareText,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success('Teks referral berhasil disalin!');
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Manager Referral</h1>
            <p className="text-gray-600 mt-2">
              Kelola kode referral Anda untuk mendapatkan komisi tambahan
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {referralData.referralCode ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Kode Referral Anda</h2>
                    <p className="text-gray-600 mt-1">Gunakan kode ini untuk mengundang jamaah baru</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => copyToClipboard(referralData.referralCode!)}
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                      title="Salin kode"
                    >
                      <FaCopy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={shareReferral}
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                      title="Bagikan kode"
                    >
                      <FaShare className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-bold text-gray-900">
                      {referralData.referralCode}
                    </span>
                    <button
                      onClick={() => copyToClipboard(referralData.referralCode!)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      Salin
                    </button>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-green-800 mb-2">Cara Menggunakan</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
                    <li>Bagikan kode referral Anda ke calon jamaah</li>
                    <li>Jamaah memasukkan kode saat mendaftar</li>
                    <li>Anda akan mendapatkan komisi dari setiap jamaah yang mendaftar menggunakan kode Anda</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-6">
                  <FaQrcode className="w-16 h-16 text-gray-400 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Anda belum memiliki kode referral
                </h3>
                <p className="text-gray-600 mb-6">
                  Buat kode referral Anda sekarang untuk mulai mendapatkan komisi tambahan
                </p>
                <button
                  onClick={handleGenerateReferral}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Membuat kode...' : 'Buat Kode Referral'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 