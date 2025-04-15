import { 
  LoginCredentials, 
  LoginResponse, 
  ValidateTokenResponse,
  User,
  AuthError,
  UpdateProfileData,
  UpdateProfileResponse,
  RegisterData
} from "@/types/auth";

const BASE_URL = "http://localhost:5000/api";

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data: LoginResponse = await response.json();
    
    if (!response.ok || data.status === 'error') {
      throw new AuthError(data.message || 'Login failed');
    }

    return data;
  } catch (error) {
    console.error('Auth service error:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Login failed');
  }
};

// Fungsi untuk validasi token dan get user data
export const validateToken = async (): Promise<User> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AuthError('No token found');
    }

    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data: ValidateTokenResponse = await response.json();

    if (!response.ok || data.status === 'error') {
      throw new AuthError('Token validation failed');
    }

    return data.data;
  } catch (error) {
    console.error('Token validation error:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Token validation failed');
  }
};

// Fungsi untuk logout
export const logoutUser = async (): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    
    // Bersihkan data lokal di awal
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; secure; samesite=strict';

    // Jika tidak ada token, anggap sudah logout
    if (!token) {
      return;
    }

    // Kirim request logout ke server
    await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Tidak perlu throw error karena data lokal sudah dibersihkan

  } catch (error) {
    // Log error tapi tidak perlu throw karena data lokal sudah dibersihkan
    console.error('Logout error:', error);
  }
};

export const registerUser = async (data: RegisterData) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        fullname: data.fullname,
        phone: data.phone,
        address: data.address,
        ...(data.referralCode && { referralCode: data.referralCode }) // Hanya kirim jika ada
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new AuthError(error.message || 'Gagal melakukan registrasi');
    }

    return response.json();
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Gagal melakukan registrasi');
  }
};

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new AuthError('No token found');
    }

    const response = await fetch(`${BASE_URL}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: UpdateProfileResponse = await response.json();

    if (!response.ok || result.status === 'error') {
      throw new AuthError(result.message || 'Failed to update profile');
    }

    return result.data;
  } catch (error) {
    console.error('Profile update error:', error);
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError('Failed to update profile');
  }
}; 