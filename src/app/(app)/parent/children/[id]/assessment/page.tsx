import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { Assessment } from "./Assessment";

export const metadata = { title: "Reading check" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser("PARENT");
  const child = await db.child.findFirst({ where: { id, parentId: user.id } });
  if (!child) notFound();
  return <Assessment childId={child.id} name={child.firstName} />;
}
