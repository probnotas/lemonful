"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { sendEmail, appUrl } from "@/lib/email";

export async function setVolunteerStatus(userId: string, status: "APPROVED" | "PAUSED" | "AWAITING_APPROVAL") {
  const admin = await requireUser("ADMIN");
  const v = await db.user.update({ where: { id: userId }, data: { volunteerProfile: { update: { status, approvedAt: status === "APPROVED" ? new Date() : undefined } } } });
  await audit(admin.id, `volunteer.${status.toLowerCase()}`, userId);
  if (status === "APPROVED") await sendEmail(v.email, "You're approved to tutor with Lemonful! 🎉", `Hi ${v.firstName},\n\nWelcome to the team! You're approved as a Lemonful reading volunteer. We'll match you with a student soon — keep an eye on your dashboard: ${appUrl("/volunteer")}`);
  revalidatePath("/admin", "layout");
}

export async function matchChild(childId: string, volunteerId: string | null) {
  const admin = await requireUser("ADMIN");
  const child = await db.child.update({ where: { id: childId }, data: { volunteerId, matchedAt: volunteerId ? new Date() : null }, include: { parent: true, volunteer: true } });
  await audit(admin.id, volunteerId ? "child.match" : "child.unmatch", `${childId}->${volunteerId}`);
  if (child.volunteer) {
    await sendEmail(child.parent.email, `${child.firstName} has been matched with a reading volunteer! 🍋`, `Hi ${child.parent.firstName},\n\nGreat news — ${child.firstName} has been matched with ${child.volunteer.firstName}, a trained Lemonful volunteer. Book your first lesson here: ${appUrl(`/parent/book?child=${child.id}`)}`);
    await sendEmail(child.volunteer.email, `You've been matched with ${child.firstName}!`, `Hi ${child.volunteer.firstName},\n\nYou've been matched with ${child.firstName} (age ${child.age}). Read their profile and get ready: ${appUrl(`/volunteer/students/${child.id}`)}`);
  }
  revalidatePath("/admin", "layout");
}

export async function markHandled(id: string) {
  await requireUser("ADMIN");
  await db.contactMessage.update({ where: { id }, data: { handled: true } });
  revalidatePath("/admin/inbox");
}

export async function adjustHours(userId: string, form: FormData) {
  const admin = await requireUser("ADMIN");
  const minutes = Math.round(Number(form.get("hours")) * 60);
  const description = String(form.get("description") || "Manual adjustment");
  if (!Number.isFinite(minutes) || minutes === 0) return;
  await db.hourEntry.create({ data: { userId, minutes, kind: "ADJUSTMENT", description } });
  await audit(admin.id, "hours.adjust", `${userId}:${minutes}`);
  revalidatePath("/admin", "layout");
}
