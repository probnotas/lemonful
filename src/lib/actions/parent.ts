"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { childSchema, slotSchema } from "@/lib/validation";
import { nextLessonFor } from "@/lib/progress";
import { sendEmail } from "@/lib/email";
import { fmtDate, fmtTime } from "@/lib/utils";

async function ownChild(childId: string) {
  const user = await requireUser("PARENT");
  const child = await db.child.findFirst({ where: { id: childId, parentId: user.id } });
  if (!child) throw new Error("Not found");
  return { user, child };
}

export async function addChild(_: unknown, form: FormData) {
  const user = await requireUser("PARENT");
  const parsed = childSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const child = await db.child.create({ data: { ...parsed.data, notes: parsed.data.notes ?? "", parentId: user.id } });
  await audit(user.id, "child.create", child.id);
  redirect(`/parent/children/${child.id}/assessment`);
}

export async function updateChild(childId: string, _: unknown, form: FormData) {
  const { user } = await ownChild(childId);
  const parsed = childSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message, ok: false };
  await db.child.update({ where: { id: childId }, data: { ...parsed.data, avatar: String(form.get("avatar") ?? "bear") } });
  await audit(user.id, "child.update", childId);
  revalidatePath(`/parent/children/${childId}`);
  return { ok: true, error: "" };
}

export async function deleteChild(childId: string) {
  const { user } = await ownChild(childId);
  await db.child.delete({ where: { id: childId } });
  await audit(user.id, "child.delete", childId);
  redirect("/parent");
}

const assessmentSchema = z.object({
  sounds: z.record(z.boolean()),
  blending: z.record(z.boolean()),
  sight: z.record(z.boolean()),
  sentence: z.enum(["yes", "some", "no"]),
});

export async function saveAssessment(childId: string, raw: unknown) {
  const { user } = await ownChild(childId);
  const a = assessmentSchema.parse(raw);
  const count = (r: Record<string, boolean>) => Object.values(r).filter(Boolean).length;
  const sounds = count(a.sounds), blend = count(a.blending), sight = count(a.sight);
  let startLesson = 1, readingLevel = "JUST_STARTING";
  if (sounds >= 6) { startLesson = 2; readingLevel = "SOME_SOUNDS"; }
  if (sounds >= 6 && blend >= 3) { startLesson = 3; readingLevel = "SIMPLE_WORDS"; }
  if (blend >= 3 && sight >= 3 && a.sentence !== "no") { startLesson = 4; readingLevel = "SIMPLE_BOOKS"; }
  await db.child.update({ where: { id: childId }, data: { assessment: JSON.stringify({ ...a, score: { sounds, blend, sight } }), assessedAt: new Date(), startLesson, readingLevel } });
  await audit(user.id, "child.assessment", childId);
  revalidatePath(`/parent/children/${childId}`);
  return { startLesson };
}

export async function saveAvailability(slots: unknown) {
  const user = await requireUser(["PARENT", "VOLUNTEER"]);
  const parsed = z.array(slotSchema).max(80).parse(slots);
  await db.$transaction([
    db.availability.deleteMany({ where: { userId: user.id } }),
    db.availability.createMany({ data: parsed.map((s) => ({ ...s, userId: user.id })) }),
  ]);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bookSession(childId: string, iso: string) {
  const { user, child } = await ownChild(childId);
  if (!child.volunteerId) return { error: "Your child hasn't been matched with a volunteer yet." };
  const when = new Date(iso);
  if (isNaN(+when) || +when < Date.now()) return { error: "Please pick a future time." };
  const clash = await db.tutoringSession.findFirst({ where: { volunteerId: child.volunteerId, scheduledAt: when, status: { in: ["SCHEDULED", "LIVE"] } } });
  if (clash) return { error: "That time was just taken — please pick another." };
  const lessonNumber = await nextLessonFor(childId);
  const s = await db.tutoringSession.create({ data: { childId, volunteerId: child.volunteerId, scheduledAt: when, lessonNumber } });
  const vol = await db.user.findUnique({ where: { id: child.volunteerId } });
  if (vol) await sendEmail(vol.email, `New Lemonful session booked with ${child.firstName}`, `Hi ${vol.firstName},\n\n${user.firstName} booked a session for ${child.firstName} on ${fmtDate(when)} at ${fmtTime(when)} (Lesson ${lessonNumber}).\n\nSee it on your schedule: ${process.env.APP_URL ?? ""}/volunteer/schedule`);
  revalidatePath("/parent");
  return { ok: true, id: s.id };
}

export async function cancelSession(sessionId: string) {
  const user = await requireUser(["PARENT", "VOLUNTEER"]);
  const s = await db.tutoringSession.findUnique({ where: { id: sessionId }, include: { child: { include: { parent: true } }, volunteer: true } });
  if (!s || (s.child.parentId !== user.id && s.volunteerId !== user.id)) throw new Error("Not found");
  if (s.status !== "SCHEDULED") return;
  await db.tutoringSession.update({ where: { id: sessionId }, data: { status: "CANCELLED" } });
  const other = user.id === s.volunteerId ? s.child.parent : s.volunteer;
  await sendEmail(other.email, `Lemonful session cancelled`, `Hi ${other.firstName},\n\nThe session for ${s.child.firstName} on ${fmtDate(s.scheduledAt)} at ${fmtTime(s.scheduledAt)} was cancelled by ${user.firstName}. You can book another time from your dashboard.`);
  revalidatePath("/", "layout");
}

export async function leaveFeedback(sessionId: string, _: unknown, form: FormData) {
  const user = await requireUser("PARENT");
  const s = await db.tutoringSession.findFirst({ where: { id: sessionId, child: { parentId: user.id } } });
  if (!s) return { ok: false };
  const rating = z.coerce.number().int().min(1).max(5).safeParse(form.get("rating"));
  if (!rating.success) return { ok: false, error: "Pick a rating" };
  await db.tutoringSession.update({ where: { id: sessionId }, data: { parentRating: rating.data, parentFeedback: String(form.get("feedback") ?? "").slice(0, 2000) } });
  revalidatePath("/parent/sessions");
  return { ok: true };
}

export async function updateAccount(_: unknown, form: FormData) {
  const user = await requireUser();
  const data = z.object({ firstName: z.string().trim().min(1).max(50), lastName: z.string().trim().min(1).max(50), city: z.string().max(80).optional(), postalCode: z.string().max(12).optional() }).safeParse(Object.fromEntries(form));
  if (!data.success) return { ok: false, error: "Please fill in your name." };
  await db.user.update({ where: { id: user.id }, data: data.data });
  revalidatePath("/", "layout");
  return { ok: true, error: "" };
}

export async function deleteAccount(form: FormData) {
  const user = await requireUser();
  if (String(form.get("confirm")).trim().toLowerCase() !== "delete") return;
  await audit(null, "user.delete", `${user.role}:${user.id}`);
  await db.user.delete({ where: { id: user.id } }); // cascades to children, availability, sessions
  await endSession();
  redirect("/");
}
