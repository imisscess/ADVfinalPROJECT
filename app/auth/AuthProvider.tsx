"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { getFirebaseAuth } from "@/lib/firebase";

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: number;
};

type AuthResult = { ok: boolean; error?: string };

type AuthContextValue = {
  user: StoredUser | null;
  ready: boolean;
  register: (input: { name: string; email: string; password: string }) => Promise<AuthResult>;
  login: (input: { email: string; password: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapUser(firebaseUser: User): StoredUser {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName?.trim() || firebaseUser.email || "Account",
    email: firebaseUser.email ?? "",
    createdAt: firebaseUser.metadata.creationTime
      ? Date.parse(firebaseUser.metadata.creationTime)
      : Date.now(),
  };
}

function authErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "Email is already registered.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Incorrect email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/network-request-failed":
        return "Network error. Check your connection and try again.";
      case "auth/operation-not-allowed":
        return "Email/password sign-in is not enabled in Firebase Authentication.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized in Firebase Authentication.";
      default:
        return error.message || "Authentication failed.";
    }
  }
  return "Authentication failed.";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser ? mapUser(firebaseUser) : null);
        setReady(true);
      });
      return unsubscribe;
    } catch {
      setReady(true);
      return undefined;
    }
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      ready,
      register: async ({ name, email, password }) => {
        const trimmedName = name.trim();
        const normalized = normalizeEmail(email);

        if (!trimmedName) return { ok: false, error: "Name is required." };
        if (!normalized || !normalized.includes("@")) {
          return { ok: false, error: "Enter a valid email address." };
        }
        if (password.length < 6) {
          return { ok: false, error: "Password must be at least 6 characters." };
        }

        try {
          const credential = await createUserWithEmailAndPassword(
            getFirebaseAuth(),
            normalized,
            password,
          );
          await updateProfile(credential.user, { displayName: trimmedName });
          setUser({
            id: credential.user.uid,
            name: trimmedName,
            email: credential.user.email ?? normalized,
            createdAt: Date.now(),
          });
          return { ok: true };
        } catch (error) {
          return { ok: false, error: authErrorMessage(error) };
        }
      },
      login: async ({ email, password }) => {
        const normalized = normalizeEmail(email);
        if (!normalized || !password) {
          return { ok: false, error: "Email and password are required." };
        }
        try {
          await signInWithEmailAndPassword(getFirebaseAuth(), normalized, password);
          return { ok: true };
        } catch (error) {
          return { ok: false, error: authErrorMessage(error) };
        }
      },
      logout: async () => {
        await signOut(getFirebaseAuth());
        setUser(null);
      },
    };
  }, [user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
