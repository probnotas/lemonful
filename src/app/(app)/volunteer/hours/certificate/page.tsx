import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { LemonMark } from "@/components/Logo";
import { fmtDate, fmtHours } from "@/lib/utils";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "Certificate of hours" };

export default async function Certificate() {
  const user = await requireUser("VOLUNTEER");
  const entries = await db.hourEntry.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } });
  const total = entries.reduce((a, e) => a + e.minutes, 0);
  const first = entries[0]?.date, last = entries.at(-1)?.date;
  return (
    <div>
      <div className="no-print mb-4 flex justify-end"><PrintButton /></div>
      <div className="mx-auto max-w-3xl rounded-[2rem] border-8 border-lemon bg-white p-12 text-center shadow-soft print:shadow-none">
        <LemonMark className="mx-auto h-16 w-16" />
        <p className="mt-2 font-display text-xl font-bold tracking-wide text-teal">LEMONFUL</p>
        <h1 className="mt-6 text-4xl">Certificate of Community Service</h1>
        <p className="mt-6 text-lg">This certifies that</p>
        <p className="mt-2 font-display text-5xl font-bold text-coral">{user.firstName} {user.lastName}</p>
        <p className="mt-2 text-navy/70">{user.volunteerProfile?.school}</p>
        <p className="mt-6 text-lg">completed <b>{fmtHours(total)} hours</b> of volunteer service as a one-on-one reading tutor with Lemonful{first && last ? <>, between {fmtDate(first, { year: "numeric", month: "long", day: "numeric" })} and {fmtDate(last, { year: "numeric", month: "long", day: "numeric" })}</> : null}.</p>
        <table className="mx-auto mt-8 text-left text-sm">
          <tbody>{entries.map((e) => <tr key={e.id}><td className="pr-6">{fmtDate(e.date, { year: "numeric", month: "short", day: "numeric" })}</td><td className="pr-6">{e.description}</td><td className="text-right">{fmtHours(e.minutes)} h</td></tr>)}</tbody>
        </table>
        <div className="mt-12 flex justify-between text-sm">
          <div className="border-t border-navy pt-1 w-56">Yvonne, Founder, Lemonful</div>
          <div className="border-t border-navy pt-1 w-56">Issued {fmtDate(new Date(), { year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
        <p className="mt-6 text-xs text-navy/50">Verification ID: {user.id.slice(-10).toUpperCase()} · Questions: volunteers@lemonful.ca</p>
      </div>
    </div>
  );
}
