import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { sharedUpcomingSlots } from "@/lib/matching";
import { nextLessonFor } from "@/lib/progress";
import { PageHeader, Empty } from "@/components/AppShell";
import { getLesson } from "@/lib/curriculum";
import { avatar, fmtDate, fmtTime } from "@/lib/utils";
import { SlotPicker } from "./SlotPicker";

export const metadata = { title: "Book a lesson" };

export default async function Book({ searchParams }: { searchParams: Promise<{ child?: string }> }) {
  const user = await requireUser("PARENT");
  const { child: only } = await searchParams;
  const children = await db.child.findMany({ where: { parentId: user.id, ...(only ? { id: only } : {}) }, include: { volunteer: true, sessions: { where: { status: { in: ["SCHEDULED", "LIVE"] } }, orderBy: { scheduledAt: "asc" } } } });
  if (!children.length) return <Empty emoji="🧒" title="Add a child first" action={<Link href="/parent/children/new" className="btn-coral">Add a child</Link>} />;

  const blocks = await Promise.all(children.map(async (c) => {
    if (!c.volunteer) return { c, slots: [] as Date[], next: 1 };
    const [slots, taken, next] = await Promise.all([
      sharedUpcomingSlots(user.id, c.volunteer.id),
      db.tutoringSession.findMany({ where: { volunteerId: c.volunteer.id, status: { in: ["SCHEDULED", "LIVE"] }, scheduledAt: { gte: new Date() } }, select: { scheduledAt: true } }),
      nextLessonFor(c.id),
    ]);
    const takenSet = new Set(taken.map((t) => +t.scheduledAt));
    return { c, slots: slots.filter((s) => !takenSet.has(+s)), next };
  }));

  return (
    <div>
      <PageHeader title="Book a lesson" sub="Times shown are when both your family and your child's tutor are available." />
      <div className="space-y-6">
        {blocks.map(({ c, slots, next }) => (
          <section key={c.id} className="card p-6">
            <div className="flex items-center gap-3"><span className="text-4xl">{avatar(c.avatar)}</span><div><h2 className="text-2xl">{c.firstName}</h2>
              <p className="text-sm text-navy/70">{c.volunteer ? <>with {c.volunteer.firstName} · Next up: Lesson {next} — {getLesson(next)?.title}</> : "Not matched yet"}</p></div></div>
            {c.sessions.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{c.sessions.map((s) => <span key={s.id} className="chip bg-teal-light text-teal text-sm">📅 {fmtDate(s.scheduledAt)} {fmtTime(s.scheduledAt)}</span>)}</div>}
            {!c.volunteer ? (
              <p className="mt-4 rounded-2xl bg-lemon-light p-4 text-sm">We&apos;re finding a volunteer whose schedule matches yours. You&apos;ll get an email as soon as {c.firstName} is matched. Adding more availability can speed this up — <Link href="/parent/settings#availability" className="underline">update availability</Link>.</p>
            ) : slots.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-lemon-light p-4 text-sm">No shared times in the next 3 weeks. Try <Link href="/parent/settings#availability" className="underline">adding more availability</Link>.</p>
            ) : <SlotPicker childId={c.id} slots={slots.map((s) => s.toISOString())} />}
          </section>
        ))}
      </div>
    </div>
  );
}
