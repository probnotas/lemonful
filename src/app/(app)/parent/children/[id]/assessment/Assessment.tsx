"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, X, ArrowRight } from "lucide-react";
import { saveAssessment } from "@/lib/actions/parent";
import { getLesson } from "@/lib/curriculum";

const SOUNDS = ["s", "a", "t", "p", "i", "n", "m", "d"];
const BLEND = ["sat", "pin", "map", "dog"];
const SIGHT = ["the", "is", "said", "was"];

export function Assessment({ childId, name }: { childId: string; name: string }) {
  const [stage, setStage] = useState(0);
  const [sounds, setSounds] = useState<Record<string, boolean>>({});
  const [blending, setBlending] = useState<Record<string, boolean>>({});
  const [sight, setSight] = useState<Record<string, boolean>>({});
  const [sentence, setSentence] = useState<"yes" | "some" | "no" | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [pending, start] = useTransition();

  const Cards = ({ items, value, set, big }: { items: string[]; value: Record<string, boolean>; set: (v: Record<string, boolean>) => void; big?: boolean }) => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((it) => (
        <div key={it} className={`rounded-3xl border-4 bg-white p-4 text-center ${value[it] === true ? "border-leaf" : value[it] === false ? "border-coral/50" : "border-transparent shadow-soft"}`}>
          <p className={`font-display font-bold ${big ? "text-5xl" : "text-7xl"} py-3`}>{it}</p>
          <div className="flex justify-center gap-2">
            <button onClick={() => set({ ...value, [it]: true })} className={`grid h-10 w-10 place-items-center rounded-full ${value[it] === true ? "bg-leaf text-white" : "bg-leaf-light text-leaf"}`} aria-label="Got it"><Check /></button>
            <button onClick={() => set({ ...value, [it]: false })} className={`grid h-10 w-10 place-items-center rounded-full ${value[it] === false ? "bg-coral text-white" : "bg-coral-light text-coral"}`} aria-label="Not yet"><X /></button>
          </div>
        </div>
      ))}
    </div>
  );

  const stages = [
    { title: "Letter sounds", help: `Point to each letter and ask ${name}: "What sound does this letter make?" Tap ✓ if they say the sound (like "sss" for s), ✗ if not yet.`, body: <Cards items={SOUNDS} value={sounds} set={setSounds} />, ok: Object.keys(sounds).length === SOUNDS.length },
    { title: "Blending", help: `Ask ${name} to read each word. Sounding it out slowly and then saying it counts!`, body: <Cards items={BLEND} value={blending} set={setBlending} big />, ok: Object.keys(blending).length === BLEND.length },
    { title: "Tricky words", help: `These words can't be sounded out. Does ${name} know them by sight?`, body: <Cards items={SIGHT} value={sight} set={setSight} big />, ok: Object.keys(sight).length === SIGHT.length },
    { title: "A sentence", help: `Ask ${name} to read this sentence.`, body: (
      <div className="text-center">
        <p className="rounded-3xl bg-white p-8 font-display text-5xl font-bold shadow-soft">The cat sat on a mat.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {([["yes", "Read it all 🎉"], ["some", "Read some words"], ["no", "Not yet"]] as const).map(([k, l]) => <button key={k} onClick={() => setSentence(k)} className={`btn ${sentence === k ? "bg-navy text-white" : "bg-white border-2 border-navy/15"}`}>{l}</button>)}
        </div>
      </div>), ok: sentence !== null },
  ];

  if (result) {
    const l = getLesson(result)!;
    return (
      <div className="mx-auto max-w-xl card p-10 text-center">
        <p className="text-6xl">🌟</p>
        <h1 className="mt-3 text-4xl">Great job, {name}!</h1>
        <p className="mt-3 text-lg">We&apos;ll start {name} at <b>Lesson {l.number}: {l.title}</b> — {l.focus.toLowerCase()}.</p>
        <p className="mt-2 text-sm text-navy/60">Their tutor can always adjust as they get to know {name}.</p>
        <Link href={`/parent/children/${childId}`} className="btn-coral mt-6">See {name}&apos;s journey <ArrowRight size={18} /></Link>
      </div>
    );
  }

  const s = stages[stage];
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-bold text-teal">Reading check · {stage + 1} of {stages.length}</p>
      <h1 className="text-4xl">{s.title}</h1>
      <p className="mt-2 mb-6 rounded-2xl bg-lemon-light p-4 text-navy/85">👋 <b>For the grown-up:</b> {s.help} No pressure — this just helps us pick the right first lesson.</p>
      {s.body}
      <div className="mt-8 flex justify-between">
        <button disabled={stage === 0} onClick={() => setStage(stage - 1)} className="btn-ghost btn-sm">Back</button>
        {stage < stages.length - 1
          ? <button disabled={!s.ok} onClick={() => setStage(stage + 1)} className="btn-coral">Next <ArrowRight size={18} /></button>
          : <button disabled={!s.ok || pending} onClick={() => start(async () => { const r = await saveAssessment(childId, { sounds, blending, sight, sentence }); setResult(r.startLesson); })} className="btn-coral">{pending ? "Saving…" : "Finish"}</button>}
      </div>
    </div>
  );
}
