import Image from "next/image";
import { Title } from "@/components/Squiggle";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Contact" };

export default function Contact() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 grid gap-10 md:grid-cols-[1fr_300px]">
      <div>
        <Title>Say hello</Title>
        <p className="mt-3 mb-6 text-lg text-navy/85">Questions about lessons, volunteering or partnering with Lemonful? We&apos;d love to hear from you.</p>
        <ContactForm />
      </div>
      <div className="space-y-4 pt-4">
        <Image src="/art/lemon.png" alt="" width={160} height={150} className="mx-auto" />
        <div className="card p-5 text-sm"><p className="font-bold">Families</p><a className="underline" href="mailto:parents@lemonful.ca">parents@lemonful.ca</a></div>
        <div className="card p-5 text-sm"><p className="font-bold">Volunteers</p><a className="underline" href="mailto:volunteers@lemonful.ca">volunteers@lemonful.ca</a></div>
      </div>
    </div>
  );
}
