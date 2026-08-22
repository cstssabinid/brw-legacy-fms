import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { canAccessAdminPath, defaultPortalPathForRole } from "./src/lib/permissions";

const workerRoles = ["WORKER", "ADMIN", "SUPER_ADMIN", "MANAGER"];

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const pathname = req.nextUrl.pathname;
    if (pathname === "/admin" && canAccessAdminPath(role, pathname)) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (pathname.startsWith("/admin") && !canAccessAdminPath(role, pathname)) {
      const destination = defaultPortalPathForRole(role);
      const url = new URL(destination, req.url);
      if (destination === "/admin/dashboard") url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }
    if (pathname.startsWith("/worker") && !workerRoles.includes(role ?? "")) {
      return NextResponse.redirect(new URL(defaultPortalPathForRole(role), req.url));
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
