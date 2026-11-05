"use client";
import { useRef } from "react";
import { Maximize, Volume2 } from "lucide-react";
import type { Lesson } from "@/lib/curriculum";
import { initialActState, type ActAction, type RoomAction, type RoomState, type Role } from "@/lib/room-state";
import { Activity, speak, useConfetti } from "./Activities";
import { LemonMark } from "@/components/Logo";
import { useThrottle } from "./useRoom";

/** The shared activity area: Lemony's prompt + the current step's activity + live pointer. */
export function Stage({ lesson, state, role, dispatch, showHeader = true, className = "" }: { lesson: Lesson; state: RoomState; role: Role; dispatch: (a: RoomAction) => void; showHeader?: boolean; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const step = lesson.steps[state.stepIndex];
  const s = state.act[step.id] ?? initialActState(step.activity);
  const act = (a: ActAction) => dispatch({ t: "act", stepId: step.id, a });
  useConfetti(state.celebrate);

  const move = useThrottle((x: number, y: number) => dispatch({ t: "pointer", x, y }), 50);
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    move((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };
  const p = state.pointer;

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={() => dispatch({ t: "pointer-clear" })}
      className={`relative overflow-hidden rounded-3xl border-4 border-leaf/30 bg-gradient-to-b from-sky-50 via-white to-leaf-light/70 ${className}`}>
      {showHeader && (
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="flex items-center gap-1 font-display text-xl font-bold"><LemonMark className="h-7 w-7" /> Lemonful</span>
          <span className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-bold shadow-sm">
            Lesson {lesson.number}
            <span className="flex gap-1">{lesson.steps.map((_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i <= state.stepIndex ? "bg-lemon" : "bg-navy/15"}`} />)}</span>
          </span>
          <button type="button" aria-label="Full screen" onClick={() => document.fullscreenElement ? document.exitFullscreen() : ref.current?.requestFullscreen()} className="rounded-lg p-1.5 hover:bg-white"><Maximize size={18} /></button>
        </div>
      )}
      <div className="flex items-center gap-3 px-4 pt-2">
        <img src="/art/lemon.png" alt="Lemony" className="h-16 w-16 md:h-20 md:w-20 shrink-0 animate-float" />
        <div className="relative flex-1 rounded-2xl bg-white px-4 py-3 font-display text-lg md:text-2xl font-bold leading-tight shadow-sm">
          {step.lemony}
          <button type="button" onClick={() => speak(step.lemony)} aria-label="Read aloud" className="absolute right-2 top-2 rounded-lg p-1 text-navy/60 hover:bg-navy/5"><Volume2 size={18} /></button>
        </div>
      </div>
      <div className="p-4">
        <div className="rounded-3xl bg-white/70 p-3 md:p-4">
          <Activity cfg={step.activity} s={s} act={act} role={role} />
        </div>
      </div>
      {p && p.by !== role && (
        <span className="pointer-events-none absolute z-10 text-3xl transition-all duration-75" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, transform: "translate(-30%, -10%)" }}>
          {p.by === "volunteer" ? "👆" : "⭐"}
        </span>
      )}
    </div>
  );
}
