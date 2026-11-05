import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getLesson } from "@/lib/curriculum";
import { fmtDate } from "@/lib/utils";
import { NotesForm } from "./NotesForm";

export const metadata = { title: "Session notes" };

export default async function Notes({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ reached?: string }> }) {
  const { id } = await params;
  const { reached } = await searchParams;
  const user = await requireUser("VOLUNTEER");
  const s = await db.tutoringSession.findFirst({ where: { id, volunteerId: user.id }, include: { child: true, results: true, hourEntry: true } });
  if (!s) notFound();
  const lesson = getLesson(s.lessonNumber)!;
  const reachedEnd = reached ? Number(reached) >= lesson.steps.length - 1 : s.lessonCompleted;
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-bold text-teal">Session complete 🎉 {s.hourEntry && `· ${s.hourEntry.minutes} minutes added to your hours`}</p>
      <h1 className="text-4xl">Notes: {s.child.firstName}, {fmtDate(s.scheduledAt)}</h1>
      <p className="text-navy/70">Lesson {lesson.number}: {lesson.title}</p>
      {s.results.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">{s.results.filter((r) => r.total > 0).map((r) => <span key={r.id} className="chip bg-teal-light text-teal">{lesson.steps.find((x) => x.id === r.activityId)?.title}: {r.correct}/{r.total}</span>)}</div>
      )}
      <NotesForm id={s.id} child={s.child.firstName} reachedEnd={reachedEnd} defaults={{ summary: s.summaryForParent ?? "", priv: s.privateNotes ?? "", engagement: s.childEngagement ?? 4 }} />
    </div>
  );
}
