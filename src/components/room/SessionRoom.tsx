"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Loader2, RefreshCw } from "lucide-react";
import { getLesson } from "@/lib/curriculum";
import { useRoom } from "./useRoom";
import { useVideoCall } from "./useVideoCall";
import { Stage } from "./Stage";
import { GuidePanel } from "./GuidePanel";
import { VideoTile } from "./VideoTile";
import { LemonMark } from "@/components/Logo";

interface Props { sessionId: string; childName: string; childAvatar: string; volunteerName: string }

export function SessionRoom({ sessionId, childName, childAvatar, volunteerName }: Props) {
  const room = useRoom(sessionId);
  const call = useVideoCall(room.socket, room.role, room.presence);
  const router = useRouter();
  const [ending, setEnding] = useState(false);

  // Keep the screen awake during lessons where supported.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<typeof lock> } }).wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, []);

  if (room.error && !room.state) return <Center><p className="text-5xl">🙈</p><p className="mt-3 text-xl font-bold">{room.error}</p><Link href="/" className="btn-teal mt-4">Go back</Link></Center>;
  if (!room.state || !room.role) return <Center><Loader2 className="animate-spin" size={40} /><p className="mt-3 font-bold">Opening the lesson…</p></Center>;
  const lesson = getLesson(room.state.lessonNumber)!;

  if (room.role === "child" && room.ended) {
    return <Center><p className="text-8xl animate-float">🏆</p><h1 className="mt-4 text-5xl">Great reading today, {childName}!</h1><p className="mt-2 text-lg">See you next time 👋</p><Link href="/parent" className="btn-coral mt-6">Back to dashboard</Link></Center>;
  }

  const controls = (
    <div className="flex items-center justify-center gap-3 rounded-2xl bg-navy p-2.5">
      <CtlButton on={call.mic} onClick={call.toggleMic} label={call.mic ? "Mute" : "Unmute"}>{call.mic ? <Mic /> : <MicOff />}</CtlButton>
      <CtlButton on={call.cam} onClick={call.toggleCam} label={call.cam ? "Stop video" : "Start video"}>{call.cam ? <Video /> : <VideoOff />}</CtlButton>
      {call.status === "failed" && <CtlButton on onClick={call.retry} label="Reconnect"><RefreshCw /></CtlButton>}
      {room.role === "volunteer" && (
        <button type="button" disabled={ending} className="ml-2 rounded-xl bg-coral px-6 py-2.5 font-bold text-white hover:bg-coral-dark"
          onClick={async () => {
            if (!confirm("End the session for both of you?")) return;
            setEnding(true);
            room.socket?.emit("end");
            await fetch(`/api/sessions/${sessionId}/end`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state: room.state }) });
            router.push(`/volunteer/sessions/${sessionId}/notes?reached=${room.state!.stepIndex}`);
          }}>{ending ? "Ending…" : "End Session"}</button>
      )}
    </div>
  );

  const other = room.role === "volunteer" ? childName : volunteerName;
  const otherPresent = room.role === "volunteer" ? room.presence.child : room.presence.volunteer;
  const remotePlaceholder = (
    <div className="p-4">
      <p className="text-5xl">{room.role === "volunteer" ? childAvatar : "🧑‍🏫"}</p>
      <p className="mt-2 font-bold">{otherPresent ? (call.status === "failed" ? "Video couldn't connect — try Reconnect" : "Connecting video…") : room.role === "volunteer" ? `Waiting for ${childName} to join…` : `${volunteerName} will be here soon!`}</p>
    </div>
  );
  const banner = (!room.connected || call.mediaError) && (
    <div className="mb-3 rounded-2xl bg-coral-light p-3 text-sm font-semibold text-coral-dark">{!room.connected ? "Reconnecting…" : call.mediaError}</div>
  );

  if (room.role === "volunteer") {
    return (
      <div className="min-h-screen bg-[#eef2fb] p-3 md:p-4">
        {banner}
        <div className="mx-auto grid max-w-[1400px] gap-4 lg:h-[calc(100vh-2rem)] lg:grid-cols-[340px_1fr]">
          <GuidePanel lesson={lesson} state={room.state} dispatch={room.dispatch} />
          <div className="flex min-h-0 flex-col gap-3">
            <Stage lesson={lesson} state={room.state} role="volunteer" dispatch={room.dispatch} className="lg:flex-1 lg:overflow-y-auto" />
            <div className="relative h-56 md:h-64 shrink-0 overflow-hidden rounded-3xl">
              <VideoTile stream={call.remote} label={other} placeholder={remotePlaceholder} className="h-full w-full" />
              <VideoTile stream={call.local} muted mirror label="You" placeholder={<span className="text-xs">Camera off</span>} className="absolute right-3 top-3 h-28 w-40 rounded-2xl border-2 border-white shadow-soft" />
            </div>
            {controls}
          </div>
        </div>
      </div>
    );
  }

  // Child screen: big tutor video, small self-view, activity below.
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-leaf-light/60 p-3 md:p-4">
      {banner}
      <div className="mx-auto flex max-w-5xl flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-display text-2xl font-bold"><LemonMark className="h-9 w-9" /> Lemonful</span>
          <span className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-bold shadow-sm">Lesson {lesson.number}
            <span className="flex gap-1">{lesson.steps.map((_, i) => <span key={i} className={`h-3 w-3 rounded-full ${i <= room.state!.stepIndex ? "bg-lemon" : "bg-navy/15"}`} />)}</span></span>
          <span className="w-24" />
        </div>
        <div className="relative aspect-video max-h-[38vh] w-full overflow-hidden rounded-3xl shadow-soft">
          <VideoTile stream={call.remote} label={`${volunteerName} (Your Tutor)`} placeholder={remotePlaceholder} className="h-full w-full" />
          <VideoTile stream={call.local} muted mirror label="You" placeholder={<span className="text-3xl">{childAvatar}</span>} className="absolute right-3 top-3 h-24 w-32 md:h-32 md:w-44 rounded-2xl border-4 border-white shadow-soft" />
        </div>
        <Stage lesson={lesson} state={room.state} role="child" dispatch={room.dispatch} showHeader={false} />
        <div className="mx-auto w-fit">{controls}</div>
      </div>
    </div>
  );
}

function CtlButton({ on, onClick, label, children }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`grid h-11 w-11 place-items-center rounded-xl ${on ? "text-white hover:bg-white/10" : "bg-coral text-white"}`}>{children}</button>;
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-cream p-6 text-center"><div className="flex flex-col items-center">{children}</div></div>;
}
