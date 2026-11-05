import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/AppShell";
import { AccountForm, AvailabilityEditor, DeleteAccount } from "@/components/forms/SettingsForms";

export const metadata = { title: "Account settings" };

export default async function Settings() {
  const user = await requireUser("PARENT");
  const slots = await db.availability.findMany({ where: { userId: user.id }, select: { day: true, hour: true } });
  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader title="Account settings" />
      <AccountForm user={{ firstName: user.firstName, lastName: user.lastName, email: user.email, city: user.city ?? "", postalCode: user.postalCode ?? "" }} />
      <section id="availability" className="card p-6"><h2 className="text-2xl mb-1">Family availability</h2><p className="mb-4 text-sm text-navy/70">Used for matching and booking.</p><AvailabilityEditor initial={slots} /></section>
      <DeleteAccount note="This permanently deletes your account, your children's profiles, progress and session history." />
    </div>
  );
}
