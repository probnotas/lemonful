"use client";
import { useState } from "react";
import { resendVerification } from "@/lib/actions/auth";

export function ResendButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  return (
    <button className="btn-outline btn-sm mt-3 border-navy text-navy" disabled={state !== "idle"} onClick={async () => { setState("sending"); await resendVerification(email); setState("sent"); }}>
      {state === "sent" ? "Sent! Check your inbox" : state === "sending" ? "Sending…" : "Resend verification email"}
    </button>
  );
}
