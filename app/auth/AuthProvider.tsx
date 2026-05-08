"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: number;
};

type AuthContextValue = {
  user: Omit<StoredUser, "password"> | null;
  register: (input: { name: string; email: string; password: string }) => {
    ok: boolean;
    error?: string;
  };
  login: (input: { email: string; password: string }) => {
    ok: boolean;
    error?: string;
  };
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "pharmalink_users_v1";
const SESSION_KEY = "pharmalink_session_v1";

function safeParseUsers(raw: string | null): StoredUser[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((x) => x as Partial<StoredUser>)
      .filter((u) => typeof u.id === "string" && typeof u.email === "string") as StoredUser[];
  } catch {
    return [];
  }
}

function safeParseSession(raw: string | null): { userId: string } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    const obj = parsed as { userId?: unknown };
    if (typeof obj.userId !== "string") return null;
    return { userId: obj.userId };
  } catch {
    return null;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => {
    if (typeof window === "undefined") return [];
    return safeParseUsers(window.localStorage.getItem(USERS_KEY));
  });
  const [sessionUserId, setSessionUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const s = safeParseSession(window.localStorage.getItem(SESSION_KEY));
    return s?.userId ?? null;
  });

  useEffect(() => {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (!sessionUserId) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: sessionUserId }));
  }, [sessionUserId]);

  const user = useMemo(() => {
    if (!sessionUserId) return null;
    const found = users.find((u) => u.id === sessionUserId);
    if (!found) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safe } = found;
    return safe;
  }, [sessionUserId, users]);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      register: ({ name, email, password }) => {
        const trimmedName = name.trim();
        const normalized = normalizeEmail(email);
        const pw = password;

        if (!trimmedName) return { ok: false, error: "Name is required." };
        if (!normalized || !normalized.includes("@"))
          return { ok: false, error: "Enter a valid email address." };
        if (pw.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

        if (users.some((u) => normalizeEmail(u.email) === normalized)) {
          return { ok: false, error: "Email is already registered." };
        }

        const newUser: StoredUser = {
          id: `u_${Math.random().toString(16).slice(2)}_${Date.now()}`,
          name: trimmedName,
          email: normalized,
          password: pw,
          createdAt: Date.now(),
        };
        setUsers((prev) => [...prev, newUser]);
        setSessionUserId(newUser.id);
        return { ok: true };
      },
      login: ({ email, password }) => {
        const normalized = normalizeEmail(email);
        const found = users.find((u) => normalizeEmail(u.email) === normalized);
        if (!found) return { ok: false, error: "No account found for that email." };
        if (found.password !== password) return { ok: false, error: "Incorrect password." };
        setSessionUserId(found.id);
        return { ok: true };
      },
      logout: () => {
        setSessionUserId(null);
      },
    };
  }, [user, users]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

