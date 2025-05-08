import { NextResponse } from "next/server";
import { authOptions } from "./app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function middleware(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/(admin|technicien|client)/:path*']
};