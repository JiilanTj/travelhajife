import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateToken, logoutUser } from '@/services/auth';
import { User } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await validateToken();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Redirect ke login jika token invalid
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    router.replace('/login');
  };

  return { user, loading, logout };
} 