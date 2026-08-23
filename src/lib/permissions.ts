export const FULL_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;
export const ACCOUNT_ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;
// MANAGER already exists in every deployed database. In the application it is
// intentionally treated as the restricted operational staff role.
export const RESTRICTED_STAFF_ROLE = "MANAGER";

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", restrictedStaff: true },
  { label: "Transactions", href: "/admin/transactions", restrictedStaff: true },
  { label: "Income", href: "/admin/income", restrictedStaff: true },
  { label: "Expenses", href: "/admin/expenses", restrictedStaff: true },
  { label: "Bookings", href: "/admin/bookings", restrictedStaff: true },
  { label: "Reports", href: "/admin/monthly-reports", restrictedStaff: true },
  { label: "Month Closing", href: "/admin/month-closing", restrictedStaff: true },
  { label: "Cash Count", href: "/admin/cash-count", restrictedStaff: true },
  { label: "Loans", href: "/admin/loans", restrictedStaff: false },
  { label: "Budget", href: "/admin/budget", restrictedStaff: false },
  { label: "Services", href: "/admin/services", restrictedStaff: true },
  { label: "Packages", href: "/admin/packages", restrictedStaff: true },
  { label: "Blog", href: "/admin/blog", restrictedStaff: true },
  { label: "Gallery", href: "/admin/gallery", restrictedStaff: true },
  { label: "Users", href: "/admin/users", restrictedStaff: false },
  { label: "Settings", href: "/admin/settings", restrictedStaff: false },
  { label: "Audit Logs", href: "/admin/audit-logs", restrictedStaff: false },
  { label: "Import", href: "/admin/import", restrictedStaff: false }
] as const;

export function isFullAdminRole(role?: string | null) {
  return FULL_ADMIN_ROLES.includes(role as (typeof FULL_ADMIN_ROLES)[number]);
}

export function isAccountAdminRole(role?: string | null) {
  return ACCOUNT_ADMIN_ROLES.includes(role as (typeof ACCOUNT_ADMIN_ROLES)[number]);
}

export function hasAdminPortalAccess(role?: string | null) {
  return role === RESTRICTED_STAFF_ROLE || isFullAdminRole(role);
}

export function canEnterOperationalData(role?: string | null) {
  return role === "WORKER" || hasAdminPortalAccess(role);
}

export function canAccessAdminPath(role: string | null | undefined, pathname: string) {
  if (isFullAdminRole(role)) return true;
  if (role !== RESTRICTED_STAFF_ROLE) return false;
  if (pathname === "/admin") return true;

  return ADMIN_NAV_ITEMS.some(
    (item) => item.restrictedStaff && (pathname === item.href || pathname.startsWith(`${item.href}/`))
  );
}

export function adminNavigationForRole(role?: string | null) {
  if (role === RESTRICTED_STAFF_ROLE) {
    return ADMIN_NAV_ITEMS.filter((item) => item.restrictedStaff);
  }
  return isFullAdminRole(role) ? ADMIN_NAV_ITEMS : [];
}

export function defaultPortalPathForRole(role?: string | null) {
  if (hasAdminPortalAccess(role)) return "/admin/dashboard";
  if (role === "WORKER") return "/worker/dashboard";
  return "/login";
}
