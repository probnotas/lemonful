import Link from "next/link";
import { Logo } from "./Logo";
import { Instagram, Youtube } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-navy/5 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col md:flex-row items-center justify-between gap-6 px-4 py-8">
        <Logo />
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-semibold text-navy/80">
          <Link href="/parents">For Parents</Link>
          <Link href="/volunteers">For Volunteers</Link>
          <Link href="/books">Our Books</Link>
          <Link href="/about">About</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex gap-3 text-navy">
          <a href="https://instagram.com" aria-label="Instagram" className="hover:text-coral"><Instagram /></a>
          <a href="https://youtube.com" aria-label="YouTube" className="hover:text-coral"><Youtube /></a>
        </div>
      </div>
      <p className="pb-6 text-center text-xs text-navy/50">© {new Date().getFullYear()} Lemonful. Free reading support for every child.</p>
    </footer>
  );
}
