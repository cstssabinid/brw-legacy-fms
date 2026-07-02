import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const adminRoles = ["ADMIN", "SUPER_ADMIN", "MANAGER"];
const workerRoles = ["WORKER", "ADMIN", "SUPER_ADMIN", "MANAGER"];

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith("/admin") && !adminRoles.includes(role ?? "")) {
      return NextResponse.redirect(new URL("/login?error=admin", req.url));
    }
    if (pathname.startsWith("/worker") && !workerRoles.includes(role ?? "")) {
      return NextResponse.redirect(new URL("/login?error=worker", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/admin") || pathname.startsWith("/worker")) return !!token;
        return true;
      }
    }
  }
);

export const config = {
  matcher: ["/admin/:path*", "/worker/:path*"]
};
