import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { avatar } from "@/lib/utils";
import { SessionRoom } from "@/components/room/SessionRoom";

export const metadata = { title: "Lesson" };

export default async function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(["PARENT", "VOLUNTEER"]);
  const s = await db.tutoringSession.findUnique({ where: { id }, include: { child: true, volunteer: { select: { firstName: true } } } });
  if (!s || (s.volunteerId !== user.id && s.child.parentId !== user.id)) notFound();
  if (s.status === "COMPLETED") redirect(user.role === "VOLUNTEER" ? `/volunteer/sessions/${s.id}/notes` : "/parent/sessions");
  if (s.status === "CANCELLED") redirect(user.role === "VOLUNTEER" ? "/volunteer/schedule" : "/parent/sessions");
  await audit(user.id, "session.join", s.id);
  return <SessionRoom sessionId={s.id} childName={s.child.firstName} childAvatar={avatar(s.child.avatar)} volunteerName={s.volunteer.firstName} />;
}
