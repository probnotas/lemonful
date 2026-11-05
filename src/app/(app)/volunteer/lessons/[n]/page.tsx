import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Target, HelpCircle, Lightbulb, Play } from "lucide-react";
import { getLesson, BOOKS } from "@/lib/curriculum";
import { BackLink } from "@/components/AppShell";

export default async function LessonScript({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const l = getLesson(Number(n));
  if (!l) notFound();
  return (
    <div className="mx-auto max-w-4xl">
      <BackLink href="/volunteer/lessons">Lesson library</BackLink>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-teal">Lesson {l.number} of 8</p>
          <h1 className="text-4xl">{l.title}</h1>
          <p className="text-navy/70">{l.focus} · <b>Rule:</b> {l.rule}{l.book && <> · 📖 {BOOKS[l.book].title}</>}</p>
        </div>
        <Link href={`/volunteer/lessons/${l.number}/practice`} className="btn-teal"><Play size={18} /> Practice mode</Link>
      </div>
      <ol className="mt-8 space-y-5">
        {l.steps.map((s, i) => (
          <li key={s.id} className="card p-6">
            <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-lemon font-display text-xl font-bold">{i + 1}</span><h2 className="text-2xl">{s.title}</h2><span className="ml-auto chip bg-navy/5">{s.minutes} min</span></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-coral-light/60 p-4"><p className="flex items-center gap-2 font-bold"><Target size={18} className="text-coral" /> Your goal</p><p className="text-sm">{s.goal}</p></div>
              <div className="rounded-2xl bg-teal-light/60 p-4"><p className="flex items-center gap-2 font-bold"><MessageCircle size={18} className="text-teal" /> What to say</p><p className="text-sm">{s.say}</p></div>
              {s.questions && <div className="rounded-2xl bg-lemon-light p-4"><p className="flex items-center gap-2 font-bold"><HelpCircle size={18} className="text-lemon-dark" /> Ask these questions</p><ol className="mt-1 list-decimal pl-5 text-sm space-y-1">{s.questions.map((q) => <li key={q}>{q}</li>)}</ol></div>}
              <div className="rounded-2xl bg-leaf-light p-4"><p className="flex items-center gap-2 font-bold"><Lightbulb size={18} className="text-leaf" /> Tip</p><p className="text-sm">{s.tip}</p></div>
            </div>
            <p className="mt-3 text-xs text-navy/60">Activity on both screens: <b>{s.activity.type.replace("-", " ")}</b></p>
          </li>
        ))}
      </ol>
    </div>
  );
}
