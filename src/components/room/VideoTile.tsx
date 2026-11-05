"use client";
import { useEffect, useRef } from "react";

export function VideoTile({ stream, label, muted, mirror, placeholder, className = "" }: { stream: MediaStream | null; label?: string; muted?: boolean; mirror?: boolean; placeholder: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { if (ref.current && ref.current.srcObject !== stream) ref.current.srcObject = stream; }, [stream]);
  return (
    <div className={`${/\babsolute\b/.test(className) ? "" : "relative "}overflow-hidden bg-gradient-to-br from-navy to-navy-light ${className}`}>
      {stream ? <video ref={ref} autoPlay playsInline muted={muted} className={`h-full w-full object-cover ${mirror ? "-scale-x-100" : ""}`} />
        : <div className="grid h-full w-full place-items-center text-center text-white/80">{placeholder}</div>}
      {label && <span className="absolute bottom-2 left-2 rounded-lg bg-black/55 px-2 py-0.5 text-xs font-semibold text-white">{label}</span>}
    </div>
  );
}
