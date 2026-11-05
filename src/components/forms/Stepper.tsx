export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 md:gap-4">
      {steps.map((s, i) => {
        const state = i === current ? "current" : i < current ? "done" : "todo";
        return (
          <li key={s} className="flex items-center gap-2">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${state === "current" ? "bg-teal text-white" : state === "done" ? "bg-teal/15 text-teal" : "bg-navy/10 text-navy/60"}`}>{i + 1}</span>
            <span className={`text-sm ${state === "current" ? "font-bold text-navy" : "text-navy/60"}`}>{s}</span>
            {i < steps.length - 1 && <span className="hidden md:block w-10 border-t-2 border-dashed border-navy/15" />}
          </li>
        );
      })}
    </ol>
  );
}

export function Field({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block">
      <span className="label">{label}{required && <span className="text-coral"> *</span>}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold text-coral">{error}</span>}
    </label>
  );
}

export function SidePanel({ title, items, img = "/art/bear-book.png" }: { title: string; items: { icon: React.ReactNode; text: React.ReactNode }[]; img?: string }) {
  return (
    <aside className="rounded-3xl bg-lemon-light/80 p-6 h-fit">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} alt="" className="mx-auto h-28 w-auto" />
      <h3 className="mt-4 text-xl">{title}</h3>
      <ul className="mt-3 space-y-3 text-sm text-navy/85">
        {items.map((it, i) => <li key={i} className="flex gap-3"><span className="shrink-0">{it.icon}</span><span>{it.text}</span></li>)}
      </ul>
    </aside>
  );
}
