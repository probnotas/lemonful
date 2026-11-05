"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ items }: { items: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto text-sm font-semibold">
      {items.map((n, i) => {
        const active = i === 0 ? path === n.href : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-full px-3 py-1.5 ${active ? "bg-navy text-white" : "text-navy/75 hover:bg-navy/5"}`}>{n.label}</Link>
        );
      })}
    </nav>
  );
}
