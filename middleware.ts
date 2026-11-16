import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = pathname.startsWith("/admin");
  const isStaff = pathname.startsWith("/staff");
  const isLogin = pathname.startsWith("/admin/login") || pathname.startsWith("/staff/login");

  if ((!isAdmin && !isStaff) || isLogin) {
    return NextResponse.next();
  }

  const token = request.cookies.get("pharmalink_admin_session")?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = isStaff ? "/staff/login" : "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*"],
};
