import Link from "next/link";
import Image from "next/image";
import { LESSONS, BOOKS } from "@/lib/curriculum";
import { PageHeader } from "@/components/AppShell";

export const metadata = { title: "Lesson library" };

export default function Lessons() {
  return (
    <div>
      <PageHeader title="Lesson library" sub="Preview every script before you teach it, or try the activities in practice mode." />
      <div className="grid gap-5 md:grid-cols-2">
        {LESSONS.map((l) => (
          <Link key={l.number} href={`/volunteer/lessons/${l.number}`} className="card flex gap-4 p-5 hover:-translate-y-0.5 transition">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-lemon font-display text-2xl font-bold">{l.number}</span>
            <div className="flex-1">
              <h2 className="text-xl">{l.title}</h2>
              <p className="text-sm text-navy/70">{l.focus}</p>
              <p className="mt-1 text-xs text-navy/60">{l.steps.length} steps · ~{l.steps.reduce((a, s) => a + s.minutes, 0)} min</p>
            </div>
            {l.book && <Image src={BOOKS[l.book].cover} alt="" width={90} height={58} className="h-14 w-auto self-center rounded-lg" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
