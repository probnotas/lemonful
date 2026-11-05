import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, Check, Users, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { ResendButton } from "./ResendButton";

export const metadata = { title: "Check your email" };

export default async function CheckEmail({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email = "" } = await searchParams;
  // Development convenience only: show the verification link so you can test without an inbox.
  let devLink: string | null = null;
  if (process.env.NODE_ENV !== "production" && email) {
    const u = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (u?.verifyToken && !u.emailVerified) devLink = `/verify?token=${u.verifyToken}`;
  }
  const steps = [
    { Icon: Mail, bg: "bg-teal-light", ic: "bg-sky-100 text-teal", title: "Check your email", body: <>We&apos;ve sent a verification email to {email || "your inbox"}. Click the link in the email to confirm your address.</> },
    { Icon: Check, bg: "bg-lemon-light", ic: "bg-lemon/40 text-navy", title: "Verify your email", body: "Once you click the link, your account will be activated and you'll be able to access your dashboard." },
    { Icon: Users, bg: "bg-leaf-light", ic: "bg-leaf/20 text-leaf", title: "We find a match", body: "We'll review your details and match your child with a trained volunteer based on their needs and your availability." },
    { Icon: CalendarDays, bg: "bg-grape-light", ic: "bg-grape/20 text-grape", title: "Start the reading journey!", body: "Once a match is confirmed, we'll email you with next steps and help you schedule your child's first lesson." },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-center">
      <Image src="/art/bear-reading.png" alt="" width={370} height={190} className="mx-auto h-40 w-auto" />
      <h1 className="mt-4 text-4xl md:text-5xl">Check your email to finish setting up your account</h1>
      <p className="mt-4 text-lg">Thank you for registering with Lemonful! We&apos;ve received your information and sent a verification link to <span className="rounded-full bg-lemon/60 px-3 py-0.5 font-bold">{email || "your email"}</span></p>
      <p className="mt-3 text-navy/75">Please check your inbox and click the link to confirm your email address. Don&apos;t see it? Check your spam folder.</p>
      {devLink && <p className="mt-4"><Link href={devLink} className="chip bg-navy text-white px-4 py-2 text-sm">Dev mode: click to verify instantly →</Link></p>}
      <h2 className="mt-10 text-left text-3xl">What happens next?</h2>
      <div className="mt-4 grid gap-4 text-left md:grid-cols-4">
        {steps.map(({ Icon, bg, ic, title, body }, i) => (
          <div key={title} className={`relative rounded-3xl ${bg} p-5`}>
            <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full ${ic}`}><Icon /></span>
            <h3 className="mt-3 text-xl">{i + 1}. {title}</h3>
            <p className="mt-1 text-sm text-navy/80">{body}</p>
            {i < 3 && <ArrowRight className="absolute -right-4 top-1/2 hidden md:block text-navy" />}
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-4 text-left md:grid-cols-[3fr_2fr]">
        <div className="flex items-center gap-4 rounded-3xl bg-teal-light/60 p-5">
          <Image src="/art/books-stack.png" alt="" width={120} height={100} className="hidden sm:block rounded-xl" />
          <div><h3 className="text-2xl">Didn&apos;t receive the email?</h3><p className="text-sm text-navy/80">Check your spam or junk folder, or click the button below to resend the verification email.</p>{email && <ResendButton email={email} />}</div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-3xl bg-lemon-light p-5">
          <div><h3 className="text-2xl">Need help?</h3><p className="text-sm text-navy/80">If you&apos;re still having trouble, please visit our <Link href="/faq" className="underline">FAQ page</Link> or contact us at <a href="mailto:parents@lemonful.ca" className="underline">parents@lemonful.ca</a>.</p></div>
          <Image src="/art/lemon.png" alt="" width={90} height={85} />
        </div>
      </div>
      <Link href="/" className="btn-ghost mt-8 border-navy"><ArrowLeft size={18} /> Back to Homepage</Link>
    </div>
  );
}
