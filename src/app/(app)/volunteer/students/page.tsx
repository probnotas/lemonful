import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader, Empty } from "@/components/AppShell";
import { READING_LEVELS, avatar } from "@/lib/utils";
import { getLesson } from "@/lib/curriculum";

export const metadata = { title: "My students" };

export default async function Students() {
  const user = await requireUser("VOLUNTEER");
  const kids = await db.child.findMany({ where: { volunteerId: user.id }, include: { lessonProgress: true, milestones: true } });
  return (
    <div>
      <PageHeader title="My students" />
      {kids.length === 0 ? <Empty emoji="🧒" title="No students yet" body="Once you're approved, Lemonful will match you with a child whose schedule fits yours." /> : (
        <div className="grid gap-6 md:grid-cols-2">
          {kids.map((c) => (
            <Link key={c.id} href={`/volunteer/students/${c.id}`} className="card p-6 hover:-translate-y-0.5 transition">
              <div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-lemon-light text-4xl">{avatar(c.avatar)}</span>
                <div><h2 className="text-2xl">{c.firstName}</h2><p className="text-sm text-navy/70">{c.age} years old · {READING_LEVELS[c.readingLevel]}</p></div></div>
              <p className="mt-4 text-sm">Completed <b>{c.lessonProgress.length}</b> of 8 lessons · <b>{c.milestones.length}</b> milestones</p>
              <p className="text-sm text-navy/70">Next: Lesson {Math.min(8, Math.max(c.startLesson, c.lessonProgress.length + c.startLesson))} — {getLesson(Math.min(8, Math.max(c.startLesson, c.lessonProgress.length + c.startLesson)))?.title}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
