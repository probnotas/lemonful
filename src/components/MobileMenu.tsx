"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/parents", label: "For Parents" },
  { href: "/volunteers", label: "For Volunteers" },
  { href: "/books", label: "Our Books" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function MobileMenu({ loggedIn, home }: { loggedIn: boolean; home: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button aria-label="Menu" onClick={() => setOpen(!open)} className="p-2 rounded-xl hover:bg-navy/5">
        {open ? <X /> : <Menu />}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full bg-white border-b shadow-soft px-4 py-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="py-2 font-semibold">{n.label}</Link>
          ))}
          <Link href={home} onClick={() => setOpen(false)} className="btn-teal btn-sm mt-2">{loggedIn ? "My dashboard" : "Log in"}</Link>
        </div>
      )}
    </div>
  );
}
