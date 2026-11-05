"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";
import { TRAINING, TRAINING_MINUTES } from "@/lib/training";
import { updateMilestones, nextLessonFor } from "@/lib/progress";
import { fmtDate, fmtTime } from "@/lib/utils";

export async function completeModule(moduleId: string, answers: number[]) {
  const user = await requireUser("VOLUNTEER");
  const mod = TRAINING.find((m) => m.id === moduleId);
  if (!mod) throw new Error("Unknown module");
  const wrong = mod.quiz.map((q, i) => (answers[i] === q.answer ? -1 : i)).filter((i) => i >= 0);
  if (wrong.length) return { ok: false, wrong };
  const profile = user.volunteerProfile!;
  const done = new Set<string>(JSON.parse(profile.completedModules));
  done.add(moduleId);
  const allDone = TRAINING.every((m) => done.has(m.id));
  await db.volunteerProfile.update({
    where: { userId: user.id },
    data: { completedModules: JSON.stringify([...done]), ...(allDone && profile.status === "PENDING_TRAINING" ? { status: "AWAITING_APPROVAL" } : {}) },
  });
  if (allDone && profile.status === "PENDING_TRAINING") {
    await db.hourEntry.create({ data: { userId: user.id, kind: "TRAINING", minutes: TRAINING_MINUTES, description: "Lemonful volunteer training (5 modules)" } });
    const admins = await db.user.findMany({ where: { role: "ADMIN" } });
    for (const a of admins) await sendEmail(a.email, `Volunteer ready for approval: ${user.firstName} ${user.lastName}`, `${user.firstName} ${user.lastName} (${profile.school}, grade ${profile.grade}) completed training. Review: ${process.env.APP_URL ?? ""}/admin/volunteers`);
  }
  revalidatePath("/volunteer", "layout");
  return { ok: true, allDone };
}

async function ownSession(sessionId: string) {
  const user = await requireUser("VOLUNTEER");
  const s = await db.tutoringSession.findFirst({ where: { id: sessionId, volunteerId: user.id }, include: { child: { include: { parent: true } }, hourEntry: true } });
  if (!s) throw new Error("Not found");
  return { user, s };
}

const notesSchema = z.object({
  summaryForParent: z.string().trim().min(10, "Please write at least a sentence for the parent").max(2000),
  privateNotes: z.string().max(4000).optional().default(""),
  childEngagement: z.coerce.number().int().min(1).max(5),
  lessonCompleted: z.string().optional(),
  concern: z.string().max(4000).optional().default(""),
});

export async function saveNotes(sessionId: string, _: unknown, form: FormData) {
  const { user, s } = await ownSession(sessionId);
  const parsed = notesSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const first = !s.summaryForParent;
  await db.tutoringSession.update({ where: { id: s.id }, data: { summaryForParent: d.summaryForParent, privateNotes: d.privateNotes, childEngagement: d.childEngagement, lessonCompleted: d.lessonCompleted === "on", status: s.status === "SCHEDULED" || s.status === "LIVE" ? "COMPLETED" : s.status } });
  if (d.lessonCompleted === "on") {
    await db.lessonProgress.upsert({ where: { childId_lessonNumber: { childId: s.childId, lessonNumber: s.lessonNumber } }, update: {}, create: { childId: s.childId, lessonNumber: s.lessonNumber } });
  }
  // Writing notes is part of the volunteer's service: credit 10 minutes once.
  if (first && s.hourEntry) await db.hourEntry.update({ where: { id: s.hourEntry.id }, data: { minutes: s.hourEntry.minutes + 10, description: s.hourEntry.description + " + session notes" } });
  await updateMilestones(s.childId);
  if (first) await sendEmail(s.child.parent.email, `${s.child.firstName}'s lesson summary 🍋`, `Hi ${s.child.parent.firstName},\n\nHere's a note from ${user.firstName} about today's lesson:\n\n"${d.summaryForParent}"\n\nSee ${s.child.firstName}'s progress and leave feedback: ${process.env.APP_URL ?? ""}/parent/sessions`);
  if (d.concern.trim()) {
    await audit(user.id, "safeguarding.concern", s.id);
    const admins = await db.user.findMany({ where: { role: "ADMIN" } });
    for (const a of admins) await sendEmail(a.email, `⚠️ Safeguarding concern reported — session ${s.id}`, `Reported by ${user.firstName} ${user.lastName} (${user.email}) about ${s.child.firstName} (child id ${s.childId}).\n\n${d.concern}`);
  }
  revalidatePath("/volunteer", "layout");
  redirect("/volunteer?notes=saved");
}

export async function scheduleForStudent(childId: string, iso: string) {
  const user = await requireUser("VOLUNTEER");
  const child = await db.child.findFirst({ where: { id: childId, volunteerId: user.id }, include: { parent: true } });
  if (!child) return { error: "Not your student" };
  const when = new Date(iso);
  if (isNaN(+when) || +when < Date.now()) return { error: "Pick a future time" };
  const clash = await db.tutoringSession.findFirst({ where: { volunteerId: user.id, scheduledAt: when, status: { in: ["SCHEDULED", "LIVE"] } } });
  if (clash) return { error: "You already have a session then" };
  const lessonNumber = await nextLessonFor(childId);
  await db.tutoringSession.create({ data: { childId, volunteerId: user.id, scheduledAt: when, lessonNumber } });
  await sendEmail(child.parent.email, `Lesson booked for ${child.firstName}`, `Hi ${child.parent.firstName},\n\n${user.firstName} scheduled ${child.firstName}'s next Lemonful lesson for ${fmtDate(when)} at ${fmtTime(when)}. Log in and press "Join lesson" a few minutes before it starts.`);
  revalidatePath("/volunteer", "layout");
  return { ok: true };
}

/** Quick-start: open a session right now with an assigned student (e.g. a rescheduled or make-up lesson). */
export async function startNow(childId: string) {
  const user = await requireUser("VOLUNTEER");
  const child = await db.child.findFirst({ where: { id: childId, volunteerId: user.id } });
  if (!child) throw new Error("Not your student");
  const existing = await db.tutoringSession.findFirst({ where: { childId, volunteerId: user.id, status: { in: ["SCHEDULED", "LIVE"] }, scheduledAt: { lte: new Date(Date.now() + 30 * 60_000) } } });
  const s = existing ?? await db.tutoringSession.create({ data: { childId, volunteerId: user.id, scheduledAt: new Date(), lessonNumber: await nextLessonFor(childId) } });
  redirect(`/session/${s.id}`);
}

export async function setLessonForSession(sessionId: string, lessonNumber: number) {
  const { s } = await ownSession(sessionId);
  if (s.status !== "SCHEDULED") return;
  await db.tutoringSession.update({ where: { id: s.id }, data: { lessonNumber: Math.max(1, Math.min(8, lessonNumber)) } });
  revalidatePath("/volunteer", "layout");
}
