import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Laptop, ClipboardList, Heart, GraduationCap, CheckCircle2 } from "lucide-react";
import { Spark } from "@/components/Squiggle";
import { BOOKS } from "@/lib/curriculum";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-10 pb-6 md:grid-cols-2 md:pt-16">
          <div>
            <h1 className="text-5xl leading-[1.05] md:text-7xl">
              Little readers.<br />
              <span className="inline-flex items-start gap-2">Big adventures.<Spark className="w-10 h-10 md:w-14 md:h-14 shrink-0" /></span>
            </h1>
            <p className="mt-6 max-w-md text-lg md:text-xl text-navy/85">
              Free, one-on-one online reading lessons that help children learn to read, with trained high-school volunteers by their side.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup/parent" className="btn-coral">Get Free Reading Support <ArrowRight size={18} /></Link>
              <Link href="/signup/volunteer" className="btn-outline">Become a Volunteer <ArrowRight size={18} /></Link>
            </div>
          </div>
          <div className="relative">
            <Image src="/art/hero.png" alt="Bear, Pup and friends reading by the sea with a friendly whale" width={484} height={360} priority className="w-full h-auto rounded-[2.5rem]" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="inline-flex items-start gap-2 text-4xl md:text-5xl">How It Works <Spark /></h2>
        <p className="mt-2 text-navy/80">Getting started is simple. Here&apos;s how it works:</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {[
            { n: 1, color: "bg-coral", img: "/art/step-account.png", title: "Create an Account", body: "Parents sign up and tell us a bit about your child." },
            { n: 2, color: "bg-teal", img: "/art/step-match.png", title: "Get Matched", body: "We connect your child with a trained high-school volunteer who fits your schedule." },
            { n: 3, color: "bg-grape", img: "/art/step-read.png", title: "Start Reading", body: "Enjoy fun, interactive 30-minute online lessons from the comfort of home." },
          ].map((s) => (
            <div key={s.n} className="relative flex flex-col items-center">
              <span className={`absolute left-4 top-0 grid h-12 w-12 place-items-center rounded-full ${s.color} text-2xl font-display font-bold text-white`}>{s.n}</span>
              <Image src={s.img} alt="" width={220} height={165} className="h-40 w-auto" />
              <h3 className="mt-3 text-2xl">{s.title}</h3>
              <p className="mt-1 max-w-xs text-navy/80">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Books */}
      <section className="bg-lemon-light/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-center text-4xl md:text-5xl"><span className="inline-flex items-start gap-2">Six Stories. A Lifetime of Skills.<Spark /></span></h2>
          <div className="mt-10 grid items-center gap-10 md:grid-cols-[3fr_2fr]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(BOOKS).map(([id, b]) => (
                <Link key={id} href={`/books#${id}`} className="overflow-hidden rounded-xl shadow-soft transition hover:-translate-y-1">
                  <Image src={b.cover} alt={b.title} width={148} height={96} className="w-full h-auto" />
                </Link>
              ))}
            </div>
            <div>
              <p className="text-lg text-navy/85">Our original Lemonful books each focus on a key reading rule, taking children on a fun and meaningful journey from their first words to confident, independent reading.</p>
              <Link href="/books" className="btn-lemon mt-6">Explore Our Books <ArrowRight size={18} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid items-center gap-6 rounded-[2rem] bg-coral-light/60 p-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex items-center gap-4">
            <Image src="/art/bear-heart.png" alt="" width={120} height={86} className="rounded-2xl" />
            <blockquote className="text-navy/90">
              &ldquo;My daughter looks forward to her sessions every week. She&apos;s more confident with reading and even points out words everywhere now!&rdquo;
              <footer className="mt-2 font-bold">— Parent</footer>
            </blockquote>
          </div>
          {[
            { Icon: ShieldCheck, text: "Trained and approved high-school volunteers" },
            { Icon: Laptop, text: "Safe and secure online sessions" },
            { Icon: ClipboardList, text: "Parent insights after every lesson" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex flex-col items-center text-center gap-2 md:border-l border-navy/10 px-4">
              <Icon className="h-10 w-10 text-teal" strokeWidth={1.6} />
              <p className="text-sm font-semibold">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Parents / volunteers */}
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-[2rem] bg-lemon-light p-8">
          <h2 className="flex items-center gap-3 text-4xl"><Heart className="h-9 w-9 fill-coral text-coral" /> For Parents</h2>
          <p className="mt-1 text-lg">Give your child the gift of reading.</p>
          <ul className="mt-5 space-y-2 max-w-[60%]">
            {["Structured, engaging reading lessons", "One-on-one support from trained high-school volunteers", "Progress updates so you can see their growth"].map((t) => (
              <li key={t} className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 fill-lemon text-white" /> {t}</li>
            ))}
          </ul>
          <Link href="/signup/parent" className="btn-coral mt-6">Get Free Reading Support <ArrowRight size={18} /></Link>
          <Image src="/art/parents-bear.png" alt="" width={210} height={172} className="absolute bottom-0 right-2 hidden sm:block w-48 rounded-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-[2rem] bg-teal-light p-8">
          <h2 className="flex items-center gap-3 text-4xl"><GraduationCap className="h-9 w-9 text-navy" /> For Volunteers</h2>
          <p className="mt-1 text-lg">Make a real difference.</p>
          <ul className="mt-5 space-y-2 max-w-[60%]">
            {["Use our guided lesson plans and training", "Earn community service hours", "Help a child become a confident reader", "Be part of a supportive community"].map((t) => (
              <li key={t} className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 fill-teal text-white" /> {t}</li>
            ))}
          </ul>
          <Link href="/signup/volunteer" className="btn-teal mt-6">Become a Volunteer <ArrowRight size={18} /></Link>
          <Image src="/art/volunteer-dog.png" alt="" width={185} height={185} className="absolute bottom-0 right-2 hidden sm:block w-44 rounded-2xl" />
        </div>
      </section>
    </>
  );
}
