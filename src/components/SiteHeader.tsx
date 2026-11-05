import Link from "next/link";
import { Logo } from "./Logo";
import { getSession, homeFor } from "@/lib/auth";
import { MobileMenu } from "./MobileMenu";

export const PUBLIC_NAV = [
  { href: "/parents", label: "For Parents" },
  { href: "/volunteers", label: "For Volunteers" },
  { href: "/books", label: "Our Books" },
  { href: "/about", label: "About" },
];

export async function SiteHeader() {
  const session = await getSession();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-navy/5">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold">
          {PUBLIC_NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-navy/80 hover:text-teal">{n.label}</Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Link href={homeFor(session.role)} className="btn-teal btn-sm">My dashboard</Link>
          ) : (
            <Link href="/login" className="font-semibold text-navy/80 hover:text-teal">Log in</Link>
          )}
          <Link href="/contact" className="btn-lemon btn-sm px-6">Contact</Link>
        </div>
        <MobileMenu loggedIn={!!session} home={session ? homeFor(session.role) : "/login"} />
      </div>
    </header>
  );
}
