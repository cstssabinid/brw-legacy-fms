export const LOGIN_ROLE_OPTIONS = [
  {
    id: "ADMIN",
    label: "Admin",
    description: "Manage the business, finances, and system settings.",
    databaseRoles: ["ADMIN", "SUPER_ADMIN"]
  },
  {
    id: "PHOTOGRAPHER",
    label: "Photographer",
    description: "View assigned work and record operational activity.",
    databaseRoles: ["WORKER"]
  },
  {
    id: "CASHIER",
    label: "Cashier",
    description: "Record and review approved financial operations.",
    // MANAGER is the legacy database value previously used for cashier accounts.
    databaseRoles: ["CASHIER", "MANAGER"]
  }
] as const;

export type LoginRole = (typeof LOGIN_ROLE_OPTIONS)[number]["id"];

export function userMatchesLoginRole(loginRole: LoginRole, userRole: string) {
  return LOGIN_ROLE_OPTIONS.some(
    (option) => option.id === loginRole && option.databaseRoles.includes(userRole as never)
  );
}
