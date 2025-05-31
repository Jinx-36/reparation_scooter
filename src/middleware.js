import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  // Redirections basiques
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token && pathname.startsWith('/client') && token.role !== 'client') {
    return NextResponse.redirect(new URL('/denied', req.url))
  }

  

  return NextResponse.next()


}

export const config = {
  matcher: ['/client/:path*', '/login']
}

