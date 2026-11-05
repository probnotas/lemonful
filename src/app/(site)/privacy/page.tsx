import { Title } from "@/components/Squiggle";

export const metadata = { title: "Privacy & Child Safety" };

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 space-y-4 text-navy/85">
      <Title>Privacy &amp; child safety</Title>
      <p className="text-sm text-navy/60">Plain-language summary. Have this reviewed by counsel for PIPEDA / provincial privacy law and COPPA before launch.</p>
      <h2 className="text-2xl text-navy pt-4">What we collect about children</h2>
      <p>Only a first (or preferred) name, age, reading level, optional notes from the parent, and lesson progress. No child email, password, photo, or surname.</p>
      <h2 className="text-2xl text-navy">Who can see it</h2>
      <p>The parent, the child&apos;s matched volunteer (first name, age, reading level, progress), and Lemonful staff. Access to children&apos;s records is logged.</p>
      <h2 className="text-2xl text-navy">Video</h2>
      <p>Video and audio go peer-to-peer between the two browsers and are never recorded or stored by Lemonful.</p>
      <h2 className="text-2xl text-navy">Your choices</h2>
      <p>Parents can edit or delete a child&apos;s profile, or delete their whole account (and all associated child data), from Account settings at any time.</p>
      <h2 className="text-2xl text-navy">Contact</h2>
      <p>Questions? Email <a className="underline" href="mailto:parents@lemonful.ca">parents@lemonful.ca</a>.</p>
    </div>
  );
}
