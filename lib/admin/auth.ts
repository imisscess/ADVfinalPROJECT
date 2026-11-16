import { redirect } from "next/navigation";
import { getDb } from "./db";
import { readSessionToken, decodeSession } from "./session";
import {
  isAdminRole,
  isOperationsRole,
  panelHome,
  type AdminSession,
  type AdminUser,
} from "./types";

export function findUserById(id: number): AdminUser | null {
  const row = getDb()
    .prepare(
      `SELECT id, username, full_name, role, email, phone, is_active, created_at, updated_at
       FROM USERS WHERE id = ?`,
    )
    .get(id) as AdminUser | undefined;
  return row ?? null;
}

export function findUserByUsernameOrEmail(identifier: string) {
  const value = identifier.trim().toLowerCase();
  return getDb()
    .prepare(
      `SELECT id, username, password, full_name, role, email, phone, is_active, created_at, updated_at
       FROM USERS
       WHERE lower(username) = ? OR lower(email) = ?`,
    )
    .get(value, value) as (AdminUser & { password: string }) | undefined;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const token = await readSessionToken();
  const payload = decodeSession(token);
  if (!payload) return null;
  const user = findUserById(payload.uid);
  if (!user || !user.is_active) return null;
  return {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    role: user.role,
  };
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session || !isOperationsRole(session.role)) redirect("/admin/login");
  return session;
}

export async function requireStaffSession() {
  const session = await getAdminSession();
  if (!session || !isOperationsRole(session.role)) redirect("/staff/login");
  return session;
}

export async function requireAdminRole() {
  const session = await requireAdminSession();
  if (!isAdminRole(session.role)) redirect("/staff?denied=1");
  return session;
}

export { isAdminRole, isOperationsRole, panelHome };
