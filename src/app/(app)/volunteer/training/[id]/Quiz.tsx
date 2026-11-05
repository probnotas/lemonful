"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { completeModule } from "@/lib/actions/volunteer";

export function Quiz({ moduleId, quiz, alreadyDone, nextId }: { moduleId: string; quiz: { q: string; options: string[] }[]; alreadyDone: boolean; nextId?: string }) {
  const [answers, setAnswers] = useState<number[]>(quiz.map(() => -1));
  const [wrong, setWrong] = useState<number[]>([]);
  const [passed, setPassed] = useState(alreadyDone);
  const [allDone, setAllDone] = useState(false);
  const [pending, start] = useTransition();
  return (
    <section className="card mt-6 p-6 border-2 border-teal/30">
      <h2 className="text-2xl">Check your understanding</h2>
      <div className="mt-4 space-y-5">
        {quiz.map((q, i) => (
          <fieldset key={i} className={wrong.includes(i) ? "rounded-xl bg-coral-light/60 p-3" : ""}>
            <legend className="font-bold">{i + 1}. {q.q}</legend>
            <div className="mt-2 space-y-1">
              {q.options.map((o, j) => (
                <label key={j} className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`q${i}`} className="accent-teal h-4 w-4" checked={answers[i] === j} onChange={() => setAnswers(answers.map((a, k) => (k === i ? j : a)))} /> {o}</label>
              ))}
            </div>
            {wrong.includes(i) && <p className="mt-1 text-sm font-semibold text-coral">Not quite — re-read the section above and try again.</p>}
          </fieldset>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!passed && <button className="btn-teal" disabled={answers.includes(-1) || pending} onClick={() => start(async () => { const r = await completeModule(moduleId, answers); if (r.ok) { setPassed(true); setWrong([]); setAllDone(!!r.allDone); } else setWrong(r.wrong ?? []); })}>{pending ? "Checking…" : "Submit answers"}</button>}
        {passed && <p className="font-bold text-leaf">✓ Module complete!</p>}
        {passed && (nextId ? <Link href={`/volunteer/training/${nextId}`} className="btn-teal btn-sm">Next module →</Link> : <Link href="/volunteer" className="btn-teal btn-sm">Back to dashboard</Link>)}
      </div>
      {allDone && <p className="mt-4 rounded-2xl bg-lemon-light p-4 font-semibold">🎉 You finished all training! 2 hours have been added to your community-service log. A Lemonful staff member will now review your application.</p>}
    </section>
  );
}
