import Image from "next/image";
import { PageHeader } from "@/components/AppShell";
import { TechCheck } from "@/components/TechCheck";
import { BOOKS } from "@/lib/curriculum";

export const metadata = { title: "Parent resources" };

const SOUNDS = [["s", "snake hiss: sss"], ["a", "ants on my arm: a-a-a"], ["t", "tick-tock: t-t-t"], ["p", "pop the bubble: p-p-p"], ["i", "itchy insect: i-i-i"], ["n", "noisy plane: nnn"], ["m", "yummy: mmm"], ["d", "drum: d-d-d"]];

export default function Resources() {
  return (
    <div className="space-y-8">
      <PageHeader title="Parent resources" sub="Simple ways to support your reader between lessons." />
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { e: "⏱️", t: "10 minutes a day", b: "Short, daily reading beats long, occasional sessions. Pick a cozy, regular time — like right before bed." },
          { e: "👉", t: "Point as you read", b: "Run your finger under each word as you read aloud. It shows that print carries meaning and helps tracking." },
          { e: "🔤", t: "Play \"I spy\" with sounds", b: "\"I spy something that starts with /s/…\" Use the letter sound, not the letter name." },
          { e: "🗣️", t: "Ask, don't test", b: "Ask \"What do you think will happen?\" or \"How does Bear feel?\" Talking about stories builds comprehension." },
          { e: "🎉", t: "Praise the effort", b: "\"You sounded that out all by yourself!\" is more powerful than \"You're so smart.\"" },
          { e: "📚", t: "Let them choose", b: "Kids read more when they pick the book — even if it's the same one ten times." },
        ].map((x) => <div key={x.t} className="card p-5"><p className="text-3xl">{x.e}</p><h3 className="mt-2 text-xl">{x.t}</h3><p className="text-sm text-navy/80">{x.b}</p></div>)}
      </div>
      <section className="card p-6">
        <h2 className="text-2xl">Letter-sound guide</h2>
        <p className="text-sm text-navy/70">The first sounds in our curriculum, with the actions our tutors use.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SOUNDS.map(([l, d]) => <div key={l} className="rounded-2xl bg-lemon-light p-4 text-center"><p className="font-display text-5xl font-bold">{l}</p><p className="text-xs">{d}</p></div>)}
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-2xl">The Lemonful books</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(BOOKS).map((b) => <div key={b.title} className="flex gap-3"><Image src={b.cover} alt="" width={110} height={70} className="h-16 w-auto rounded-lg" /><div><p className="font-bold">{b.title}</p><p className="text-xs text-navy/70">{b.rule}</p></div></div>)}
        </div>
      </section>
      <TechCheck />
      <section className="card p-6">
        <h2 className="text-2xl">Before each lesson</h2>
        <ul className="mt-2 list-disc pl-5 text-navy/85 space-y-1">
          <li>Use a laptop or tablet in a quiet spot, with the camera at your child&apos;s eye level.</li>
          <li>Stay nearby during the lesson — you&apos;re welcome to listen in.</li>
          <li>Log in and press <b>Join lesson</b> on your dashboard a couple of minutes early.</li>
          <li>Lessons are never recorded. If anything ever feels off, email <a className="underline" href="mailto:parents@lemonful.ca">parents@lemonful.ca</a>.</li>
        </ul>
      </section>
    </div>
  );
}
