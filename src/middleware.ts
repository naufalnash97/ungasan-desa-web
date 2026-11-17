import { NextResponse, type NextRequest } from "next/server";

/** Saringan cepat di edge: tanpa cookie sesi → langsung ke halaman login.
 *  Validasi sesi yang sebenarnya (DB) ada di requireAdmin() pada layout & setiap server action. */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.get("ungasan_admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
