import { notFound } from "next/navigation";
import { getLesson } from "@/lib/curriculum";
import { BackLink } from "@/components/AppShell";
import { PracticeRoom } from "@/components/room/PracticeRoom";

export default async function Practice({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const l = getLesson(Number(n));
  if (!l) notFound();
  return (
    <div>
      <BackLink href={`/volunteer/lessons/${l.number}`}>Lesson script</BackLink>
      <p className="mb-4 rounded-2xl bg-lemon-light p-3 text-sm">🧪 <b>Practice mode</b> — try the lesson exactly as you&apos;ll teach it. Nothing is saved, and no child is connected.</p>
      <PracticeRoom lessonNumber={l.number} />
    </div>
  );
}
