"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Target, MessageCircle, HelpCircle, Lightbulb, PartyPopper, RotateCcw } from "lucide-react";
import type { Lesson } from "@/lib/curriculum";
import type { RoomAction, RoomState } from "@/lib/room-state";

/** Volunteer-only lesson script for the current step. */
export function GuidePanel({ lesson, state, dispatch, backHref = "/volunteer" }: { lesson: Lesson; state: RoomState; dispatch: (a: RoomAction) => void; backHref?: string }) {
  const i = state.stepIndex;
  const step = lesson.steps[i];
  const last = i === lesson.steps.length - 1;
  return (
    <aside className="flex h-full flex-col gap-3 overflow-y-auto rounded-3xl bg-white p-4 shadow-soft">
      <Link href={backHref} className="flex items-center gap-1 text-sm font-bold"><ArrowLeft size={16} /> Lesson {lesson.number}: {lesson.title}</Link>
      <div className="flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-navy/10"><div className="h-2 rounded-full bg-lemon" style={{ width: `${((i + 1) / lesson.steps.length) * 100}%` }} /></div>
        <span className="text-xs font-bold text-navy/60">{i + 1} of {lesson.steps.length}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lemon font-display text-xl font-bold">{i + 1}</span>
        <h2 className="text-xl leading-tight">{step.title}</h2>
        <span className="ml-auto chip bg-navy/5">{step.minutes}m</span>
      </div>
      <div className="rounded-2xl bg-coral-light/60 p-3"><p className="flex items-center gap-2 text-sm font-bold"><Target size={16} className="text-coral" /> Your goal</p><p className="text-sm">{step.goal}</p></div>
      <div className="rounded-2xl bg-teal-light/70 p-3"><p className="flex items-center gap-2 text-sm font-bold"><MessageCircle size={16} className="text-teal" /> What to say</p><p className="text-sm">{step.say}</p></div>
      {step.questions && (
        <div className="p-1"><p className="flex items-center gap-2 text-sm font-bold"><HelpCircle size={16} className="text-teal" /> Ask these questions</p>
          <ol className="mt-2 space-y-2">{step.questions.map((q, k) => <li key={q} className="flex gap-2 text-sm"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lemon text-xs font-bold">{k + 1}</span>{q}</li>)}</ol>
        </div>
      )}
      <div className="rounded-2xl bg-leaf-light p-3"><p className="flex items-center gap-2 text-sm font-bold"><Lightbulb size={16} className="text-leaf" /> Tip</p><p className="text-sm">{step.tip}</p></div>
      <div className="mt-auto space-y-2 pt-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => dispatch({ t: "celebrate" })} className="btn-ghost btn-sm flex-1"><PartyPopper size={16} /> Celebrate</button>
          <button type="button" onClick={() => dispatch({ t: "reset", stepId: step.id })} className="btn-ghost btn-sm" title="Reset this activity"><RotateCcw size={16} /></button>
        </div>
        <div className="flex gap-2">
          <button type="button" disabled={i === 0} onClick={() => dispatch({ t: "step", index: i - 1 })} className="btn-ghost"><ArrowLeft size={18} /></button>
          <button type="button" disabled={last} onClick={() => dispatch({ t: "step", index: i + 1 })} className="btn-lemon flex-1 text-lg">{last ? "Last step" : <>Next <ArrowRight size={18} /></>}</button>
        </div>
      </div>
    </aside>
  );
}
