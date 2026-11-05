"use client";
import { useActionState, useState, useTransition } from "react";
import { AvailabilityGrid, type Slot } from "./AvailabilityGrid";
import { deleteAccount, saveAvailability, updateAccount } from "@/lib/actions/parent";

export function AccountForm({ user }: { user: { firstName: string; lastName: string; email: string; city: string; postalCode: string } }) {
  const [state, action, pending] = useActionState(updateAccount, { ok: false, error: "" });
  return (
    <form action={action} className="card p-6 grid gap-4 md:grid-cols-2">
      <h2 className="text-2xl md:col-span-2">Your details</h2>
      <label><span className="label">First name</span><input name="firstName" defaultValue={user.firstName} className="input" /></label>
      <label><span className="label">Last name</span><input name="lastName" defaultValue={user.lastName} className="input" /></label>
      <label><span className="label">Email</span><input disabled value={user.email} className="input bg-navy/5" /></label>
      <div className="grid grid-cols-2 gap-3">
        <label><span className="label">City</span><input name="city" defaultValue={user.city} className="input" /></label>
        <label><span className="label">Postal code</span><input name="postalCode" defaultValue={user.postalCode} className="input" /></label>
      </div>
      <div className="flex items-center gap-3"><button className="btn-teal btn-sm" disabled={pending}>Save</button>{state.ok && <span className="text-sm text-leaf font-semibold">Saved!</span>}{state.error && <span className="text-sm text-coral">{state.error}</span>}</div>
    </form>
  );
}

export function AvailabilityEditor({ initial }: { initial: Slot[] }) {
  const [slots, setSlots] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div>
      <AvailabilityGrid value={slots} onChange={(v) => { setSlots(v); setSaved(false); }} />
      <div className="mt-4 flex items-center gap-3">
        <button className="btn-teal btn-sm" disabled={pending} onClick={() => start(async () => { await saveAvailability(slots); setSaved(true); })}>Save availability</button>
        {saved && <span className="text-sm font-semibold text-leaf">Saved!</span>}
      </div>
    </div>
  );
}

export function DeleteAccount({ note }: { note: string }) {
  return (
    <details className="card p-6 border-coral/30">
      <summary className="cursor-pointer font-display text-xl font-bold text-coral">Delete account</summary>
      <p className="mt-2 text-sm text-navy/75">{note}</p>
      <form action={deleteAccount} className="mt-3 flex gap-3">
        <input name="confirm" placeholder='Type "delete" to confirm' className="input max-w-xs" />
        <button className="btn bg-coral text-white btn-sm">Delete forever</button>
      </form>
    </details>
  );
}
