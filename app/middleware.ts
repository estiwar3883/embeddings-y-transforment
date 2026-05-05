// middleware.ts (en la raíz del proyecto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Buscamos la cookie de sesión que crearemos en el login
  const session = request.cookies.get('session');

  // Si el usuario intenta ir al dashboard y NO hay sesión, lo mandamos al login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// Esto le dice a Next.js que solo ejecute el middleware en el dashboard
export const config = {
  matcher: '/dashboard/:path*',
};