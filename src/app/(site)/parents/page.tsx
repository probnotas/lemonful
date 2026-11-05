import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, LineChart, MessageSquareHeart, ShieldCheck, Video, BookOpen } from "lucide-react";
import { Title } from "@/components/Squiggle";

export const metadata = { title: "For Parents" };

export default function Parents() {
  const features = [
    { Icon: BookOpen, title: "A structured 8-lesson journey", body: "From first letter sounds to reading a whole book, built on proven phonics." },
    { Icon: Video, title: "Live, one-on-one, online", body: "Your child sees their tutor on video and plays reading games together on a shared screen." },
    { Icon: CalendarCheck, title: "You choose the times", body: "Pick weekly windows that suit your family; book and reschedule from your dashboard." },
    { Icon: LineChart, title: "See their progress", body: "Milestones, sounds mastered and a summary from the tutor after every lesson." },
    { Icon: ShieldCheck, title: "Safety first", body: "Trained, approved volunteers. Sessions only happen inside Lemonful, from your account, and are never recorded." },
    { Icon: MessageSquareHeart, title: "Always free", body: "Lemonful is free for families. No credit card, ever." },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <Title>Give your child the gift of reading</Title>
          <p className="mt-4 text-lg text-navy/85">Lemonful pairs your child (ages 4–9) with a caring high-school volunteer for weekly 45-minute reading lessons. Everything happens in your browser — no downloads.</p>
          <Link href="/signup/parent" className="btn-coral mt-8">Get Free Reading Support <ArrowRight size={18} /></Link>
        </div>
        <Image src="/art/parents-bear.png" alt="" width={420} height={344} className="mx-auto w-80 rounded-[2rem]" />
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {features.map(({ Icon, title, body }) => (
          <div key={title} className="card p-6">
            <Icon className="h-9 w-9 text-coral" />
            <h3 className="mt-3 text-xl">{title}</h3>
            <p className="mt-1 text-navy/80">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 card p-8">
        <h2 className="text-3xl">What a lesson looks like</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-4">
          {["Welcome & connection — a few silly questions to build trust", "Sound games — matching pictures to letters", "Blending & building words together", "Story time with a Lemonful book, then celebrate!"].map((s, i) => (
            <li key={s} className="rounded-2xl bg-cream p-4"><span className="font-display text-3xl text-coral">{i + 1}</span><p className="mt-1">{s}</p></li>
          ))}
        </ol>
      </div>
    </div>
  );
}
