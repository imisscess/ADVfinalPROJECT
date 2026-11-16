import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "pharmalink_admin_session";
const MAX_AGE_SEC = 60 * 60 * 12;

function secretPath() {
  return path.join(process.cwd(), "data", ".admin-secret");
}

function getSecret() {
  if (process.env.ADMIN_SESSION_SECRET) return process.env.ADMIN_SESSION_SECRET;
  const file = secretPath();
  const dir = path.dirname(file);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(file)) {
    writeFileSync(file, randomBytes(32).toString("hex"), { encoding: "utf8" });
  }
  return readFileSync(file, "utf8").trim();
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export type SessionPayload = { uid: number; exp: number };

export function encodeSession(uid: number) {
  const payload: SessionPayload = { uid, exp: Date.now() + MAX_AGE_SEC * 1000 };
  const raw = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${raw}.${sign(raw)}`;
}

export function decodeSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [raw, sig] = token.split(".");
  if (!raw || !sig) return null;
  const expected = sign(raw);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as SessionPayload;
    if (!payload?.uid || !payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(uid: number) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, encodeSession(uid), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function readSessionToken() {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value ?? null;
}
