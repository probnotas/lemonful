"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, GraduationCap, Clock, ShieldCheck, Trophy, CheckCircle2 } from "lucide-react";
import { Stepper, Field, SidePanel } from "@/components/forms/Stepper";
import { AvailabilityGrid, summarizeSlots, type Slot } from "@/components/forms/AvailabilityGrid";
import { signupVolunteer } from "@/lib/actions/auth";
import { Spark } from "@/components/Squiggle";

export function VolunteerWizard() {
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState({ firstName: "", lastName: "", email: "", password: "", country: "Canada", city: "", postalCode: "" });
  const [profile, setProfile] = useState({ school: "", grade: "", age: "", whyVolunteer: "", guardianName: "", guardianEmail: "", agreedToCode: false });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, start] = useTransition();
  const minor = Number(profile.age) > 0 && Number(profile.age) < 18;

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!account.firstName.trim()) e["account.firstName"] = "Required";
      if (!account.lastName.trim()) e["account.lastName"] = "Required";
      if (!/^\S+@\S+\.\S+$/.test(account.email)) e["account.email"] = "Enter a valid email";
      if (account.password.length < 8) e["account.password"] = "At least 8 characters";
    }
    if (step === 1) {
      if (!profile.school.trim()) e["profile.school"] = "Required";
      if (!profile.grade) e["profile.grade"] = "Required";
      if (!profile.age) e["profile.age"] = "Required";
      else if (Number(profile.age) < 14) e["profile.age"] = "Volunteers must be 14 or older";
      if (minor && !/^\S+@\S+\.\S+$/.test(profile.guardianEmail)) e["profile.guardianEmail"] = "A parent/guardian email is required if you're under 18";
    }
    if (step === 2 && !slots.length) e.availability = "Pick at least one time slot";
    if (step === 3 && !profile.agreedToCode) e["profile.agreedToCode"] = "Please agree to continue";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const submit = () => {
    if (!validate()) return;
    start(async () => {
      const res = await signupVolunteer({ account, profile: { ...profile, grade: Number(profile.grade), age: Number(profile.age) }, availability: slots });
      if (res?.error) { setFormError(res.error); setErrors(res.fieldErrors ?? {}); }
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Stepper steps={["Your account", "About you", "Availability", "Code of conduct"]} current={step} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="inline-flex items-start gap-2 text-4xl md:text-5xl">{["Become a Volunteer", "Tell us about you", "When can you tutor?", "Our code of conduct"][step]}<Spark /></h1>
          <p className="mt-2 mb-6 text-navy/80">{["Help a child become a confident reader — and earn community-service hours.", "This helps us match you with the right student.", "Pick the weekly one-hour windows you could tutor. We'll match you with a family whose times overlap.", "Child safety comes first. Please read carefully."][step]}</p>

          {step === 0 && (
            <div className="rounded-3xl bg-teal-light/50 p-6 grid gap-4 md:grid-cols-2">
              <Field label="First name" required error={errors["account.firstName"]}><input className="input" value={account.firstName} onChange={(e) => setAccount({ ...account, firstName: e.target.value })} /></Field>
              <Field label="Last name" required error={errors["account.lastName"]}><input className="input" value={account.lastName} onChange={(e) => setAccount({ ...account, lastName: e.target.value })} /></Field>
              <Field label="Email address" required error={errors["account.email"]}><input className="input" type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} /></Field>
              <Field label="Create a password" required error={errors["account.password"]}><input className="input" type="password" placeholder="At least 8 characters" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} /></Field>
              <Field label="City / Town (optional)"><input className="input" value={account.city} onChange={(e) => setAccount({ ...account, city: e.target.value })} /></Field>
              <Field label="Country"><select className="input" value={account.country} onChange={(e) => setAccount({ ...account, country: e.target.value })}><option>Canada</option><option>United States</option><option>Other</option></select></Field>
            </div>
          )}
          {step === 1 && (
            <div className="rounded-3xl bg-teal-light/50 p-6 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-3"><Field label="High school" required error={errors["profile.school"]}><input className="input" value={profile.school} onChange={(e) => setProfile({ ...profile, school: e.target.value })} /></Field></div>
              <Field label="Grade" required error={errors["profile.grade"]}><select className="input" value={profile.grade} onChange={(e) => setProfile({ ...profile, grade: e.target.value })}><option value="">Select</option>{[9, 10, 11, 12].map((g) => <option key={g} value={g}>Grade {g}</option>)}</select></Field>
              <Field label="Age" required error={errors["profile.age"]}><input className="input" type="number" min={14} max={20} value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} /></Field>
              <div />
              {minor && <>
                <Field label="Parent/guardian name"><input className="input" value={profile.guardianName} onChange={(e) => setProfile({ ...profile, guardianName: e.target.value })} /></Field>
                <div className="md:col-span-2"><Field label="Parent/guardian email" required error={errors["profile.guardianEmail"]}><input className="input" type="email" value={profile.guardianEmail} onChange={(e) => setProfile({ ...profile, guardianEmail: e.target.value })} /><span className="text-[11px] text-navy/60">We&apos;ll let them know you&apos;ve applied.</span></Field></div>
              </>}
              <div className="md:col-span-3"><Field label="Why do you want to volunteer with Lemonful? (optional)"><textarea rows={4} className="input" value={profile.whyVolunteer} onChange={(e) => setProfile({ ...profile, whyVolunteer: e.target.value })} /></Field></div>
            </div>
          )}
          {step === 2 && <>
            <AvailabilityGrid value={slots} onChange={setSlots} />
            {errors.availability && <p className="mt-2 text-sm font-semibold text-coral">{errors.availability}</p>}
          </>}
          {step === 3 && (
            <div className="card p-6 space-y-3">
              {[
                "I will keep all contact with children and families on the Lemonful platform, and never share personal contact details or social media.",
                "I will never record, screenshot or share anything from a session.",
                "I will use only the child's first name and keep their information private.",
                "I will show up on time, and cancel at least 24 hours ahead if I can't make it.",
                "I will report any concern about a child's safety to Lemonful right away.",
                "I will be kind, patient and encouraging.",
              ].map((t) => <p key={t} className="flex gap-2"><CheckCircle2 className="h-5 w-5 shrink-0 text-teal" /> {t}</p>)}
              <label className="mt-4 flex items-center gap-2 font-bold"><input type="checkbox" className="h-5 w-5 accent-teal" checked={profile.agreedToCode} onChange={(e) => setProfile({ ...profile, agreedToCode: e.target.checked })} /> I agree to the Lemonful volunteer code of conduct</label>
              {errors["profile.agreedToCode"] && <p className="text-sm text-coral font-semibold">{errors["profile.agreedToCode"]}</p>}
              <div className="mt-4 rounded-xl bg-cream p-3 text-sm"><b>Your availability:</b> {summarizeSlots(slots).join(" · ")}</div>
              {formError && <p className="rounded-xl bg-coral-light p-3 text-sm font-semibold text-coral-dark">{formError}</p>}
            </div>
          )}
          <div className="mt-8 flex justify-between">
            {step === 0 ? <Link href="/" className="flex items-center gap-2 font-semibold"><ArrowLeft size={18} /> Cancel</Link> : <button onClick={() => setStep(step - 1)} className="btn-outline btn-sm"><ArrowLeft size={18} /> Back</button>}
            {step < 3 ? <button onClick={() => validate() && setStep(step + 1)} className="btn-teal">Continue <ArrowRight size={18} /></button>
              : <button onClick={submit} disabled={pending} className="btn-teal">{pending ? "Submitting…" : "Submit Application"} <ArrowRight size={18} /></button>}
          </div>
        </div>
        <div className="hidden lg:block">
          <SidePanel title="What to expect" img="/art/volunteer-dog.png" items={[
            { icon: <GraduationCap className="h-5 w-5 text-teal" />, text: "About 2 hours of online training — it counts toward your hours." },
            { icon: <ShieldCheck className="h-5 w-5 text-leaf" />, text: "Lemonful staff review and approve every volunteer." },
            { icon: <Clock className="h-5 w-5 text-coral" />, text: "Weekly 45-minute sessions. Hours are tracked automatically." },
            { icon: <Trophy className="h-5 w-5 text-lemon-dark" />, text: "Watch your impact grow on your dashboard." },
          ]} />
        </div>
      </div>
    </div>
  );
}
