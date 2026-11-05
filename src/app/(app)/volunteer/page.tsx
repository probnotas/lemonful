import Link from "next/link";
import { Video, GraduationCap, Hourglass, PartyPopper } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { volunteerStats } from "@/lib/progress";
import { Stat, StatusChip } from "@/components/AppShell";
import { getLesson } from "@/lib/curriculum";
import { VOLUNTEER_ACHIEVEMENTS } from "@/lib/milestones";
import { TRAINING } from "@/lib/training";
import { avatar, fmtDate, fmtHours, fmtTime } from "@/lib/utils";

export const metadata = { title: "Volunteer dashboard" };

export default async function VolunteerHome({ searchParams }: { searchParams: Promise<{ notes?: string }> }) {
  const user = await requireUser("VOLUNTEER");
  const { notes } = await searchParams;
  const p = user.volunteerProfile!;
  const [stats, upcoming, needNotes, students] = await Promise.all([
    volunteerStats(user.id),
    db.tutoringSession.findMany({ where: { volunteerId: user.id, status: { in: ["SCHEDULED", "LIVE"] } }, include: { child: true }, orderBy: { scheduledAt: "asc" }, take: 5 }),
    db.tutoringSession.findMany({ where: { volunteerId: user.id, status: "COMPLETED", summaryForParent: null }, include: { child: true } }),
    db.child.findMany({ where: { volunteerId: user.id }, include: { lessonProgress: true } }),
  ]);
  const done = JSON.parse(p.completedModules).length;
  const next = upcoming[0];

  return (
    <div className="space-y-8">
      {notes && <p className="rounded-2xl bg-leaf-light p-4 font-semibold text-leaf">✓ Notes saved and sent to the family. Thank you!</p>}
      {p.status === "PENDING_TRAINING" && (
        <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-teal-light p-6">
          <GraduationCap className="h-10 w-10 text-teal" />
          <div className="flex-1"><h2 className="text-2xl">Finish your training to start tutoring</h2><p className="text-navy/75">{done} of {TRAINING.length} modules complete. Training counts toward your community-service hours!</p></div>
          <Link href="/volunteer/training" className="btn-teal">Continue training</Link>
        </div>
      )}
      {p.status === "AWAITING_APPROVAL" && (
        <div className="flex items-center gap-4 rounded-3xl bg-lemon-light p-6"><Hourglass className="h-10 w-10 text-lemon-dark" /><div><h2 className="text-2xl">Training complete — you&apos;re awaiting approval</h2><p className="text-navy/75">A Lemonful staff member will review your application and match you with a student. Meanwhile, explore the lesson library and try practice mode!</p></div></div>
      )}
      {needNotes.map((s) => (
        <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-coral-light p-4"><span>📝</span><p className="flex-1 font-semibold">Write your notes for {s.child.firstName}&apos;s lesson on {fmtDate(s.scheduledAt)}</p><Link href={`/volunteer/sessions/${s.id}/notes`} className="btn-coral btn-sm">Write notes</Link></div>
      ))}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card p-6">
          <h2 className="text-2xl">Hi {user.firstName}! 👋</h2>
          {next ? (
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-3xl bg-cream p-5">
              <span className="text-5xl">{avatar(next.child.avatar)}</span>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase text-navy/60">Next session</p>
                <p className="text-xl font-bold">{next.child.firstName} · {fmtDate(next.scheduledAt)} at {fmtTime(next.scheduledAt)}</p>
                <p className="text-sm text-navy/70">Lesson {next.lessonNumber}: {getLesson(next.lessonNumber)?.title} <StatusChip status={next.status} /></p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/session/${next.id}`} className="btn-coral"><Video size={18} /> {next.status === "LIVE" ? "Rejoin" : "Start lesson"}</Link>
                <Link href={`/volunteer/lessons/${next.lessonNumber}`} className="text-center text-sm font-semibold underline">Preview script</Link>
              </div>
            </div>
          ) : <p className="mt-3 text-navy/70">{p.status === "APPROVED" ? "No sessions scheduled. Families book from your availability, or you can schedule from the Schedule page." : "Once you're approved and matched, your sessions will appear here."}</p>}
          {upcoming.length > 1 && (
            <ul className="mt-4 divide-y divide-navy/5">
              {upcoming.slice(1).map((s) => <li key={s.id} className="flex justify-between py-2 text-sm"><span>{s.child.firstName} — Lesson {s.lessonNumber}</span><span className="text-navy/60">{fmtDate(s.scheduledAt)} {fmtTime(s.scheduledAt)}</span></li>)}
            </ul>
          )}
        </section>
        <section className="card p-6">
          <h2 className="text-2xl">My students</h2>
          {students.length === 0 ? <p className="mt-2 text-navy/60">No students yet.</p> : (
            <ul className="mt-3 space-y-3">
              {students.map((c) => (
                <li key={c.id}><Link href={`/volunteer/students/${c.id}`} className="flex items-center gap-3 rounded-2xl p-2 hover:bg-cream">
                  <span className="text-3xl">{avatar(c.avatar)}</span>
                  <div className="flex-1"><p className="font-bold">{c.firstName}, {c.age}</p><div className="mt-1 h-2 rounded-full bg-navy/10"><div className="h-2 rounded-full bg-teal" style={{ width: `${(c.lessonProgress.length / 8) * 100}%` }} /></div></div>
                  <span className="text-xs text-navy/60">{c.lessonProgress.length}/8</span>
                </Link></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <h2 className="text-2xl mb-3">Your impact</h2>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Stat label="Community hours" value={fmtHours(stats.minutes)} sub="tracked automatically" tone="teal" />
          <Stat label="Sessions taught" value={stats.sessions} tone="coral" />
          <Stat label="Kids tutored" value={stats.kids} sub={`${stats.wordReaders} now reading words`} tone="grape" />
          <Stat label="New readers" value={stats.readers} sub="completed all 8 lessons" tone="lemon" />
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between"><h2 className="text-2xl">Achievements</h2><PartyPopper className="text-coral" /></div>
        <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {VOLUNTEER_ACHIEVEMENTS.map((a) => {
            const got = a.test(stats);
            return <div key={a.key} className={`rounded-2xl p-3 text-center ${got ? "bg-lemon-light" : "bg-navy/5 opacity-50 grayscale"}`}><p className="text-3xl">{a.emoji}</p><p className="text-xs font-bold mt-1">{a.title}</p></div>;
          })}
        </div>
      </section>
    </div>
  );
}
