"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bookSession } from "@/lib/actions/parent";

export function SlotPicker({ childId, slots }: { childId: string; slots: string[] }) {
  const [sel, setSel] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  const byDay = new Map<string, string[]>();
  for (const s of slots) {
    const k = new Date(s).toLocaleDateString("en-CA", { weekday: "long", month: "short", day: "numeric" });
    byDay.set(k, [...(byDay.get(k) ?? []), s]);
  }
  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...byDay].slice(0, 9).map(([day, times]) => (
          <div key={day} className="rounded-2xl bg-cream p-3">
            <p className="text-sm font-bold">{day}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {times.map((t) => (
                <button key={t} onClick={() => setSel(t)} className={`rounded-full px-3 py-1 text-sm font-semibold border-2 ${sel === t ? "bg-coral border-coral text-white" : "bg-white border-navy/10 hover:border-coral"}`}>
                  {new Date(t).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" })}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button disabled={!sel || pending} className="btn-coral" onClick={() => start(async () => {
          const r = await bookSession(childId, sel!);
          if (r.error) setMsg(r.error); else { setMsg("Booked! 🎉 We've let the tutor know."); setSel(null); router.refresh(); }
        })}>{pending ? "Booking…" : "Book this time"}</button>
        {msg && <span className="text-sm font-semibold">{msg}</span>}
      </div>
    </div>
  );
}
