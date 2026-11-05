import Link from "next/link";
import { Printer } from "lucide-react";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { volunteerStats } from "@/lib/progress";
import { PageHeader, Stat } from "@/components/AppShell";
import { fmtDate, fmtHours } from "@/lib/utils";

export const metadata = { title: "Community hours" };

export default async function Hours() {
  const user = await requireUser("VOLUNTEER");
  const [entries, stats] = await Promise.all([db.hourEntry.findMany({ where: { userId: user.id }, orderBy: { date: "desc" } }), volunteerStats(user.id)]);
  return (
    <div className="space-y-6">
      <PageHeader title="Community-service hours" sub="Logged automatically for every completed session and your training." action={<Link href="/volunteer/hours/certificate" className="btn-teal btn-sm"><Printer size={16} /> Print certificate</Link>} />
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Stat label="Total hours" value={fmtHours(stats.minutes)} tone="teal" />
        <Stat label="Sessions" value={stats.sessions} tone="coral" />
        <Stat label="Children tutored" value={stats.kids} tone="grape" />
        <Stat label="New readers" value={stats.readers} tone="lemon" />
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left"><tr><th className="p-3">Date</th><th className="p-3">Activity</th><th className="p-3">Type</th><th className="p-3 text-right">Hours</th></tr></thead>
          <tbody>
            {entries.map((e) => <tr key={e.id} className="border-t border-navy/5"><td className="p-3">{fmtDate(e.date, { year: "numeric", month: "short", day: "numeric" })}</td><td className="p-3">{e.description}</td><td className="p-3"><span className="chip bg-navy/5">{e.kind.toLowerCase()}</span></td><td className="p-3 text-right font-bold">{fmtHours(e.minutes)}</td></tr>)}
            {entries.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-navy/60">Your hours will appear here.</td></tr>}
          </tbody>
          <tfoot className="bg-cream font-bold"><tr><td className="p-3" colSpan={3}>Total</td><td className="p-3 text-right">{fmtHours(stats.minutes)}</td></tr></tfoot>
        </table>
      </div>
    </div>
  );
}
