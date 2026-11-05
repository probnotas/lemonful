"use client";
import { useTransition } from "react";
import { Video } from "lucide-react";
import { startNow } from "@/lib/actions/volunteer";

export function StartNowButton({ childId }: { childId: string }) {
  const [pending, start] = useTransition();
  return <button className="btn-coral" disabled={pending} onClick={() => start(() => startNow(childId))}><Video size={18} /> {pending ? "Opening…" : "Open tutoring room"}</button>;
}
