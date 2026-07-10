import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  console.log("=== DIAGNÓSTICO MIDDLEWARE ===");
  console.log("Ruta solicitada:", request.url);
  console.log("Cookie access_token:", request.cookies.get('access_token'));
  
  // Si no hay token, redirigimos al login correspondiente
  if (!token) {
    console.log("Decisión: NextResponse.redirect() - Token no encontrado");
    if (request.nextUrl.pathname.startsWith('/portal-cliente')) {
      return NextResponse.redirect(new URL('/portal-cliente/login', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  console.log("Decisión: NextResponse.next() - Token encontrado");
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|images|assets|login|portal-cliente/login).*)',
  ],
};
