import Image from "next/image";
import { BOOKS, LESSONS } from "@/lib/curriculum";
import { Title } from "@/components/Squiggle";

export const metadata = { title: "Our Books" };

export default function Books() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <Title>Six Stories. A Lifetime of Skills.</Title>
      <p className="mt-3 max-w-2xl text-lg text-navy/85">Each original Lemonful book focuses on one key reading rule. Children read them with their tutor inside the lesson, page by page, with words highlighted as they go.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {Object.entries(BOOKS).map(([id, b]) => {
          const lesson = LESSONS.find((l) => l.book === id);
          return (
            <article id={id} key={id} className="card flex gap-5 p-5 scroll-mt-24">
              <Image src={b.cover} alt={b.title} width={180} height={116} className="h-28 w-auto rounded-xl shadow-soft" />
              <div>
                <h2 className="text-2xl">{b.title}</h2>
                <span className="chip bg-lemon-light text-navy mt-1">{b.rule}</span>
                <p className="mt-2 text-navy/80">{b.blurb}</p>
                {lesson && <p className="mt-1 text-sm text-navy/60">Read in Lesson {lesson.number}: {lesson.title}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
