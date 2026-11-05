import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { BackLink } from "@/components/AppShell";
import { TRAINING } from "@/lib/training";
import { Quiz } from "./Quiz";

export default async function Module({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("VOLUNTEER");
  const idx = TRAINING.findIndex((m) => m.id === id);
  if (idx < 0) notFound();
  const m = TRAINING[idx];
  const done = (JSON.parse(user.volunteerProfile!.completedModules) as string[]).includes(m.id);
  return (
    <div className="mx-auto max-w-3xl">
      <BackLink href="/volunteer/training">All modules</BackLink>
      <p className="text-sm font-bold text-teal">Module {idx + 1} of {TRAINING.length} · {m.minutes} minutes</p>
      <h1 className="text-4xl">{m.emoji} {m.title}</h1>
      <div className="mt-6 space-y-4">
        {m.sections.map((s) => <section key={s.heading} className="card p-6"><h2 className="text-2xl">{s.heading}</h2><p className="mt-2 leading-relaxed text-navy/85">{s.body}</p></section>)}
      </div>
      <Quiz moduleId={m.id} quiz={m.quiz.map(({ q, options }) => ({ q, options }))} alreadyDone={done} nextId={TRAINING[idx + 1]?.id} />
    </div>
  );
}
