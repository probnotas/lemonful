"use client";
import { useActionState, useState } from "react";
import { deleteChild, updateChild } from "@/lib/actions/parent";
import { AVATARS, READING_LEVELS } from "@/lib/utils";

export function EditChild({ child }: { child: { id: string; firstName: string; age: number; readingLevel: string; notes: string; avatar: string } }) {
  const [state, action, pending] = useActionState(updateChild.bind(null, child.id), { ok: false, error: "" });
  const [av, setAv] = useState(child.avatar);
  return (
    <details className="card p-6">
      <summary className="cursor-pointer font-display text-2xl font-bold">Edit {child.firstName}&apos;s profile</summary>
      <form action={action} className="mt-4 grid gap-4 md:grid-cols-2">
        <label><span className="label">First name</span><input name="firstName" defaultValue={child.firstName} className="input" /></label>
        <label><span className="label">Age</span><input name="age" type="number" min={3} max={12} defaultValue={child.age} className="input" /></label>
        <label className="md:col-span-2"><span className="label">Reading experience</span>
          <select name="readingLevel" defaultValue={child.readingLevel} className="input">{Object.entries(READING_LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <div className="md:col-span-2"><span className="label">Lesson avatar</span>
          <input type="hidden" name="avatar" value={av} />
          <div className="flex gap-2">{Object.entries(AVATARS).map(([k, e]) => <button type="button" key={k} onClick={() => setAv(k)} className={`h-12 w-12 rounded-xl text-2xl ${av === k ? "bg-lemon ring-2 ring-navy" : "bg-cream"}`}>{e}</button>)}</div></div>
        <label className="md:col-span-2"><span className="label">Notes for the tutor</span><textarea name="notes" defaultValue={child.notes} rows={3} className="input" /></label>
        <div className="md:col-span-2 flex items-center gap-3">
          <button className="btn-teal btn-sm" disabled={pending}>Save</button>
          {state.ok && <span className="text-leaf font-semibold text-sm">Saved!</span>}
          {state.error && <span className="text-coral text-sm">{state.error}</span>}
          <button type="button" className="ml-auto text-sm font-semibold text-coral underline" onClick={() => { if (confirm(`Delete ${child.firstName}'s profile and all their progress? This can't be undone.`)) deleteChild(child.id); }}>Delete profile</button>
        </div>
      </form>
    </details>
  );
}
