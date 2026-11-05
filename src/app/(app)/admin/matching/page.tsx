import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { suggestVolunteers } from "@/lib/matching";
import { PageHeader, Empty } from "@/components/AppShell";
import { DAYS, READING_LEVELS, avatar, hourLabel } from "@/lib/utils";
import { matchChild } from "@/lib/actions/admin";

export const metadata = { title: "Matching" };

export default async function Matching() {
  await requireUser("ADMIN");
  const waiting = await db.child.findMany({ where: { volunteerId: null }, include: { parent: { include: { availability: true } } }, orderBy: { createdAt: "asc" } });
  const matched = await db.child.findMany({ where: { NOT: { volunteerId: null } }, include: { volunteer: true, parent: true } });
  const suggestions = await Promise.all(waiting.map((c) => suggestVolunteers(c.id)));
  return (
    <div className="space-y-8">
      <PageHeader title="Matching" sub="Suggestions rank approved volunteers by shared weekly availability and current load." />
      {waiting.length === 0 ? <Empty emoji="🎉" title="Every child is matched!" /> : waiting.map((c, i) => (
        <div key={c.id} className="card p-5">
          <div className="flex items-center gap-3"><span className="text-4xl">{avatar(c.avatar)}</span>
            <div><p className="text-lg font-bold">{c.firstName}, {c.age} <span className="text-sm font-normal text-navy/60">— parent {c.parent.firstName} {c.parent.lastName}, {c.parent.city ?? "—"}</span></p>
              <p className="text-sm text-navy/70">{READING_LEVELS[c.readingLevel]} · start Lesson {c.startLesson}{c.notes && <> · &ldquo;{c.notes}&rdquo;</>}</p></div></div>
          <div className="mt-3 grid gap-2">
            {suggestions[i].length === 0 && <p className="text-sm text-coral">No approved volunteer with overlapping availability and free capacity.</p>}
            {suggestions[i].slice(0, 4).map((s) => (
              <form key={s.volunteer.id} action={matchChild.bind(null, c.id, s.volunteer.id)} className="flex flex-wrap items-center gap-3 rounded-xl bg-cream p-3">
                <p className="flex-1 text-sm"><b>{s.volunteer.firstName} {s.volunteer.lastName}</b> · {s.load}/{s.cap} students · {s.overlap.length} shared slots: {s.overlap.slice(0, 4).map((o) => `${DAYS[o.day]} ${hourLabel(o.hour).split(" –")[0]}`).join(", ")}{s.overlap.length > 4 ? "…" : ""}</p>
                <button className="btn-teal btn-sm">Match</button>
              </form>
            ))}
          </div>
        </div>
      ))}
      <section className="card p-6"><h2 className="text-2xl">Current matches</h2>
        <ul className="mt-2 divide-y divide-navy/5">{matched.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-2 text-sm"><span>{avatar(c.avatar)}</span><span className="flex-1"><b>{c.firstName}</b> ({c.parent.firstName} {c.parent.lastName}) ↔ <b>{c.volunteer?.firstName} {c.volunteer?.lastName}</b></span>
            <form action={matchChild.bind(null, c.id, null)}><button className="text-coral underline">Unmatch</button></form></li>
        ))}</ul>
      </section>
    </div>
  );
}
