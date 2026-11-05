"use server";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { clearThrottle, checkPassword, endSession, hashPassword, homeFor, startSession, throttle } from "@/lib/auth";
import { sendEmail, appUrl } from "@/lib/email";
import { parentSignupSchema, volunteerSignupSchema } from "@/lib/validation";

type Result = { error?: string; fieldErrors?: Record<string, string> };

function flatErrors(issues: { path: (string | number)[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) out[i.path.join(".")] ??= i.message;
  return out;
}

async function sendVerification(email: string, firstName: string, token: string) {
  await sendEmail(email, "Confirm your Lemonful account 🍋",
    `Hi ${firstName},\n\nThanks for joining Lemonful! Please confirm your email address by clicking the link below:\n\n${appUrl(`/verify?token=${token}`)}\n\nIf you didn't sign up, you can ignore this email.\n\n— The Lemonful team`);
}

export async function signupParent(input: unknown): Promise<Result> {
  const parsed = parentSignupSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the highlighted fields.", fieldErrors: flatErrors(parsed.error.issues) };
  const { account, children, availability } = parsed.data;
  if (await db.user.findUnique({ where: { email: account.email } })) return { error: "An account with this email already exists. Try logging in." };
  const verifyToken = randomBytes(24).toString("hex");
  await db.user.create({
    data: {
      email: account.email, passwordHash: await hashPassword(account.password), role: "PARENT",
      firstName: account.firstName, lastName: account.lastName, country: account.country, city: account.city, postalCode: account.postalCode,
      verifyToken,
      children: { create: children.map((c) => ({ firstName: c.firstName, age: c.age, readingLevel: c.readingLevel, notes: c.notes ?? "" })) },
      availability: { create: availability },
    },
  });
  await sendVerification(account.email, account.firstName, verifyToken);
  redirect(`/check-email?email=${encodeURIComponent(account.email)}`);
}

export async function signupVolunteer(input: unknown): Promise<Result> {
  const parsed = volunteerSignupSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check the highlighted fields.", fieldErrors: flatErrors(parsed.error.issues) };
  const { account, profile, availability } = parsed.data;
  if (profile.age < 18 && !profile.guardianEmail) return { error: "Volunteers under 18 need a parent/guardian email.", fieldErrors: { "profile.guardianEmail": "Required if you are under 18" } };
  if (await db.user.findUnique({ where: { email: account.email } })) return { error: "An account with this email already exists. Try logging in." };
  const verifyToken = randomBytes(24).toString("hex");
  await db.user.create({
    data: {
      email: account.email, passwordHash: await hashPassword(account.password), role: "VOLUNTEER",
      firstName: account.firstName, lastName: account.lastName, country: account.country, city: account.city, postalCode: account.postalCode,
      verifyToken,
      volunteerProfile: { create: { school: profile.school, grade: profile.grade, age: profile.age, whyVolunteer: profile.whyVolunteer ?? "", guardianName: profile.guardianName, guardianEmail: profile.guardianEmail || null, agreedToCode: true } },
      availability: { create: availability },
    },
  });
  await sendVerification(account.email, account.firstName, verifyToken);
  if (profile.guardianEmail) {
    await sendEmail(profile.guardianEmail, `${account.firstName} signed up to volunteer with Lemonful`,
      `Hello ${profile.guardianName ?? ""},\n\n${account.firstName} has applied to volunteer as a reading tutor with Lemonful, a free literacy program for young children. Volunteers complete safety training and are approved by our staff before tutoring. If you have any questions or concerns, reply to volunteers@lemonful.ca.\n\n— The Lemonful team`);
  }
  redirect(`/check-email?email=${encodeURIComponent(account.email)}`);
}

export async function login(_: unknown, form: FormData): Promise<Result & { unverified?: string }> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const nextPath = String(form.get("next") ?? "");
  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  const key = `${email}|${ip}`;
  if (!throttle(key)) return { error: "Too many attempts. Please wait 15 minutes and try again." };
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await checkPassword(password, user.passwordHash))) return { error: "That email and password don't match." };
  if (!user.emailVerified) return { error: "Please confirm your email first — check your inbox for our link.", unverified: email };
  clearThrottle(key);
  await startSession(user);
  redirect(nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : homeFor(user.role));
}

export async function resendVerification(email: string) {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (user && !user.emailVerified) {
    const token = user.verifyToken ?? randomBytes(24).toString("hex");
    if (!user.verifyToken) await db.user.update({ where: { id: user.id }, data: { verifyToken: token } });
    await sendVerification(user.email, user.firstName, token);
  }
  return { ok: true }; // same answer either way: don't reveal whether an account exists
}

export async function logout() {
  await endSession();
  redirect("/");
}
