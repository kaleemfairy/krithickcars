import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Optimistic guard for the admin portal. Real authorisation happens in
 * requireStaff() on every page / action / route handler.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const isLogin = pathname === "/admin/login";

  if (!session && !isLogin) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    const url = new URL("/admin/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  // Signed-in users visiting /admin/login are redirected by the page itself, after it confirms the
  // account still exists — redirecting here on the token alone loops when a staff user is deleted.
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
