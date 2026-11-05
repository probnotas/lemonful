"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { RoomAction, RoomState, Role } from "@/lib/room-state";

export interface Presence { volunteer: boolean; child: boolean }

/** Connects to the realtime server and keeps the shared lesson state in sync. */
export function useRoom(sessionId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<RoomState | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [presence, setPresence] = useState<Presence>({ volunteer: false, child: false });
  const [error, setError] = useState("");
  const [ended, setEnded] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io({ path: "/rt", transports: ["websocket", "polling"] });
    setSocket(s);
    const join = () => s.emit("join", { sessionId }, (r: { error?: string; role?: Role; state?: RoomState }) => {
      if (r.error) return setError(r.error);
      setRole(r.role!);
      setState(r.state!);
    });
    s.on("connect", () => { setConnected(true); join(); });
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", (e) => setError(e.message === "unauthorized" ? "Please log in again." : "Can't reach the lesson server — retrying…"));
    s.on("state", (st: RoomState) => setState((cur) => (!cur || st.version >= cur.version ? st : cur)));
    s.on("presence", setPresence);
    s.on("ended", () => setEnded(true));
    return () => { s.disconnect(); };
  }, [sessionId]);

  const dispatch = useCallback((a: RoomAction) => socket?.emit("action", a), [socket]);
  return { socket, state, role, presence, error, ended, connected, dispatch };
}

/** Throttle helper for pointer moves. */
export function useThrottle<T extends unknown[]>(fn: (...a: T) => void, ms: number) {
  const last = useRef(0);
  return useCallback((...a: T) => {
    const now = Date.now();
    if (now - last.current >= ms) { last.current = now; fn(...a); }
  }, [fn, ms]);
}
