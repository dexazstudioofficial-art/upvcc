import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-this",
);

// Only truly public routes (no CMS write access here)
const PUBLIC_PATHS = [
  "/admin/login",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/public/",
  "/SAM_ENT.png",
  "/logo.png",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute  = pathname.startsWith("/admin");
  const isCmsApiRoute = pathname.startsWith("/api/cms");

  // Allow non-admin + non-cms routes
  if (!isAdminRoute && !isCmsApiRoute) {
    return NextResponse.next();
  }

  // Allow global public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // ✅ Allow ONLY public enquiry submission (POST)
  if (
    pathname === "/api/cms/enquiries" &&
    req.method === "POST"
  ) {
    return NextResponse.next();
  }

  // 🔒 Everything else under /api/cms requires auth
  const token = req.cookies.get("pw_access")?.value;

  if (!token) {
    if (isCmsApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);

    const response = NextResponse.next();

    // Inject admin context for downstream routes
    response.headers.set("x-admin-id",   String(payload.adminId));
    response.headers.set("x-admin-role", String(payload.role));
    response.headers.set("x-session-id", String(payload.sessionId));

    return response;
  } catch {
    if (isCmsApiRoute) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 });
    }

    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.delete("pw_access");
    return res;
  }
}