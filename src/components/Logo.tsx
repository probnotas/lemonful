import Link from "next/link";

export function LemonMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <path d="M34 12c4-8 14-8 18-6-2 6-10 10-18 6z" fill="#3aa35b" />
      <path d="M32 16c0-4 1-6 2-8" stroke="#2f7d46" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="31" cy="38" rx="22" ry="21" fill="#fbcd2f" />
      <ellipse cx="26" cy="31" rx="9" ry="6" fill="#fff3b0" opacity=".7" />
    </svg>
  );
}

export function Logo({ href = "/", tagline = true, small = false }: { href?: string; tagline?: boolean; small?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2 shrink-0" aria-label="Lemonful home">
      <LemonMark className={small ? "h-8 w-8" : "h-11 w-11"} />
      <span className="leading-none">
        <span className={`font-display font-bold text-navy ${small ? "text-2xl" : "text-[1.9rem]"}`}>Lemonful</span>
        {tagline && <span className="block text-[11px] font-semibold text-navy/70 -mt-0.5">Opening up a world of words.</span>}
      </span>
    </Link>
  );
}
