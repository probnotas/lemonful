import "server-only";
import { db } from "./db";
import { TOTAL_LESSONS } from "./curriculum";

/** Award any milestones the child has newly earned. Returns keys awarded. */
export async function updateMilestones(childId: string) {
  const [lessons, results, sessions, existing] = await Promise.all([
    db.lessonProgress.findMany({ where: { childId } }),
    db.activityResult.findMany({ where: { childId } }),
    db.tutoringSession.count({ where: { childId, status: "COMPLETED" } }),
    db.milestone.findMany({ where: { childId } }),
  ]);
  const have = new Set(existing.map((m) => m.key));
  const earn: string[] = [];
  const done = new Set(lessons.map((l) => l.lessonNumber));
  if (sessions >= 1) earn.push("first-session");
  if (sessions >= 5) earn.push("five-sessions");
  if (results.some((r) => r.activityId === "l1-buckets" && r.correct >= 10)) earn.push("satpin");
  if (results.some((r) => /blend|build/.test(r.activityId) && r.correct >= 1)) earn.push("first-word");
  if (results.some((r) => r.activityId.endsWith("story") && r.correct >= r.total)) earn.push("first-book");
  const mastered = new Set<string>();
  for (const r of results.filter((r) => r.activityId.includes("sight"))) {
    try { (JSON.parse(r.detail).mastered ?? []).forEach((w: string) => mastered.add(w)); } catch {}
  }
  if (mastered.size >= 10) earn.push("sight-words");
  if (done.size >= 4) earn.push("halfway");
  if (done.size >= TOTAL_LESSONS) earn.push("reader");
  const fresh = earn.filter((k) => !have.has(k));
  if (fresh.length) await db.milestone.createMany({ data: fresh.map((key) => ({ childId, key })) });
  return fresh;
}

export async function nextLessonFor(childId: string) {
  const child = await db.child.findUnique({ where: { id: childId }, include: { lessonProgress: true } });
  if (!child) return 1;
  const done = new Set(child.lessonProgress.map((l) => l.lessonNumber));
  for (let n = child.startLesson; n <= TOTAL_LESSONS; n++) if (!done.has(n)) return n;
  return TOTAL_LESSONS;
}

export async function volunteerStats(userId: string) {
  const [hours, sessions, kids, profile] = await Promise.all([
    db.hourEntry.aggregate({ where: { userId }, _sum: { minutes: true } }),
    db.tutoringSession.findMany({ where: { volunteerId: userId, status: "COMPLETED" }, select: { childId: true } }),
    db.child.findMany({ where: { OR: [{ volunteerId: userId }, { sessions: { some: { volunteerId: userId, status: "COMPLETED" } } }] }, select: { id: true, milestones: { where: { key: { in: ["reader", "first-word"] } } } } }),
    db.volunteerProfile.findUnique({ where: { userId } }),
  ]);
  const taught = new Set(sessions.map((s) => s.childId));
  return {
    minutes: hours._sum.minutes ?? 0,
    sessions: sessions.length,
    kids: taught.size,
    readers: kids.filter((k) => k.milestones.some((m) => m.key === "reader")).length,
    wordReaders: kids.filter((k) => k.milestones.some((m) => m.key === "first-word")).length,
    trained: profile?.status === "APPROVED" || profile?.status === "AWAITING_APPROVAL",
  };
}
