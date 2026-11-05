import Image from "next/image";
import Link from "next/link";
import { Video, CalendarPlus, BookOpen, Sparkles, ClipboardCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Empty, StatusChip } from "@/components/AppShell";
import { TOTAL_LESSONS, getLesson } from "@/lib/curriculum";
import { MILESTONES } from "@/lib/milestones";
import { avatar, canJoin, fmtDate, fmtTime } from "@/lib/utils";

export const metadata = { title: "Parent dashboard" };

export default async function ParentHome({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser("PARENT");
  const { welcome } = await searchParams;
  const children = await db.child.findMany({
    where: { parentId: user.id },
    include: {
      volunteer: { select: { firstName: true } },
      lessonProgress: true,
      milestones: { orderBy: { achievedAt: "desc" } },
      sessions: { where: { status: { in: ["SCHEDULED", "LIVE"] } }, orderBy: { scheduledAt: "asc" }, take: 3 },
    },
    orderBy: { createdAt: "asc" },
  });
  const needFeedback = await db.tutoringSession.count({ where: { child: { parentId: user.id }, status: "COMPLETED", parentRating: null } });

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-lemon-light to-coral-light/70 p-8">
        <h1 className="text-4xl">{welcome ? `Welcome to Lemonful, ${user.firstName}! 🎉` : `Hi ${user.firstName}!`}</h1>
        <p className="mt-2 max-w-xl text-navy/80">{welcome ? "Your account is active. Start with a quick 5-minute reading check for your child so we can tailor their lessons." : "Here's how your little reader is doing."}</p>
        {needFeedback > 0 && <Link href="/parent/sessions" className="btn-coral btn-sm mt-4">Share feedback on {needFeedback} lesson{needFeedback > 1 ? "s" : ""}</Link>}
        <Image src="/art/bear-heart.png" alt="" width={170} height={122} className="absolute bottom-0 right-6 hidden md:block rounded-2xl" />
      </section>

      {children.length === 0 ? (
        <Empty emoji="🧒" title="Add your child" body="Tell us about your child so we can match them with a volunteer." action={<Link href="/parent/children/new" className="btn-coral">Add a child</Link>} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {children.map((c) => {
            const done = c.lessonProgress.length;
            const next = c.sessions[0];
            return (
              <article key={c.id} className="card p-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-lemon-light text-4xl">{avatar(c.avatar)}</span>
                  <div className="flex-1">
                    <h2 className="text-2xl">{c.firstName}</h2>
                    <p className="text-sm text-navy/70">{c.age} years old · {c.volunteer ? <>Tutor: <b>{c.volunteer.firstName}</b></> : <span className="text-coral font-semibold">Finding the perfect volunteer…</span>}</p>
                  </div>
                  <Link href={`/parent/children/${c.id}`} className="btn-ghost btn-sm">Progress</Link>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between text-sm font-semibold"><span>Reading journey</span><span>{done} of {TOTAL_LESSONS} lessons</span></div>
                  <div className="mt-1 h-3 rounded-full bg-navy/10"><div className="h-3 rounded-full bg-gradient-to-r from-lemon to-coral" style={{ width: `${(done / TOTAL_LESSONS) * 100}%` }} /></div>
                </div>
                {c.milestones.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">{c.milestones.slice(0, 4).map((m) => <span key={m.key} className="chip bg-grape-light text-grape">{MILESTONES[m.key]?.emoji} {MILESTONES[m.key]?.title}</span>)}</div>
                )}
                <div className="mt-5 rounded-2xl bg-cream p-4">
                  {!c.assessedAt ? (
                    <div className="flex items-center justify-between gap-3"><p className="text-sm"><ClipboardCheck className="inline text-teal mr-1" size={18} /> Take the 5-minute reading check so we can place {c.firstName} at the right lesson.</p><Link href={`/parent/children/${c.id}/assessment`} className="btn-teal btn-sm shrink-0">Start</Link></div>
                  ) : next ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase text-navy/60">Next lesson</p>
                        <p className="font-bold">{fmtDate(next.scheduledAt)} · {fmtTime(next.scheduledAt)}</p>
                        <p className="text-sm text-navy/70">Lesson {next.lessonNumber}: {getLesson(next.lessonNumber)?.title} <StatusChip status={next.status} /></p>
                      </div>
                      {canJoin(next) ? <Link href={`/session/${next.id}`} className="btn-coral"><Video size={18} /> Join lesson</Link> : <span className="text-xs text-navy/60 max-w-[10rem] text-right">The Join button appears 30 minutes before the lesson.</span>}
                    </div>
                  ) : c.volunteerId ? (
                    <div className="flex items-center justify-between gap-3"><p className="text-sm">No lesson booked yet.</p><Link href={`/parent/book?child=${c.id}`} className="btn-coral btn-sm"><CalendarPlus size={16} /> Book a lesson</Link></div>
                  ) : (
                    <p className="text-sm"><Sparkles className="inline text-lemon-dark mr-1" size={18} /> We&apos;re matching {c.firstName} with a volunteer based on your availability. We&apos;ll email you as soon as it&apos;s confirmed!</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/parent/children/new" className="card p-5 hover:-translate-y-0.5 transition"><p className="text-3xl">➕</p><p className="mt-2 font-bold">Add another child</p></Link>
        <Link href="/parent/resources" className="card p-5 hover:-translate-y-0.5 transition"><BookOpen className="text-teal" /><p className="mt-2 font-bold">Parent resources</p><p className="text-sm text-navy/70">Tips to practise reading at home</p></Link>
        <Link href="/parent/settings#availability" className="card p-5 hover:-translate-y-0.5 transition"><CalendarPlus className="text-coral" /><p className="mt-2 font-bold">Update availability</p><p className="text-sm text-navy/70">Change the times that work for you</p></Link>
      </div>
    </div>
  );
}
