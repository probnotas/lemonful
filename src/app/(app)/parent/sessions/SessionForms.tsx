"use client";
import { useActionState, useState, useTransition } from "react";
import { cancelSession, leaveFeedback } from "@/lib/actions/parent";

export function FeedbackForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(leaveFeedback.bind(null, id), { ok: false });
  const [rating, setRating] = useState(0);
  if (state.ok) return <p className="mt-2 text-sm font-semibold text-leaf">Thanks for your feedback! 💛</p>;
  return (
    <form action={action} className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-cream p-3">
      <span className="text-sm font-bold">How did it go?</span>
      <input type="hidden" name="rating" value={rating} />
      <div className="flex">{[1, 2, 3, 4, 5].map((n) => <button type="button" key={n} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "" : "grayscale opacity-40"}`} aria-label={`${n} stars`}>⭐</button>)}</div>
      <input name="feedback" placeholder="Anything to share with Lemonful? (optional)" className="input flex-1 min-w-[200px] py-1.5" />
      <button className="btn-teal btn-sm" disabled={!rating || pending}>Send</button>
    </form>
  );
}

export function CancelButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return <button className="text-sm font-semibold text-coral underline" disabled={pending} onClick={() => confirm("Cancel this lesson? We'll let the other person know.") && start(() => cancelSession(id))}>{pending ? "…" : "Cancel"}</button>;
}
