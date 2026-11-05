import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { scoreRoom, type RoomState } from "@/lib/room-state";
import { updateMilestones } from "@/lib/progress";

/**
 * Volunteer ends a live session: persist activity results, mark it completed and
 * credit community-service hours automatically.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSession();
  if (!user || user.role !== "VOLUNTEER") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const s = await db.tutoringSession.findFirst({ where: { id, volunteerId: user.sub } });
  if (!s) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (s.status === "COMPLETED" || s.status === "CANCELLED") return NextResponse.json({ ok: true });

  // Prefer the server's authoritative room state; fall back to the volunteer's copy.
  const rooms = (globalThis as unknown as { __lemonfulRooms?: Map<string, RoomState> }).__lemonfulRooms;
  let state = rooms?.get(id);
  if (!state) {
    const body = await req.json().catch(() => null);
    if (body?.state?.lessonNumber === s.lessonNumber) state = body.state as RoomState;
  }

  const endedAt = new Date();
  const startedAt = s.startedAt ?? endedAt;
  const actual = Math.round((+endedAt - +startedAt) / 60_000);
  const minutes = Math.min(75, Math.max(5, Math.ceil(actual / 5) * 5));

  await db.$transaction(async (tx) => {
    await tx.tutoringSession.update({ where: { id }, data: { status: "COMPLETED", startedAt, endedAt } });
    if (state) {
      const scores = scoreRoom(state);
      if (scores.length) await tx.activityResult.createMany({ data: scores.map((r) => ({ sessionId: id, childId: s.childId, activityId: r.activityId, correct: r.correct, total: r.total, detail: JSON.stringify(r.detail) })) });
    }
    await tx.hourEntry.upsert({
      where: { sessionId: id },
      update: {},
      create: { userId: user.sub, kind: "SESSION", minutes, sessionId: id, description: `Tutoring session — Lesson ${s.lessonNumber}`, date: startedAt },
    });
  });
  rooms?.delete(id);
  await updateMilestones(s.childId);
  return NextResponse.json({ ok: true, minutes, reachedEnd: state ? state.stepIndex : 0 });
}
