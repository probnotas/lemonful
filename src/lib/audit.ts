import "server-only";
import { db } from "./db";

export async function audit(actorId: string | null, action: string, target: string) {
  try { await db.auditLog.create({ data: { actorId, action, target } }); } catch { /* never block the request */ }
}
