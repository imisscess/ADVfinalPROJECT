export type AdminRole = "admin" | "staff" | "pharmacist";

export const OPERATIONS_ROLES = ["admin", "staff", "pharmacist"] as const;

export type AdminUser = {
  id: number;
  username: string;
  full_name: string;
  role: string;
  email: string | null;
  phone: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
};

export type AdminSession = {
  id: number;
  username: string;
  full_name: string;
  role: string;
};

export function normalizeRole(role: string) {
  return role.trim().toLowerCase();
}

export function isAdminRole(role: string) {
  return normalizeRole(role) === "admin";
}

export function isStaffRole(role: string) {
  const value = normalizeRole(role);
  return value === "staff" || value === "pharmacist";
}

export function isOperationsRole(role: string) {
  return (OPERATIONS_ROLES as readonly string[]).includes(normalizeRole(role));
}

export function panelHome(role: string) {
  return isAdminRole(role) ? "/admin" : "/staff";
}

export function loginHome(role: string) {
  return isAdminRole(role) ? "/admin/login" : "/staff/login";
}

export function saleDetailPath(role: string, saleId: number) {
  return isAdminRole(role) ? `/admin/sales/${saleId}` : `/staff/sales/${saleId}`;
}
