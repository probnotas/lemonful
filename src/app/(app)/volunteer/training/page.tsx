import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { TRAINING, TRAINING_MINUTES } from "@/lib/training";
import { TechCheck } from "@/components/TechCheck";

export const metadata = { title: "Training" };

export default async function Training() {
  const user = await requireUser("VOLUNTEER");
  const done = new Set<string>(JSON.parse(user.volunteerProfile!.completedModules));
  return (
    <div className="space-y-6">
      <PageHeader title="Volunteer training" sub={`${done.size} of ${TRAINING.length} modules complete · Counts as ${TRAINING_MINUTES / 60} community-service hours`} />
      <div className="h-3 rounded-full bg-navy/10"><div className="h-3 rounded-full bg-teal transition-all" style={{ width: `${(done.size / TRAINING.length) * 100}%` }} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        {TRAINING.map((m, i) => (
          <Link key={m.id} href={`/volunteer/training/${m.id}`} className={`card flex items-center gap-4 p-5 transition hover:-translate-y-0.5 ${done.has(m.id) ? "bg-leaf-light/60" : ""}`}>
            <span className="text-4xl">{m.emoji}</span>
            <div className="flex-1"><p className="text-xs font-bold text-navy/50">MODULE {i + 1} · {m.minutes} MIN</p><h2 className="text-xl">{m.title}</h2></div>
            {done.has(m.id) ? <CheckCircle2 className="text-leaf" /> : <Circle className="text-navy/25" />}
          </Link>
        ))}
      </div>
      <TechCheck />
    </div>
  );
}
