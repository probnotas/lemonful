import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatusChip } from "@/components/AppShell";
import { AvailabilityEditor } from "@/components/forms/SettingsForms";
import { sharedUpcomingSlots } from "@/lib/matching";
import { getLesson } from "@/lib/curriculum";
import { avatar, fmtDate, fmtTime } from "@/lib/utils";
import { CancelButton } from "../../parent/sessions/SessionForms";
import { ScheduleFor } from "./ScheduleFor";

export const metadata = { title: "Schedule" };

export default async function Schedule() {
  const user = await requireUser("VOLUNTEER");
  const [sessions, slots, kids] = await Promise.all([
    db.tutoringSession.findMany({ where: { volunteerId: user.id, status: { in: ["SCHEDULED", "LIVE"] } }, include: { child: true }, orderBy: { scheduledAt: "asc" } }),
    db.availability.findMany({ where: { userId: user.id }, select: { day: true, hour: true } }),
    db.child.findMany({ where: { volunteerId: user.id } }),
  ]);
  const options = await Promise.all(kids.map(async (k) => ({ id: k.id, name: k.firstName, slots: (await sharedUpcomingSlots(user.id, k.parentId)).filter((d) => !sessions.some((s) => +s.scheduledAt === +d)).slice(0, 12).map((d) => d.toISOString()) })));
  return (
    <div className="space-y-8">
      <PageHeader title="My schedule" />
      <section className="card p-6">
        <h2 className="text-2xl">Upcoming sessions</h2>
        {sessions.length === 0 ? <p className="mt-2 text-navy/60">Nothing scheduled.</p> : (
          <ul className="mt-3 divide-y divide-navy/5">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 py-3">
                <span className="text-3xl">{avatar(s.child.avatar)}</span>
                <div className="flex-1"><p className="font-bold">{fmtDate(s.scheduledAt)} · {fmtTime(s.scheduledAt)} — {s.child.firstName}</p><p className="text-sm text-navy/70">Lesson {s.lessonNumber}: {getLesson(s.lessonNumber)?.title} <StatusChip status={s.status} /></p></div>
                <Link href={`/session/${s.id}`} className="btn-coral btn-sm">Start</Link>
                <CancelButton id={s.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
      {options.length > 0 && <section className="card p-6"><h2 className="text-2xl">Schedule a session</h2><p className="text-sm text-navy/70">Times when you and the family are both available.</p><ScheduleFor students={options} /></section>}
      <section className="card p-6"><h2 className="text-2xl mb-1">My weekly availability</h2><p className="mb-4 text-sm text-navy/70">Families can book lessons in these windows.</p><AvailabilityEditor initial={slots} /></section>
    </div>
  );
}
