export function Spark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="#fbcd2f" strokeWidth="5" strokeLinecap="round" aria-hidden>
      <path d="M8 14 L18 4" /><path d="M12 24 L34 18" /><path d="M14 34 L30 36" />
    </svg>
  );
}
export function Title({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={`inline-flex items-start gap-2 text-4xl md:text-5xl text-navy ${className}`}>
      <span>{children}</span>
      <Spark className="w-8 h-8 md:w-10 md:h-10 shrink-0 -mt-1" />
    </h1>
  );
}
