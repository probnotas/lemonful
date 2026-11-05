"use client";
import { useState, useTransition } from "react";
import { scheduleForStudent } from "@/lib/actions/volunteer";

export function ScheduleFor({ students }: { students: { id: string; name: string; slots: string[] }[] }) {
  const [kid, setKid] = useState(students[0]?.id);
  const [slot, setSlot] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const cur = students.find((s) => s.id === kid);
  return (
    <div className="mt-4 flex flex-wrap items-end gap-3">
      <label><span className="label">Student</span><select className="input" value={kid} onChange={(e) => { setKid(e.target.value); setSlot(""); }}>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label><span className="label">Time</span><select className="input" value={slot} onChange={(e) => setSlot(e.target.value)}><option value="">{cur?.slots.length ? "Pick a time" : "No shared times"}</option>{cur?.slots.map((t) => <option key={t} value={t}>{new Date(t).toLocaleString("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</option>)}</select></label>
      <button className="btn-teal" disabled={!slot || pending} onClick={() => start(async () => { const r = await scheduleForStudent(kid!, slot); setMsg(r.error ?? "Scheduled! The family has been emailed."); setSlot(""); })}>Schedule</button>
      {msg && <p className="text-sm font-semibold w-full">{msg}</p>}
    </div>
  );
}
