import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, GraduationCap, HeartHandshake, Trophy, ScrollText, Users } from "lucide-react";
import { Title } from "@/components/Squiggle";

export const metadata = { title: "For Volunteers" };

export default function Volunteers() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <Title>Make a real difference</Title>
          <p className="mt-4 text-lg text-navy/85">High-school students (14+) tutor one child each week using our guided lesson scripts. You&apos;ll earn verified community-service hours — tracked automatically — and watch a child become a reader.</p>
          <Link href="/signup/volunteer" className="btn-teal mt-8">Become a Volunteer <ArrowRight size={18} /></Link>
        </div>
        <Image src="/art/volunteer-dog.png" alt="" width={370} height={370} className="mx-auto w-72 rounded-[2rem]" />
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { Icon: GraduationCap, title: "~2 hours of training", body: "Five short online modules: safety, phonics basics, and how lessons work. Training counts toward your hours." },
          { Icon: ScrollText, title: "Guided scripts", body: "Every step tells you your goal, what to say, questions to ask and a tip. No teaching experience needed." },
          { Icon: Clock, title: "Automatic hours", body: "Every completed session is logged. Print a certificate of your community-service hours anytime." },
          { Icon: Users, title: "Your own students", body: "We match you with 1–2 children whose schedules fit yours." },
          { Icon: Trophy, title: "Impact tracker", body: "See your hours, sessions, and how many kids are now readers because of you." },
          { Icon: HeartHandshake, title: "Support when you need it", body: "Lemonful staff review every session note and are a message away." },
        ].map(({ Icon, title, body }) => (
          <div key={title} className="card p-6">
            <Icon className="h-9 w-9 text-teal" />
            <h3 className="mt-3 text-xl">{title}</h3>
            <p className="mt-1 text-navy/80">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-16 rounded-[2rem] bg-teal-light p-8">
        <h2 className="text-3xl">The path to your first session</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {["Apply (5 min)", "Complete training modules", "Get approved by Lemonful", "Get matched & start tutoring"].map((s, i) => (
            <div key={s} className="rounded-2xl bg-white p-4"><span className="font-display text-3xl text-teal">{i + 1}</span><p className="mt-1 font-semibold">{s}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}
