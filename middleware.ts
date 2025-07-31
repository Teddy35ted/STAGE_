import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Ce middleware est valide mais ne fait rien.
export function middleware(request: NextRequest) {
  // On laisse simplement passer la requête sans y toucher.
  return NextResponse.next();
}

// Configuration pour que le middleware ne s'exécute sur AUCUNE route.
export const config = {
  matcher: '/this-path-will-never-match',
};
