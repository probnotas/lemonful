import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Stat } from "@/components/AppShell";
import { fmtHours } from "@/lib/utils";

export const metadata = { title: "Admin" };

export default async function Admin() {
  await requireUser("ADMIN");
  const [families, children, unmatched, volunteers, pending, sessions, minutes, readers, messages, live] = await Promise.all([
    db.user.count({ where: { role: "PARENT" } }),
    db.child.count(),
    db.child.count({ where: { volunteerId: null } }),
    db.volunteerProfile.count({ where: { status: "APPROVED" } }),
    db.volunteerProfile.count({ where: { status: "AWAITING_APPROVAL" } }),
    db.tutoringSession.count({ where: { status: "COMPLETED" } }),
    db.hourEntry.aggregate({ _sum: { minutes: true } }),
    db.milestone.count({ where: { key: "reader" } }),
    db.contactMessage.count({ where: { handled: false } }),
    db.tutoringSession.findMany({ where: { status: "LIVE" }, include: { child: true, volunteer: true } }),
  ]);
  return (
    <div className="space-y-8">
      <PageHeader title="Lemonful admin" sub="Program overview and to-dos." />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Stat label="Families" value={families} tone="coral" sub={`${children} children`} />
        <Stat label="Active volunteers" value={volunteers} tone="teal" />
        <Stat label="Lessons taught" value={sessions} tone="grape" />
        <Stat label="Volunteer hours" value={fmtHours(minutes._sum.minutes ?? 0)} tone="lemon" sub={`${readers} children finished the journey`} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/volunteers" className="card p-6 hover:-translate-y-0.5 transition"><p className="font-display text-5xl font-bold text-teal">{pending}</p><p className="font-bold">Volunteers awaiting approval</p></Link>
        <Link href="/admin/matching" className="card p-6 hover:-translate-y-0.5 transition"><p className="font-display text-5xl font-bold text-coral">{unmatched}</p><p className="font-bold">Children waiting for a match</p></Link>
        <Link href="/admin/inbox" className="card p-6 hover:-translate-y-0.5 transition"><p className="font-display text-5xl font-bold text-grape">{messages}</p><p className="font-bold">Unread contact messages</p></Link>
      </div>
      <section className="card p-6"><h2 className="text-2xl">Live right now</h2>
        {live.length === 0 ? <p className="text-navy/60 mt-1">No sessions in progress.</p> : <ul className="mt-2">{live.map((s) => <li key={s.id} className="py-1">● {s.volunteer.firstName} with {s.child.firstName} — Lesson {s.lessonNumber}</li>)}</ul>}
      </section>
    </div>
  );
}
