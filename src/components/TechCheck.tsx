"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Mic } from "lucide-react";

/** Lets families and volunteers check camera + microphone before a lesson. */
export function TechCheck() {
  const video = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [level, setLevel] = useState(0);
  const [err, setErr] = useState("");

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream]);

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      if (video.current) video.current.srcObject = s;
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      ctx.createMediaStreamSource(s).connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      const tick = () => { an.getByteFrequencyData(data); setLevel(Math.min(100, data.reduce((a, b) => a + b, 0) / data.length * 2)); if (s.active) requestAnimationFrame(tick); };
      tick();
    } catch {
      setErr("We couldn't reach your camera or microphone. Check your browser's permission settings (the camera icon in the address bar) and try again.");
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-2xl">Tech check</h2>
      <p className="text-sm text-navy/70">Make sure your camera and microphone work before your lesson.</p>
      <div className="mt-4 grid gap-4 md:grid-cols-[320px_1fr] items-center">
        <div className="aspect-video overflow-hidden rounded-2xl bg-navy/90 grid place-items-center">
          <video ref={video} autoPlay muted playsInline className={`h-full w-full object-cover -scale-x-100 ${stream ? "" : "hidden"}`} />
          {!stream && <Camera className="text-white/50" size={40} />}
        </div>
        <div>
          {!stream ? <button onClick={start} className="btn-teal">Test camera &amp; mic</button> : (
            <div className="space-y-2">
              <p className="font-semibold text-leaf">✓ Camera working</p>
              <p className="flex items-center gap-2 font-semibold"><Mic size={18} /> Say something:</p>
              <div className="h-3 w-full max-w-xs rounded-full bg-navy/10"><div className="h-3 rounded-full bg-leaf transition-all" style={{ width: `${level}%` }} /></div>
            </div>
          )}
          {err && <p className="mt-2 text-sm text-coral">{err}</p>}
        </div>
      </div>
    </div>
  );
}
