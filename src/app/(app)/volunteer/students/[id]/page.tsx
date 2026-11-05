import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { BackLink, StatusChip } from "@/components/AppShell";
import { LESSONS } from "@/lib/curriculum";
import { MILESTONES } from "@/lib/milestones";
import { READING_LEVELS, avatar, fmtDate, fmtTime } from "@/lib/utils";
import { StartNowButton } from "./StartNow";

export default async function Student({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("VOLUNTEER");
  const c = await db.child.findFirst({ where: { id, volunteerId: user.id }, include: { lessonProgress: true, milestones: true, results: true, sessions: { where: { volunteerId: user.id }, orderBy: { scheduledAt: "desc" } } } });
  if (!c) notFound();
  await audit(user.id, "child.view", c.id);
  const done = new Set(c.lessonProgress.map((l) => l.lessonNumber));
  const welcome = c.results.find((r) => r.activityId.endsWith("welcome"));
  const picks = welcome ? (JSON.parse(welcome.detail).picks ?? {}) : {};
  const practise = new Set<string>();
  for (const r of c.results) { try { (JSON.parse(r.detail).practise ?? []).forEach((w: string) => practise.add(w)); } catch {} }

  return (
    <div className="space-y-6">
      <BackLink href="/volunteer/students">My students</BackLink>
      <div className="flex flex-wrap items-center gap-4">
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-lemon-light text-5xl">{avatar(c.avatar)}</span>
        <div className="flex-1"><h1 className="text-4xl">{c.firstName}</h1><p className="text-navy/70">{c.age} years old · {READING_LEVELS[c.readingLevel]}</p></div>
        <StartNowButton childId={c.id} />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <section className="card p-5"><h2 className="text-xl">About {c.firstName}</h2>
          {c.notes ? <p className="mt-2 text-sm">&ldquo;{c.notes}&rdquo; <span className="text-navy/50">— parent</span></p> : <p className="mt-2 text-sm text-navy/60">No notes from the parent.</p>}
          {Object.keys(picks).length > 0 && <div className="mt-3 rounded-xl bg-cream p-3 text-sm"><p className="font-bold">From your first chat:</p>{Object.entries(picks).map(([k, v]) => <p key={k}>{k === "animal" ? "Would be a" : k === "power" ? "Superpower:" : "Feels about reading:"} <b>{String(v)}</b></p>)}</div>}
        </section>
        <section className="card p-5"><h2 className="text-xl">Milestones</h2>
          <div className="mt-2 flex flex-wrap gap-2">{c.milestones.length ? c.milestones.map((m) => <span key={m.key} className="chip bg-grape-light text-grape">{MILESTONES[m.key]?.emoji} {MILESTONES[m.key]?.title}</span>) : <p className="text-sm text-navy/60">None yet.</p>}</div>
          {practise.size > 0 && <><h3 className="mt-4 font-bold text-sm">Words to practise</h3><div className="mt-1 flex flex-wrap gap-1">{[...practise].map((w) => <span key={w} className="chip bg-coral-light text-coral">{w}</span>)}</div></>}
        </section>
        <section className="card p-5"><h2 className="text-xl">Lessons</h2>
          <ol className="mt-2 grid grid-cols-4 gap-2">{LESSONS.map((l) => <li key={l.number} title={l.title} className={`grid h-10 place-items-center rounded-xl text-sm font-bold ${done.has(l.number) ? "bg-leaf text-white" : l.number < c.startLesson ? "bg-navy/10 text-navy/40" : "bg-navy/5"}`}>{l.number}</li>)}</ol>
          <p className="mt-2 text-xs text-navy/60">Placed at Lesson {c.startLesson} by reading check.</p>
        </section>
      </div>
      <section className="card p-6">
        <h2 className="text-2xl">Session notes</h2>
        <ul className="mt-3 divide-y divide-navy/5">
          {c.sessions.map((s) => (
            <li key={s.id} className="py-3">
              <p className="font-semibold">{fmtDate(s.scheduledAt)} {fmtTime(s.scheduledAt)} · Lesson {s.lessonNumber} <StatusChip status={s.status} /> {s.childEngagement && <span className="text-sm">Engagement {"●".repeat(s.childEngagement)}</span>}</p>
              {s.summaryForParent && <p className="text-sm"><b>Parent summary:</b> {s.summaryForParent}</p>}
              {s.privateNotes && <p className="text-sm text-navy/70"><b>Private notes:</b> {s.privateNotes}</p>}
              {s.parentRating && <p className="text-sm">Parent rated {"⭐".repeat(s.parentRating)} {s.parentFeedback}</p>}
            </li>
          ))}
          {c.sessions.length === 0 && <li className="py-3 text-navy/60">No sessions yet.</li>}
        </ul>
      </section>
    </div>
  );
}
