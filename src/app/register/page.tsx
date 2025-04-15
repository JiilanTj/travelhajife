'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/auth';
import { AuthError } from '@/types/auth';
import { FaKaaba, FaRegEnvelope, FaLock, FaUser, FaPhone, FaMapMarkerAlt, FaTicketAlt } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullname: '',
    phone: '',
    address: '',
    referralCode: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('Password harus minimal 8 karakter');
      passwordRef.current?.focus();
      return false;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(formData.password)) {
      setError('Password harus mengandung huruf dan angka');
      passwordRef.current?.focus();
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak sesuai');
      confirmPasswordRef.current?.focus();
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Format email tidak valid');
      emailRef.current?.focus();
      return false;
    }

    if (!/^\d{10,}$/.test(formData.phone)) {
      setError('Nomor telepon tidak valid (minimal 10 digit)');
      phoneRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { email, password, fullname, phone, address, referralCode } = formData;
      const registerData = { 
        email, 
        password, 
        fullname, 
        phone, 
        address,
        ...(referralCode && { referralCode }) // Hanya kirim jika ada
      };
      
      await registerUser(registerData);
      
      toast.success(
        'Registrasi berhasil! Anda akan dialihkan ke halaman login dalam 3 detik...',
        { duration: 3000 }
      );

      setLoading(true);

      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error) {
      console.error('Register error:', error);
      if (error instanceof AuthError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Gagal melakukan registrasi');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -right-4 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply opacity-5 animate-blob"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply opacity-5 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <Link href="/" className="flex items-center space-x-3 group">
              <FaKaaba className="w-8 h-8 text-green-600 transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  Al-Amin Travel
                </span>
                <span className="text-sm text-green-600 font-medium">
                  Melayani dengan Amanah
                </span>
              </div>
            </Link>
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 backdrop-blur-xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Daftar Akun Baru</h2>
              <p className="text-gray-600 mt-2">Silakan lengkapi data diri Anda</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center animate-shake">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fullname Input */}
              <div className="group">
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <input
                    type="text"
                    id="fullname"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-white group-hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <FaRegEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <input
                    ref={emailRef}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-white group-hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Sandi
                  <span className="text-xs text-gray-500 ml-1">(min. 8 karakter, kombinasi huruf dan angka)</span>
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-20 py-3 rounded-lg border border-gray-200 text-gray-900 bg-white group-hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Masukkan kata sandi"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="group">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <input
                    ref={confirmPasswordRef}
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-20 py-3 rounded-lg border border-gray-200 text-gray-900 bg-white group-hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Konfirmasi kata sandi"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div className="group">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <input
                    ref={phoneRef}
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-white group-hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Contoh: 081234567890"
                    required
                  />
                </div>
              </div>

              {/* Address Input */}
              <div className="group">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-white group-hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Masukkan alamat lengkap"
                    required
                  />
                </div>
              </div>

              {/* Referral Code Input */}
              <div className="group">
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Referral
                  <span className="text-xs text-gray-500 ml-1">(opsional)</span>
                </label>
                <div className="relative">
                  <FaTicketAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <input
                    type="text"
                    id="referralCode"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-white group-hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="Masukkan kode referral (jika ada)"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Masukkan kode referral jika Anda diundang oleh agen kami
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mendaftar...
                    </span>
                  ) : (
                    'Daftar'
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link 
                href="/login" 
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center hover:underline"
              >
                Masuk di sini
                <svg className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
} 