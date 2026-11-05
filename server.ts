/**
 * Lemonful server: Next.js + a Socket.IO realtime layer for tutoring rooms.
 *
 * The socket layer does three things for each live session:
 *   1. Authorises who may join (the assigned volunteer, or the child's parent account).
 *   2. Holds the authoritative synchronized lesson state (see src/lib/room-state.ts).
 *   3. Relays WebRTC signalling so the two browsers can open a direct video call.
 *
 * Run with `npm run dev` (development) or `npm start` (after `npm run build`).
 */
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { SESSION_COOKIE, readCookie, verifySession } from "./src/lib/session-token";
import { initialRoomState, reduceRoom, type RoomAction, type RoomState, type Role } from "./src/lib/room-state";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT ?? 3000);
const app = next({ dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();
const db = new PrismaClient();

// Shared with Next route handlers (same process) so the "end session" API can score the final state.
const g = globalThis as unknown as { __lemonfulRooms?: Map<string, RoomState> };
const rooms = (g.__lemonfulRooms ??= new Map<string, RoomState>());
const presence = new Map<string, { volunteer: number; child: number }>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer, { path: "/rt", serveClient: false });

  io.use(async (socket, nextFn) => {
    const user = await verifySession(readCookie(socket.handshake.headers.cookie, SESSION_COOKIE));
    if (!user) return nextFn(new Error("unauthorized"));
    socket.data.user = user;
    nextFn();
  });

  io.on("connection", (socket) => {
    let joined: { id: string; role: Role } | null = null;

    socket.on("join", async ({ sessionId }: { sessionId: string }, ack?: (r: unknown) => void) => {
      const user = socket.data.user as { sub: string };
      const session = await db.tutoringSession.findUnique({ where: { id: String(sessionId) }, include: { child: true } });
      if (!session || session.status === "CANCELLED") return ack?.({ error: "Session not found" });
      let role: Role | null = null;
      if (session.volunteerId === user.sub) role = "volunteer";
      else if (session.child.parentId === user.sub) role = "child";
      if (!role) return ack?.({ error: "You don't have access to this session" });

      joined = { id: session.id, role };
      const room = `s:${session.id}`;
      await socket.join(room);
      if (!rooms.has(session.id)) rooms.set(session.id, initialRoomState(session.lessonNumber));
      const p = presence.get(session.id) ?? { volunteer: 0, child: 0 };
      p[role]++;
      presence.set(session.id, p);

      if (role === "volunteer" && session.status === "SCHEDULED") {
        await db.tutoringSession.update({ where: { id: session.id }, data: { status: "LIVE", startedAt: new Date() } });
      }
      ack?.({ role, state: rooms.get(session.id) });
      io.to(room).emit("presence", { volunteer: p.volunteer > 0, child: p.child > 0 });
    });

    socket.on("action", (action: RoomAction) => {
      if (!joined) return;
      const cur = rooms.get(joined.id);
      if (!cur) return;
      const nextState = reduceRoom(cur, action, joined.role);
      if (nextState === cur) return;
      rooms.set(joined.id, nextState);
      // Pointer moves are high-frequency: send only to the other side, volatile.
      if (action.t === "pointer" || action.t === "pointer-clear") socket.to(`s:${joined.id}`).volatile.emit("state", nextState);
      else io.to(`s:${joined.id}`).emit("state", nextState);
    });

    // WebRTC signalling relay (offer/answer/ICE) to the other participant.
    socket.on("signal", (data: unknown) => {
      if (joined) socket.to(`s:${joined.id}`).emit("signal", data);
    });

    socket.on("end", () => {
      if (joined?.role === "volunteer") socket.to(`s:${joined.id}`).emit("ended");
    });

    socket.on("disconnect", () => {
      if (!joined) return;
      const p = presence.get(joined.id);
      if (!p) return;
      p[joined.role] = Math.max(0, p[joined.role] - 1);
      io.to(`s:${joined.id}`).emit("presence", { volunteer: p.volunteer > 0, child: p.child > 0 });
    });
  });

  httpServer.listen(port, () => console.log(`🍋 Lemonful ready on http://localhost:${port}`));
});
