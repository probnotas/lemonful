import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

const GUARDS: [prefix: string, roles: string[]][] = [
  ["/parent", ["PARENT"]],
  ["/volunteer", ["VOLUNTEER"]],
  ["/admin", ["ADMIN"]],
  ["/session", ["PARENT", "VOLUNTEER"]],
];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const guard = GUARDS.find(([p]) => path === p || path.startsWith(p + "/"));
  if (!guard) return NextResponse.next();
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (!guard[1].includes(session.role)) return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/parent/:path*", "/volunteer/:path*", "/admin/:path*", "/session/:path*"] };
