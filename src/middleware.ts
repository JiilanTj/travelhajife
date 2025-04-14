import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Daftar path yang bisa diakses tanpa login
  const publicPaths = ['/login', '/register'];
  
  // Daftar path yang memerlukan autentikasi
  const protectedPaths = ['/dashboard'];

  // Redirect dari homepage ke dashboard jika sudah login
  if (path === '/') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Jika user sudah login dan mencoba mengakses login/register
  if (token && publicPaths.includes(path)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika user belum login dan mencoba mengakses halaman yang butuh autentikasi
  if (!token && protectedPaths.some(protectedPath => path.startsWith(protectedPath))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Konfigurasi path mana saja yang akan diproses oleh middleware
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*'
  ]
}; 