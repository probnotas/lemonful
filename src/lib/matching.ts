import "server-only";
import { db } from "./db";

/** Rank approved volunteers for a child by shared weekly availability and current load. */
export async function suggestVolunteers(childId: string) {
  const child = await db.child.findUnique({ where: { id: childId }, include: { parent: { include: { availability: true } } } });
  if (!child) return [];
  const family = new Set(child.parent.availability.map((a) => `${a.day}-${a.hour}`));
  const vols = await db.user.findMany({
    where: { role: "VOLUNTEER", volunteerProfile: { status: "APPROVED" } },
    include: { availability: true, volunteerProfile: true, _count: { select: { assignedChildren: true } } },
  });
  return vols
    .map((v) => {
      const overlap = v.availability.filter((a) => family.has(`${a.day}-${a.hour}`));
      const load = v._count.assignedChildren;
      const cap = v.volunteerProfile?.maxStudents ?? 2;
      return { volunteer: v, overlap, load, cap, score: overlap.length * 10 - load * 5 };
    })
    .filter((r) => r.overlap.length > 0 && r.load < r.cap)
    .sort((a, b) => b.score - a.score);
}

/** Next concrete datetimes (in the next `days` days) where both users are available. */
export async function sharedUpcomingSlots(userA: string, userB: string, days = 21) {
  const [a, b] = await Promise.all([
    db.availability.findMany({ where: { userId: userA } }),
    db.availability.findMany({ where: { userId: userB } }),
  ]);
  const bSet = new Set(b.map((x) => `${x.day}-${x.hour}`));
  const shared = a.filter((x) => bSet.has(`${x.day}-${x.hour}`));
  const out: Date[] = [];
  const now = new Date();
  for (let d = 1; d <= days; d++) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    for (const s of shared) if (s.day === date.getDay()) out.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), s.hour));
  }
  return out.sort((x, y) => +x - +y);
}
