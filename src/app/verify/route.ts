import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { homeFor, startSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const user = token ? await db.user.findUnique({ where: { verifyToken: token } }) : null;
  if (!user) return NextResponse.redirect(new URL("/login?expired=1", req.url));
  await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date(), verifyToken: null } });
  await startSession(user);
  const dest = user.role === "VOLUNTEER" ? "/volunteer/training" : user.role === "PARENT" ? "/parent?welcome=1" : homeFor(user.role);
  return NextResponse.redirect(new URL(dest, req.url));
}
