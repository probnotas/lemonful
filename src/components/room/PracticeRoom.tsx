"use client";
import { useReducer, useState } from "react";
import { getLesson } from "@/lib/curriculum";
import { initialRoomState, reduceRoom, type RoomAction, type Role } from "@/lib/room-state";
import { Stage } from "./Stage";
import { GuidePanel } from "./GuidePanel";

/** Offline rehearsal of a lesson: same guide + activities, local state only. */
export function PracticeRoom({ lessonNumber }: { lessonNumber: number }) {
  const [view, setView] = useState<Role>("volunteer");
  const [state, dispatch] = useReducer((s: ReturnType<typeof initialRoomState>, a: RoomAction & { as?: Role }) => reduceRoom(s, a, a.as ?? "volunteer"), lessonNumber, initialRoomState);
  const lesson = getLesson(lessonNumber)!;
  const d = (a: RoomAction) => { if (a.t !== "pointer" && a.t !== "pointer-clear") dispatch({ ...a, as: view }); };
  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(["volunteer", "child"] as Role[]).map((r) => <button key={r} onClick={() => setView(r)} className={`btn-sm rounded-full font-bold ${view === r ? "bg-navy text-white" : "bg-white"}`}>{r === "volunteer" ? "Volunteer view" : "Child's view"}</button>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <GuidePanel lesson={lesson} state={state} dispatch={(a) => dispatch({ ...a, as: "volunteer" })} backHref={`/volunteer/lessons/${lessonNumber}`} />
        <Stage lesson={lesson} state={state} role={view} dispatch={d} />
      </div>
    </div>
  );
}
