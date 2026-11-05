import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { fmtDate, fmtTime } from "@/lib/utils";
import { markHandled } from "@/lib/actions/admin";

export const metadata = { title: "Inbox" };

export default async function Inbox() {
  await requireUser("ADMIN");
  const [msgs, emails, logs] = await Promise.all([
    db.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    db.emailOutbox.findMany({ orderBy: { sentAt: "desc" }, take: 30 }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 40, include: { actor: { select: { firstName: true, role: true } } } }),
  ]);
  return (
    <div className="space-y-8">
      <PageHeader title="Inbox & logs" />
      <section className="card p-6"><h2 className="text-2xl">Contact messages</h2>
        <ul className="mt-3 space-y-3">{msgs.map((m) => (
          <li key={m.id} className={`rounded-xl p-3 ${m.handled ? "bg-navy/5 opacity-60" : "bg-lemon-light"}`}>
            <div className="flex justify-between gap-2"><p className="font-bold">{m.name} &lt;{m.email}&gt; <span className="chip bg-white">{m.topic}</span></p>{!m.handled && <form action={markHandled.bind(null, m.id)}><button className="text-sm underline">Mark handled</button></form>}</div>
            <p className="text-sm whitespace-pre-wrap">{m.message}</p><p className="text-xs text-navy/50">{fmtDate(m.createdAt)} {fmtTime(m.createdAt)}</p>
          </li>))}
          {msgs.length === 0 && <li className="text-navy/60">No messages.</li>}
        </ul>
      </section>
      <section className="card p-6"><h2 className="text-2xl">Email outbox</h2><p className="text-sm text-navy/60">Every email the platform sends. {process.env.RESEND_API_KEY ? "Delivered via Resend." : "Dev mode: not actually delivered (set RESEND_API_KEY)."}</p>
        <ul className="mt-3 space-y-2">{emails.map((e) => (
          <li key={e.id}><details className="rounded-xl bg-cream p-3"><summary className="cursor-pointer text-sm"><b>{e.subject}</b> → {e.to} <span className="text-navy/50">· {fmtDate(e.sentAt)} {fmtTime(e.sentAt)}</span></summary><pre className="mt-2 whitespace-pre-wrap text-xs">{e.body}</pre></details></li>))}
        </ul>
      </section>
      <section className="card p-6"><h2 className="text-2xl">Audit log</h2><p className="text-sm text-navy/60">Access to and changes of children&apos;s data.</p>
        <table className="mt-3 w-full text-sm"><tbody>{logs.map((l) => <tr key={l.id} className="border-t border-navy/5"><td className="py-1 pr-3 whitespace-nowrap text-navy/60">{fmtDate(l.createdAt)} {fmtTime(l.createdAt)}</td><td className="pr-3">{l.actor ? `${l.actor.firstName} (${l.actor.role.toLowerCase()})` : "system"}</td><td className="pr-3 font-mono text-xs">{l.action}</td><td className="font-mono text-xs text-navy/60">{l.target}</td></tr>)}</tbody></table>
      </section>
    </div>
  );
}
