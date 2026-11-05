import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type AppRole } from "./session-token";

export async function hashPassword(pw: string) { return bcrypt.hash(pw, 12); }
export async function checkPassword(pw: string, hash: string) { return bcrypt.compare(pw, hash); }

export async function startSession(user: { id: string; role: string; firstName: string }) {
  const token = await signSession({ sub: user.id, role: user.role as AppRole, name: user.firstName });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSession() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Load the signed-in user (fresh from the DB) or redirect to login. */
export async function requireUser(role?: AppRole | AppRole[]) {
  const s = await getSession();
  if (!s) redirect("/login");
  const user = await db.user.findUnique({ where: { id: s.sub }, include: { volunteerProfile: true } });
  if (!user) redirect("/login");
  const roles = role ? (Array.isArray(role) ? role : [role]) : null;
  if (roles && !roles.includes(user.role as AppRole)) redirect(homeFor(user.role));
  return user;
}

export function homeFor(role: string) {
  return role === "PARENT" ? "/parent" : role === "VOLUNTEER" ? "/volunteer" : role === "ADMIN" ? "/admin" : "/";
}

// Simple in-memory login throttle (per email+IP). Swap for Redis when running >1 instance.
const attempts = new Map<string, { n: number; until: number }>();
export function throttle(key: string): boolean {
  const now = Date.now();
  const a = attempts.get(key);
  if (a && a.until > now && a.n >= 5) return false;
  if (!a || a.until < now) attempts.set(key, { n: 1, until: now + 15 * 60_000 });
  else a.n++;
  return true;
}
export function clearThrottle(key: string) { attempts.delete(key); }
