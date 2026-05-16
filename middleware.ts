import { NextRequest, NextResponse } from "next/server";
import { proxy } from "@/app/proxy";

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // ✅ Always allow static files — never intercept
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/uploads/") ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|otf|css|js|map)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Public enquiry POST — no auth needed
  if (pathname === "/api/cms/enquiries" && req.method === "POST") {
    return NextResponse.next();
  }

  // Admin and CMS routes — proxy handles auth
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/cms")
  ) {
    return proxy(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT static files
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
