"use client";
import { useActionState } from "react";
import { addChild } from "@/lib/actions/parent";
import { READING_LEVELS } from "@/lib/utils";

export function AddChildForm() {
  const [state, action, pending] = useActionState(addChild, { error: "" });
  return (
    <form action={action} className="card p-6 grid gap-4 md:grid-cols-2 max-w-2xl">
      <label><span className="label">First name or preferred name *</span><input name="firstName" required className="input" /></label>
      <label><span className="label">Age *</span><select name="age" required className="input"><option value="">Select age</option>{[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => <option key={a} value={a}>{a} years old</option>)}</select></label>
      <fieldset className="md:col-span-2"><legend className="label">Current reading experience *</legend>
        {Object.entries(READING_LEVELS).map(([k, v]) => <label key={k} className="flex items-center gap-2 text-sm"><input type="radio" name="readingLevel" value={k} required className="accent-teal" /> {v}</label>)}
      </fieldset>
      <label className="md:col-span-2"><span className="label">Anything else you&apos;d like us to know?</span><textarea name="notes" rows={3} className="input" /></label>
      {state?.error && <p className="md:col-span-2 text-coral text-sm">{state.error}</p>}
      <button className="btn-coral md:col-span-2 w-fit" disabled={pending}>Add child &amp; start reading check</button>
    </form>
  );
}
