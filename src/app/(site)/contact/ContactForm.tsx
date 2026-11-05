"use client";
import { useActionState } from "react";
import { sendContact } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, { ok: false, error: "" });
  if (state.ok) return <div className="card p-8 text-center"><p className="text-4xl">💌</p><h2 className="text-2xl mt-2">Thanks! We&apos;ll be in touch soon.</h2></div>;
  return (
    <form action={action} className="card p-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label><span className="label">Your name</span><input name="name" required className="input" /></label>
        <label><span className="label">Email</span><input name="email" type="email" required className="input" /></label>
      </div>
      <label><span className="label">I am a…</span>
        <select name="topic" className="input"><option value="parent">Parent / guardian</option><option value="volunteer">Volunteer</option><option value="school">School or partner</option><option value="other">Other</option></select>
      </label>
      <label><span className="label">Message</span><textarea name="message" rows={5} required className="input" /></label>
      {state.error && <p className="text-coral text-sm">{state.error}</p>}
      <button className="btn-coral" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
