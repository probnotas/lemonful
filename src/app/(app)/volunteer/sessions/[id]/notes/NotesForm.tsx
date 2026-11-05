"use client";
import { useActionState, useState } from "react";
import { saveNotes } from "@/lib/actions/volunteer";

export function NotesForm({ id, child, reachedEnd, defaults }: { id: string; child: string; reachedEnd: boolean; defaults: { summary: string; priv: string; engagement: number } }) {
  const [state, action, pending] = useActionState(saveNotes.bind(null, id), { error: "" });
  const [eng, setEng] = useState(defaults.engagement);
  return (
    <form action={action} className="mt-6 space-y-5">
      <label className="block card p-5"><span className="label">Summary for {child}&apos;s parent *</span>
        <span className="block text-xs text-navy/60 mb-2">What you did, one win, and one thing to practise at home. This is emailed to the parent.</span>
        <textarea name="summaryForParent" rows={4} defaultValue={defaults.summary} required className="input" placeholder={`Today ${child} matched all six letter sounds! We'll keep practising /i/ and /n/ — try playing "I spy" with those sounds at home.`} /></label>
      <div className="card p-5"><span className="label">How engaged was {child}?</span><input type="hidden" name="childEngagement" value={eng} />
        <div className="flex gap-2">{["😴", "😐", "🙂", "😃", "🤩"].map((e, i) => <button type="button" key={e} onClick={() => setEng(i + 1)} className={`h-12 w-12 rounded-xl text-2xl ${eng === i + 1 ? "bg-lemon ring-2 ring-navy" : "bg-cream"}`}>{e}</button>)}</div></div>
      <label className="block card p-5"><span className="label">Private notes for next time</span><span className="block text-xs text-navy/60 mb-2">Visible to you and Lemonful staff only.</span><textarea name="privateNotes" rows={3} defaultValue={defaults.priv} className="input" /></label>
      <label className="card p-5 flex items-center gap-3 font-semibold"><input type="checkbox" name="lessonCompleted" defaultChecked={reachedEnd} className="h-5 w-5 accent-teal" /> {child} completed this lesson — move to the next lesson next time</label>
      <details className="card p-5 border-coral/30"><summary className="cursor-pointer font-bold text-coral">Report a concern (safeguarding)</summary>
        <p className="mt-2 text-sm text-navy/70">If a child said or showed something that worries you, describe exactly what happened. This goes only to Lemonful staff, who will follow up today.</p>
        <textarea name="concern" rows={3} className="input mt-2" /></details>
      {state?.error && <p className="text-coral font-semibold">{state.error}</p>}
      <button className="btn-teal" disabled={pending}>{pending ? "Saving…" : "Save & send to parent"}</button>
    </form>
  );
}
