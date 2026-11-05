import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { TRAINING } from "@/lib/training";
import { fmtDate, fmtHours } from "@/lib/utils";
import { setVolunteerStatus, adjustHours } from "@/lib/actions/admin";

export const metadata = { title: "Volunteers" };

const ORDER: Record<string, number> = { AWAITING_APPROVAL: 0, PENDING_TRAINING: 1, APPROVED: 2, PAUSED: 3 };

export default async function Volunteers() {
  await requireUser("ADMIN");
  const vols = await db.user.findMany({ where: { role: "VOLUNTEER" }, include: { volunteerProfile: true, hours: true, _count: { select: { assignedChildren: true } } }, orderBy: { createdAt: "desc" } });
  vols.sort((a, b) => ORDER[a.volunteerProfile?.status ?? ""] - ORDER[b.volunteerProfile?.status ?? ""]);
  return (
    <div>
      <PageHeader title="Volunteers" />
      <div className="space-y-4">
        {vols.map((v) => {
          const p = v.volunteerProfile!;
          const mods = JSON.parse(p.completedModules).length;
          return (
            <div key={v.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[220px]">
                  <p className="text-lg font-bold">{v.firstName} {v.lastName} <span className="chip bg-navy/5 ml-1">{p.status.replace("_", " ").toLowerCase()}</span></p>
                  <p className="text-sm text-navy/70">{v.email} · {p.school}, grade {p.grade}, age {p.age} · joined {fmtDate(v.createdAt)}{v.emailVerified ? "" : " · ⚠️ email unverified"}</p>
                  <p className="text-sm">Training {mods}/{TRAINING.length} · {v._count.assignedChildren} student(s) · {fmtHours(v.hours.reduce((a, h) => a + h.minutes, 0))} h</p>
                  {p.guardianEmail && <p className="text-xs text-navy/60">Guardian: {p.guardianName} &lt;{p.guardianEmail}&gt;</p>}
                  {p.whyVolunteer && <p className="mt-1 text-sm italic">&ldquo;{p.whyVolunteer}&rdquo;</p>}
                </div>
                <div className="flex gap-2">
                  {p.status !== "APPROVED" && <form action={setVolunteerStatus.bind(null, v.id, "APPROVED")}><button className="btn-teal btn-sm" disabled={mods < TRAINING.length}>Approve</button></form>}
                  {p.status === "APPROVED" && <form action={setVolunteerStatus.bind(null, v.id, "PAUSED")}><button className="btn-ghost btn-sm">Pause</button></form>}
                </div>
              </div>
              <details className="mt-2 text-sm"><summary className="cursor-pointer text-navy/60">Adjust hours</summary>
                <form action={adjustHours.bind(null, v.id)} className="mt-2 flex gap-2"><input name="hours" type="number" step="0.25" placeholder="+/- hours" className="input w-32 py-1.5" /><input name="description" placeholder="Reason" className="input py-1.5" /><button className="btn-ghost btn-sm">Add</button></form>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
