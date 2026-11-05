import { Title } from "@/components/Squiggle";

export const metadata = { title: "FAQ" };

const FAQ = [
  ["Is Lemonful really free?", "Yes. Lemonful is free for every family."],
  ["What ages is Lemonful for?", "Children roughly 4–9 who are learning to read. Volunteers must be in grades 9–12 and at least 14."],
  ["What do we need?", "A laptop or tablet with a camera and microphone, and a recent version of Chrome, Edge, Safari or Firefox. Nothing to install."],
  ["How long is a lesson?", "Lessons are about 45 minutes and are booked into one-hour windows so there's time to settle in."],
  ["Are sessions recorded?", "No. Video goes directly between your browser and the volunteer's, and is never recorded or stored."],
  ["How are volunteers screened?", "Volunteers apply, complete our safety and teaching training, agree to our code of conduct, and are individually approved by Lemonful staff before being matched."],
  ["Does my child need their own account?", "No. Children join lessons from their parent's account, so we never collect a child's email or password."],
  ["How do volunteer hours work?", "Every completed session (plus training) is logged automatically. Volunteers can print a certificate of hours at any time."],
  ["Can I change my availability?", "Yes — update it any time from your account. We'll use it for future matching and booking."],
];

export default function Faq() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Title>Frequently asked questions</Title>
      <div className="mt-8 space-y-3">
        {FAQ.map(([q, a]) => (
          <details key={q} className="card p-5 group">
            <summary className="cursor-pointer list-none font-display text-xl font-bold flex justify-between">{q}<span className="text-coral group-open:rotate-45 transition">+</span></summary>
            <p className="mt-2 text-navy/80">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
