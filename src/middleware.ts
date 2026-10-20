import { NextRequest, NextResponse } from "next/server";
// Optimistic redirect only. Real authorization happens server-side in requireAdmin().
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !req.cookies.get("src_session"))
    return NextResponse.redirect(new URL("/admin/login", req.url));
}
export const config = { matcher: ["/admin/:path*"] };
