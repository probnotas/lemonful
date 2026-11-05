"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { Role } from "@/lib/room-state";
import type { Presence } from "./useRoom";

/**
 * Peer-to-peer WebRTC video between volunteer and child.
 *
 * Protocol (over the socket "signal" relay):
 *   child  → {ready}            when it (re)joins and the volunteer is present
 *   volunteer creates a fresh RTCPeerConnection, adds tracks and sends {description: offer}
 *   child answers; both trickle {candidate}.
 *
 * Production note: peer-to-peer needs a TURN server for ~10–15% of networks (strict NAT /
 * school firewalls). Provide one via NEXT_PUBLIC_ICE_SERVERS, or swap this hook for a
 * managed SFU (LiveKit / Daily / Twilio) — the rest of the room doesn't change.
 */
function iceServers(): RTCIceServer[] {
  try {
    const custom = process.env.NEXT_PUBLIC_ICE_SERVERS;
    if (custom) return JSON.parse(custom);
  } catch {}
  return [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];
}

export function useVideoCall(socket: Socket | null, role: Role | null, presence: Presence) {
  const [local, setLocal] = useState<MediaStream | null>(null);
  const [remote, setRemote] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState("");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [status, setStatus] = useState<"waiting" | "connecting" | "connected" | "failed">("waiting");
  const pc = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<MediaStream | null>(null);
  const mediaReady = useRef<Promise<void> | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);

  // 1. Camera + mic
  useEffect(() => {
    let stopped = false;
    mediaReady.current = navigator.mediaDevices?.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: { echoCancellation: true, noiseSuppression: true } })
      .then((s) => { if (stopped) return s.getTracks().forEach((t) => t.stop()); localRef.current = s; setLocal(s); })
      .catch(() => setMediaError("Camera or microphone is blocked. Click the camera icon in your browser's address bar to allow it, then reload."))
      ?? Promise.resolve();
    return () => { stopped = true; localRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const send = useCallback((data: unknown) => socket?.emit("signal", data), [socket]);

  const newPc = useCallback(() => {
    pc.current?.close();
    const p = new RTCPeerConnection({ iceServers: iceServers() });
    pc.current = p;
    pendingCandidates.current = [];
    setRemote(null);
    setStatus("connecting");
    p.onicecandidate = (e) => e.candidate && send({ candidate: e.candidate.toJSON() });
    p.ontrack = (e) => setRemote(e.streams[0] ?? new MediaStream([e.track]));
    p.onconnectionstatechange = () => {
      if (p.connectionState === "connected") setStatus("connected");
      if (p.connectionState === "failed") setStatus("failed");
    };
    return p;
  }, [send]);

  const addLocalTracks = (p: RTCPeerConnection) => {
    const s = localRef.current;
    if (s) s.getTracks().forEach((t) => p.addTrack(t, s));
  };

  // 2. Signalling
  useEffect(() => {
    if (!socket || !role) return;
    const onSignal = async (msg: { nudge?: boolean; ready?: boolean; description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) => {
      try {
        if (msg.nudge && role === "child") { send({ ready: true }); return; }
        if (msg.ready && role === "volunteer") {
          await mediaReady.current;
          const p = newPc();
          addLocalTracks(p);
          if (!localRef.current) { p.addTransceiver("audio", { direction: "recvonly" }); p.addTransceiver("video", { direction: "recvonly" }); }
          await p.setLocalDescription(await p.createOffer());
          send({ description: p.localDescription });
        } else if (msg.description) {
          const p = role === "child" && msg.description.type === "offer" ? newPc() : pc.current;
          if (!p) return;
          await p.setRemoteDescription(msg.description);
          for (const c of pendingCandidates.current.splice(0)) await p.addIceCandidate(c).catch(() => {});
          if (msg.description.type === "offer") {
            await mediaReady.current;
            addLocalTracks(p);
            await p.setLocalDescription(await p.createAnswer());
            send({ description: p.localDescription });
          }
        } else if (msg.candidate) {
          const p = pc.current;
          if (p?.remoteDescription) await p.addIceCandidate(msg.candidate).catch(() => {});
          else pendingCandidates.current.push(msg.candidate);
        }
      } catch (e) {
        console.warn("[video] signalling error", e);
      }
    };
    socket.on("signal", onSignal);
    return () => { socket.off("signal", onSignal); };
  }, [socket, role, newPc, send]);

  // 3. The child asks for a (re)connection whenever both are present.
  const both = presence.volunteer && presence.child;
  useEffect(() => {
    if (!both) { setStatus("waiting"); setRemote(null); return; }
    if (role === "child") {
      const t = setTimeout(() => send({ ready: true }), 300);
      return () => clearTimeout(t);
    }
  }, [both, role, send]);

  useEffect(() => () => pc.current?.close(), []);

  const toggleMic = () => { localRef.current?.getAudioTracks().forEach((t) => (t.enabled = !mic)); setMic(!mic); };
  const toggleCam = () => { localRef.current?.getVideoTracks().forEach((t) => (t.enabled = !cam)); setCam(!cam); };
  const retry = () => role === "child" ? send({ ready: true }) : send({ nudge: true });

  return { local, remote, mediaError, mic, cam, toggleMic, toggleCam, status, retry };
}
