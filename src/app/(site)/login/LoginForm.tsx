"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { login, resendVerification } from "@/lib/actions/auth";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, {});
  const [resent, setResent] = useState(false);
  return (
    <form action={action} className="card p-8 space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block"><span className="label">Email</span><input name="email" type="email" required className="input" autoComplete="email" /></label>
      <label className="block"><span className="label">Password</span><input name="password" type="password" required className="input" autoComplete="current-password" /></label>
      {state?.error && (
        <div className="rounded-xl bg-coral-light p-3 text-sm font-semibold text-coral-dark">
          {state.error}
          {state.unverified && !resent && <button type="button" className="ml-1 underline" onClick={async () => { await resendVerification(state.unverified!); setResent(true); }}>Resend link</button>}
          {resent && <span className="block mt-1 text-navy">Sent! Check your inbox.</span>}
        </div>
      )}
      <button className="btn-coral w-full" disabled={pending}>{pending ? "Logging in…" : "Log in"}</button>
      <p className="text-center text-sm text-navy/70">New to Lemonful? <Link href="/signup/parent" className="underline">Parent sign up</Link> · <Link href="/signup/volunteer" className="underline">Volunteer sign up</Link></p>
    </form>
  );
}
