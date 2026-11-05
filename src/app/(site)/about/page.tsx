import Image from "next/image";
import { Title } from "@/components/Squiggle";

export const metadata = { title: "About" };

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <Title>About Lemonful</Title>
      <div className="mt-8 grid items-center gap-8 md:grid-cols-[1fr_280px]">
        <div className="space-y-4 text-lg text-navy/85">
          <p>Lemonful is an online literacy platform that connects children who are learning to read with high-school student volunteers for structured, one-on-one reading tutoring.</p>
          <p>Children get patient, personal attention and a reading buddy they look forward to seeing. Volunteers gain meaningful community-service hours, leadership experience, and the joy of watching a child&apos;s confidence grow.</p>
          <p>Our curriculum, lesson experience and original children&apos;s books were created by our founder, Yvonne, to take children from their very first letter sounds to confident, independent reading.</p>
        </div>
        <Image src="/art/friends.png" alt="Bear and Pup waving" width={280} height={280} className="mx-auto" />
      </div>
    </div>
  );
}
