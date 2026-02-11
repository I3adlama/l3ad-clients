import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && path !== "/admin/login") {
    const token = req.cookies.get("session")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }

    // Verify JWT signature + expiration
    const secret = process.env.SESSION_SECRET;
    if (!secret || secret.length < 16) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }

    try {
      await jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: ["HS256"],
      });
    } catch {
      // Invalid or expired token — clear it and redirect
      const response = NextResponse.redirect(
        new URL("/admin/login", req.nextUrl)
      );
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
