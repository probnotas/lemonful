import Link from "next/link";
import { Logo } from "./Logo";
import { NavLinks } from "./NavLinks";
import { LogOut } from "lucide-react";

const NAVS: Record<string, { href: string; label: string }[]> = {
  PARENT: [
    { href: "/parent", label: "Home" },
    { href: "/parent/sessions", label: "Lessons" },
    { href: "/parent/book", label: "Book a Lesson" },
    { href: "/parent/resources", label: "Resources" },
    { href: "/parent/settings", label: "Account" },
  ],
  VOLUNTEER: [
    { href: "/volunteer", label: "Home" },
    { href: "/volunteer/students", label: "My Students" },
    { href: "/volunteer/lessons", label: "Lessons" },
    { href: "/volunteer/schedule", label: "Schedule" },
    { href: "/volunteer/hours", label: "Community Hours" },
    { href: "/volunteer/training", label: "Training" },
  ],
  ADMIN: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/volunteers", label: "Volunteers" },
    { href: "/admin/matching", label: "Matching" },
    { href: "/admin/inbox", label: "Inbox" },
  ],
};

export function AppShell({ role, name, children }: { role: string; name: string; children: React.ReactNode }) {
  const color = role === "PARENT" ? "bg-coral" : role === "VOLUNTEER" ? "bg-teal" : "bg-grape";
  return (
    <div className="min-h-screen bg-[#f6f8fd]">
      <header className="sticky top-0 z-40 border-b border-navy/5 bg-white/95 backdrop-blur no-print">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-2.5">
          <Logo href={NAVS[role]?.[0].href ?? "/"} tagline={false} small />
          <NavLinks items={NAVS[role] ?? []} />
          <div className="ml-auto flex items-center gap-3">
            <span className={`grid h-9 w-9 place-items-center rounded-full ${color} font-bold text-white`}>{name[0]?.toUpperCase()}</span>
            <span className="hidden sm:block text-sm font-semibold">Hi, {name}</span>
            <form action="/logout" method="post"><button className="p-2 text-navy/60 hover:text-coral" title="Log out" aria-label="Log out"><LogOut size={18} /></button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

export function PageHeader({ title, sub, action }: { title: React.ReactNode; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-navy/70">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ emoji, title, body, action }: { emoji: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-5xl">{emoji}</p>
      <h3 className="mt-3 text-2xl">{title}</h3>
      {body && <p className="mt-1 text-navy/70 max-w-md mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "teal" }: { label: string; value: React.ReactNode; sub?: string; tone?: "teal" | "coral" | "lemon" | "grape" | "leaf" }) {
  const tones = { teal: "bg-teal-light text-teal", coral: "bg-coral-light text-coral", lemon: "bg-lemon-light text-lemon-dark", grape: "bg-grape-light text-grape", leaf: "bg-leaf-light text-leaf" };
  return (
    <div className={`rounded-3xl p-5 ${tones[tone]}`}>
      <p className="text-sm font-bold text-navy/70">{label}</p>
      <p className="font-display text-4xl font-bold">{value}</p>
      {sub && <p className="text-xs text-navy/60">{sub}</p>}
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    SCHEDULED: "bg-teal-light text-teal", LIVE: "bg-coral text-white", COMPLETED: "bg-leaf-light text-leaf",
    CANCELLED: "bg-navy/10 text-navy/60", MISSED: "bg-coral-light text-coral",
  };
  return <span className={`chip ${map[status] ?? "bg-navy/10"}`}>{status === "LIVE" ? "● Live now" : status[0] + status.slice(1).toLowerCase()}</span>;
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-navy/70 hover:text-teal">← {children}</Link>;
}
