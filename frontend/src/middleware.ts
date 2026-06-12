import { isProtectedPath } from "@/lib/auth/routes";
import { NextResponse, type NextRequest } from "next/server";

const REFRESH_COOKIE = "refreshToken";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(REFRESH_COOKIE);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/overview/:path*",
    "/live-floor/:path*",
    "/attendance/:path*",
    "/users/:path*",
    "/workforce/:path*",
    "/settings/:path*",
  ],
};
