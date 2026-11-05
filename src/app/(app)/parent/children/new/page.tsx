import { PageHeader, BackLink } from "@/components/AppShell";
import { AddChildForm } from "./AddChildForm";
export const metadata = { title: "Add a child" };
export default function Page() {
  return <><BackLink href="/parent">Dashboard</BackLink><PageHeader title="Add a child" sub="We'll match them with a volunteer based on your family availability." /><AddChildForm /></>;
}
