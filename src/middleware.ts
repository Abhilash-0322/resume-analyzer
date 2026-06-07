import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "resumeai_token";

const protectedPages = ["/analyze", "/history"];
const protectedApiPrefixes = ["/api/analyze", "/api/history", "/api/rewrite"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isProtectedPage = protectedPages.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  const isProtectedApi = protectedApiPrefixes.some((p) => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get(AUTH_COOKIE)?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (token) return NextResponse.next();

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/analyze/:path*",
    "/history/:path*",
    "/api/analyze/:path*",
    "/api/history/:path*",
    "/api/rewrite/:path*",
  ],
};
