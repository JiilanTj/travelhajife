'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/services/auth';
import { AuthError, LoginResponse } from '@/types/auth';
import { FaKaaba, FaRegEnvelope, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Menggunakan LoginResponse interface
      const response = await loginUser({ email, password }) as LoginResponse;

      // Memastikan data dan token ada
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        document.cookie = `token=${response.data.token}; path=/`;
        document.cookie = `role=${response.data.user.role}; path=/`;
        
        toast.success('Login berhasil!');
        router.push('/dashboard');
      } else {
        toast.error('Token tidak ditemukan dalam response');
        setError('Token tidak ditemukan dalam response');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof AuthError) {
        if (error.message.includes('Invalid credentials')) {
          toast.error('Email atau password salah');
          setError('Email atau password salah');
        } else {
          toast.error(error.message);
          setError(error.message);
        }
      } else if (error instanceof Error) {
        toast.error('Terjadi kesalahan saat login');
        setError('Terjadi kesalahan saat login');
      } else {
        toast.error('Gagal masuk ke sistem');
        setError('Gagal masuk ke sistem');
      }
    } finally {
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
          {/* Simplified Logo */}
          <div className="flex justify-center mb-10">
            <Link href="/" className="flex items-center space-x-3 group">
              <FaKaaba className="w-8 h-8 text-green-600 transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  Grasindo Travel
                </span>
                <span className="text-sm text-green-600 font-medium">
                  Melayani dengan Amanah
                </span>
              </div>
            </Link>
          </div>

          {/* Enhanced Login Form */}
          <div className="bg-white rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 backdrop-blur-xl relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500"></div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Selamat Datang Kembali</h2>
              <p className="text-gray-600 mt-2">Silakan masuk ke akun Anda</p>
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
              <div className="group">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <FaRegEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-gray-900 bg-white group-hover:border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
                    placeholder="nama@perusahaan.com"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Kata Sandi
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors duration-200" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                      Sedang Masuk...
                    </span>
                  ) : (
                    'Masuk'
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link 
                href="/register" 
                className="text-green-600 hover:text-green-700 font-medium inline-flex items-center hover:underline"
              >
                Daftar di sini
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