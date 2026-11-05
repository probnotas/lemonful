import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Lock, Star } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { BackLink, StatusChip } from "@/components/AppShell";
import { LESSONS, BOOKS } from "@/lib/curriculum";
import { MILESTONES } from "@/lib/milestones";
import { READING_LEVELS, avatar, fmtDate, fmtTime } from "@/lib/utils";
import { EditChild } from "./EditChild";

export default async function ChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("PARENT");
  const child = await db.child.findFirst({
    where: { id, parentId: user.id },
    include: {
      volunteer: { select: { firstName: true } },
      lessonProgress: true, milestones: true, results: true,
      sessions: { orderBy: { scheduledAt: "desc" } },
    },
  });
  if (!child) notFound();
  await audit(user.id, "child.view", child.id);
  const done = new Set(child.lessonProgress.map((l) => l.lessonNumber));
  const earned = new Map(child.milestones.map((m) => [m.key, m.achievedAt]));
  const practised = new Set<string>();
  const mastered = new Set<string>();
  for (const r of child.results) {
    try {
      const d = JSON.parse(r.detail);
      (d.letters ?? []).forEach((l: string) => practised.add(l));
      (d.words ?? []).forEach((w: string) => practised.add(w));
      (d.mastered ?? []).forEach((w: string) => mastered.add(w));
    } catch {}
  }
  const assessment = child.assessment ? JSON.parse(child.assessment) : null;

  return (
    <div className="space-y-8">
      <BackLink href="/parent">Dashboard</BackLink>
      <div className="flex flex-wrap items-center gap-5">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-lemon-light text-5xl">{avatar(child.avatar)}</span>
        <div className="flex-1">
          <h1 className="text-4xl">{child.firstName}&apos;s reading journey</h1>
          <p className="text-navy/70">{child.age} years old · {READING_LEVELS[child.readingLevel]} · {child.volunteer ? `Tutor: ${child.volunteer.firstName}` : "Awaiting volunteer match"}</p>
        </div>
        <Link href={`/parent/children/${child.id}/assessment`} className="btn-ghost btn-sm">{child.assessedAt ? "Retake reading check" : "Take reading check"}</Link>
      </div>

      {/* Journey path */}
      <section className="card p-6">
        <h2 className="text-2xl">Lessons</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LESSONS.map((l) => {
            const isDone = done.has(l.number);
            const skipped = l.number < child.startLesson && !isDone;
            return (
              <li key={l.number} className={`rounded-2xl p-4 border-2 ${isDone ? "border-leaf bg-leaf-light" : skipped ? "border-navy/10 bg-navy/5" : "border-navy/10 bg-white"}`}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-bold">Lesson {l.number}</span>
                  {isDone ? <Check className="text-leaf" /> : skipped ? <span className="chip bg-white text-navy/60">Placed past</span> : <Lock size={16} className="text-navy/30" />}
                </div>
                <p className="font-semibold">{l.title}</p>
                <p className="text-xs text-navy/65">{l.focus}</p>
                {l.book && <p className="mt-1 text-xs text-teal font-semibold">📖 {BOOKS[l.book].title}</p>}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-2xl">Milestones</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(MILESTONES).map(([k, m]) => {
              const at = earned.get(k);
              return (
                <div key={k} title={m.description} className={`rounded-2xl p-3 text-center ${at ? "bg-grape-light" : "bg-navy/5 opacity-50 grayscale"}`}>
                  <p className="text-3xl">{m.emoji}</p>
                  <p className="text-xs font-bold leading-tight mt-1">{m.title}</p>
                  {at && <p className="text-[10px] text-navy/60">{fmtDate(at)}</p>}
                </div>
              );
            })}
          </div>
        </section>
        <section className="card p-6">
          <h2 className="text-2xl">Skills practised</h2>
          {practised.size === 0 && mastered.size === 0 ? <p className="mt-2 text-navy/60">Skills will appear here after the first lesson.</p> : (
            <>
              <div className="mt-3 flex flex-wrap gap-2">{[...practised].map((s) => <span key={s} className="chip bg-teal-light text-teal text-sm">{s}</span>)}</div>
              {mastered.size > 0 && <><p className="mt-4 text-sm font-bold">Tricky words mastered</p><div className="mt-2 flex flex-wrap gap-2">{[...mastered].map((s) => <span key={s} className="chip bg-lemon-light text-navy text-sm"><Star size={12} className="fill-lemon text-lemon" /> {s}</span>)}</div></>}
            </>
          )}
          {assessment && (
            <div className="mt-6 rounded-2xl bg-cream p-4 text-sm">
              <p className="font-bold">Reading check ({fmtDate(child.assessedAt!)})</p>
              <p>Letter sounds: {assessment.score.sounds}/8 · Blending: {assessment.score.blend}/4 · Tricky words: {assessment.score.sight}/4 → Starting at <b>Lesson {child.startLesson}</b></p>
            </div>
          )}
        </section>
      </div>

      <section className="card p-6">
        <h2 className="text-2xl">Session history &amp; tutor notes</h2>
        {child.sessions.length === 0 ? <p className="mt-2 text-navy/60">No sessions yet.</p> : (
          <ul className="mt-4 divide-y divide-navy/5">
            {child.sessions.map((s) => (
              <li key={s.id} className="py-4 flex flex-wrap gap-4">
                <div className="w-40 shrink-0"><p className="font-bold">{fmtDate(s.scheduledAt)}</p><p className="text-sm text-navy/60">{fmtTime(s.scheduledAt)}</p></div>
                <div className="flex-1 min-w-[200px]">
                  <p className="font-semibold">Lesson {s.lessonNumber}: {LESSONS[s.lessonNumber - 1]?.title} <StatusChip status={s.status} /></p>
                  {s.summaryForParent && <p className="mt-1 rounded-xl bg-teal-light/60 p-3 text-sm">💬 {s.summaryForParent}</p>}
                  {s.parentRating && <p className="mt-1 text-sm">Your rating: {"⭐".repeat(s.parentRating)}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <EditChild child={{ id: child.id, firstName: child.firstName, age: child.age, readingLevel: child.readingLevel, notes: child.notes, avatar: child.avatar }} />
    </div>
  );
}
