import { NextRequest, NextResponse } from "next/server";
// Optimistic redirect only (Next 16 "proxy", formerly middleware). Real authorization happens server-side in requireAdmin().
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !["/admin/login", "/admin/forgot-password", "/admin/reset-password"].includes(pathname) && !req.cookies.get("src_session"))
    return NextResponse.redirect(new URL("/admin/login", req.url));
}
export const config = { matcher: ["/admin/:path*"] };
