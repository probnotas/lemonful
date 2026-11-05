import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, StatusChip, Empty } from "@/components/AppShell";
import { getLesson } from "@/lib/curriculum";
import { avatar, canJoin, fmtDate, fmtTime } from "@/lib/utils";
import { FeedbackForm, CancelButton } from "./SessionForms";

export const metadata = { title: "Lessons" };

export default async function Sessions() {
  const user = await requireUser("PARENT");
  const sessions = await db.tutoringSession.findMany({ where: { child: { parentId: user.id } }, include: { child: true, volunteer: { select: { firstName: true } } }, orderBy: { scheduledAt: "desc" } });
  const upcoming = sessions.filter((s) => ["SCHEDULED", "LIVE"].includes(s.status)).reverse();
  const past = sessions.filter((s) => !["SCHEDULED", "LIVE"].includes(s.status));
  return (
    <div className="space-y-8">
      <PageHeader title="Lessons" action={<Link href="/parent/book" className="btn-coral btn-sm">Book a lesson</Link>} />
      <section>
        <h2 className="text-2xl mb-3">Upcoming</h2>
        {upcoming.length === 0 ? <Empty emoji="📅" title="No upcoming lessons" action={<Link href="/parent/book" className="btn-coral btn-sm">Book one</Link>} /> : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((s) => (
              <div key={s.id} className="card p-5 flex items-center gap-4">
                <span className="text-4xl">{avatar(s.child.avatar)}</span>
                <div className="flex-1">
                  <p className="font-bold">{s.child.firstName} · {fmtDate(s.scheduledAt)} at {fmtTime(s.scheduledAt)}</p>
                  <p className="text-sm text-navy/70">Lesson {s.lessonNumber}: {getLesson(s.lessonNumber)?.title} with {s.volunteer.firstName} <StatusChip status={s.status} /></p>
                </div>
                {canJoin(s) ? <Link href={`/session/${s.id}`} className="btn-coral btn-sm">Join</Link> : <CancelButton id={s.id} />}
              </div>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="text-2xl mb-3">History &amp; feedback</h2>
        {past.length === 0 ? <p className="text-navy/60">Completed lessons will appear here with notes from the tutor.</p> : (
          <div className="space-y-4">
            {past.map((s) => (
              <div key={s.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl">{avatar(s.child.avatar)}</span>
                  <p className="font-bold">{s.child.firstName} · {fmtDate(s.scheduledAt)}</p>
                  <span className="text-sm text-navy/70">Lesson {s.lessonNumber}: {getLesson(s.lessonNumber)?.title} · {s.volunteer.firstName}</span>
                  <StatusChip status={s.status} />
                </div>
                {s.summaryForParent && <p className="mt-3 rounded-xl bg-teal-light/60 p-3 text-sm"><b>From {s.volunteer.firstName}:</b> {s.summaryForParent}</p>}
                {s.status === "COMPLETED" && (s.parentRating ? <p className="mt-2 text-sm">Your feedback: {"⭐".repeat(s.parentRating)} {s.parentFeedback}</p> : <FeedbackForm id={s.id} />)}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
