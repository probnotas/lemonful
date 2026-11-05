/** Edge-safe JWT helpers (used by middleware, server components and the socket server). */
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "lf_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type AppRole = "PARENT" | "VOLUNTEER" | "ADMIN";
export interface SessionPayload { sub: string; role: AppRole; name: string }

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET must be set (32+ random chars)");
    return new TextEncoder().encode("lemonful-dev-secret-do-not-use-in-production");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(p: SessionPayload): Promise<string> {
  return new SignJWT({ role: p.role, name: p.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key());
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { sub: payload.sub, role: payload.role as AppRole, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}
