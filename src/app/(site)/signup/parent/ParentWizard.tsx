"use client";
import Link from "next/link";
import { Fragment, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Heart, Users, Lock, HelpCircle, Trash2, PlusCircle, BookOpen, Star, CheckCircle2, User, Smile, CalendarDays, Pencil, CalendarClock } from "lucide-react";
import { Stepper, Field, SidePanel } from "@/components/forms/Stepper";
import { AvailabilityGrid, summarizeSlots, type Slot } from "@/components/forms/AvailabilityGrid";
import { signupParent } from "@/lib/actions/auth";
import { READING_LEVELS } from "@/lib/utils";
import { Spark } from "@/components/Squiggle";

type Child = { firstName: string; age: string; readingLevel: string; notes: string };
const emptyChild = (): Child => ({ firstName: "", age: "", readingLevel: "", notes: "" });

export function ParentWizard() {
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState({ firstName: "", lastName: "", email: "", password: "", country: "Canada", city: "", postalCode: "" });
  const [children, setChildren] = useState<Child[]>([emptyChild()]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [pending, start] = useTransition();

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!account.firstName.trim()) e["account.firstName"] = "Required";
      if (!account.lastName.trim()) e["account.lastName"] = "Required";
      if (!/^\S+@\S+\.\S+$/.test(account.email)) e["account.email"] = "Enter a valid email";
      if (account.password.length < 8) e["account.password"] = "At least 8 characters";
    }
    if (s === 1) children.forEach((c, i) => {
      if (!c.firstName.trim()) e[`children.${i}.firstName`] = "Required";
      if (!c.age) e[`children.${i}.age`] = "Required";
      if (!c.readingLevel) e[`children.${i}.readingLevel`] = "Please choose one";
    });
    if (s === 2 && slots.length === 0) e.availability = "Pick at least one time slot";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const next = () => { if (validate(step)) { setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" }); } };
  const back = () => setStep(step - 1);
  const submit = () => start(async () => {
    setFormError("");
    const res = await signupParent({ account, children: children.map((c) => ({ ...c, age: Number(c.age) })), availability: slots });
    if (res?.error) { setFormError(res.error); setErrors(res.fieldErrors ?? {}); }
  });
  const updChild = (i: number, patch: Partial<Child>) => setChildren(children.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const panels = [
    <SidePanel key="0" title="A few things to know" items={[
      { icon: <Heart className="h-5 w-5 fill-coral text-coral" />, text: "Lemonful is free for families." },
      { icon: <Users className="h-5 w-5 text-leaf" />, text: "Your information is kept private and secure." },
      { icon: <Lock className="h-5 w-5 text-navy" />, text: "Your location is optional and helps us with program planning." },
      { icon: <HelpCircle className="h-5 w-5 text-grape" />, text: <>Have questions? Visit our <Link className="underline" href="/faq">FAQ page</Link> or contact us at <a className="underline" href="mailto:parents@lemonful.ca">parents@lemonful.ca</a>.</> },
    ]} />,
    <SidePanel key="1" title="Why we ask for this information" items={[
      { icon: <BookOpen className="h-5 w-5 text-leaf" />, text: "Helps us find a volunteer with the right skills and experience for your child." },
      { icon: <Star className="h-5 w-5 text-lemon-dark" />, text: "We can tailor the lessons to your child's reading level and interests." },
      { icon: <Users className="h-5 w-5 text-leaf" />, text: "You can add more children now or later in your account settings." },
    ]} />,
    <SidePanel key="2" title="A few things to know" items={[
      { icon: <CheckCircle2 className="h-5 w-5 text-lemon-dark" />, text: "Lessons are about 45 minutes and are scheduled within the one-hour slots you select." },
      { icon: <CheckCircle2 className="h-5 w-5 text-lemon-dark" />, text: "Select as many times as work for your family." },
      { icon: <CheckCircle2 className="h-5 w-5 text-lemon-dark" />, text: "You can update your availability anytime in your account settings." },
      { icon: <CheckCircle2 className="h-5 w-5 text-lemon-dark" />, text: "We'll match you with a trained volunteer based on your availability and your child's needs." },
    ]} />,
    <SidePanel key="3" title="You're almost there!" items={[
      { icon: <CheckCircle2 className="h-5 w-5 text-lemon-dark" />, text: "Review your details and click 'Create Parent Account' to complete registration." },
      { icon: <CheckCircle2 className="h-5 w-5 text-lemon-dark" />, text: "After you create your account, you'll receive a verification email. Please click the link to activate your account." },
      { icon: <CheckCircle2 className="h-5 w-5 text-lemon-dark" />, text: "You can update your information and availability anytime in your account settings." },
      { icon: <Lock className="h-5 w-5 text-navy" />, text: "Your information is kept private and secure." },
    ]} />,
  ];

  const titles = [
    ["Create Your Parent Account", "Let's get started! Create your account so we can match your child with a suitable reading volunteer."],
    ["Tell us about your child(ren)", "Add the child(ren) who will participate in Lemonful."],
    ["When is your family available?", "Select the times that could work for your child. These are your preferred availability windows, and we'll match you with a volunteer based on your selections."],
    ["Review and finish", "Please review your information below. You can go back to make changes before creating your account."],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Stepper steps={["Your account", "Your child(ren)", "Family availability", "Review and finish"]} current={step} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="inline-flex items-start gap-2 text-4xl md:text-5xl">{titles[step][0]}<Spark /></h1>
          <p className="mt-2 mb-6 text-navy/80">{titles[step][1]}</p>

          {step === 0 && (
            <div className="rounded-3xl bg-teal-light/50 p-6 space-y-4">
              <h2 className="text-2xl">Parent or guardian details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First name" required error={errors["account.firstName"]}><input className="input" placeholder="First name" value={account.firstName} onChange={(e) => setAccount({ ...account, firstName: e.target.value })} autoComplete="given-name" /></Field>
                <Field label="Last name" required error={errors["account.lastName"]}><input className="input" placeholder="Last name" value={account.lastName} onChange={(e) => setAccount({ ...account, lastName: e.target.value })} autoComplete="family-name" /></Field>
                <Field label="Email address" required error={errors["account.email"]}><input className="input" type="email" placeholder="you@example.com" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} autoComplete="email" /></Field>
                <Field label="Create a password" required error={errors["account.password"]}>
                  <div className="relative">
                    <input className="input pr-10" type={showPw ? "text" : "password"} placeholder="At least 8 characters" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} autoComplete="new-password" />
                    <button type="button" aria-label="Show password" className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/60" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </Field>
              </div>
              <p className="label pt-2">Location (optional)</p>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Country"><select className="input" value={account.country} onChange={(e) => setAccount({ ...account, country: e.target.value })}><option>Canada</option><option>United States</option><option>Other</option></select></Field>
                <Field label="City / Town"><input className="input" placeholder="e.g. Toronto" value={account.city} onChange={(e) => setAccount({ ...account, city: e.target.value })} /></Field>
                <Field label="Postal code"><input className="input" placeholder="e.g. M5V 2T6" value={account.postalCode} onChange={(e) => setAccount({ ...account, postalCode: e.target.value })} /><span className="text-[11px] text-navy/60">This helps us for program planning and impact reporting.</span></Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {children.map((c, i) => (
                <div key={i} className="card p-6 space-y-4">
                  <div className="flex justify-between"><h2 className="text-2xl">Child {i + 1}</h2>
                    {children.length > 1 && <button type="button" onClick={() => setChildren(children.filter((_, j) => j !== i))} className="flex items-center gap-1 text-coral font-semibold text-sm"><Trash2 size={16} /> Remove</button>}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="First name or preferred name" required error={errors[`children.${i}.firstName`]}><input className="input" placeholder="First name" value={c.firstName} onChange={(e) => updChild(i, { firstName: e.target.value })} /></Field>
                    <Field label="Age" required error={errors[`children.${i}.age`]}>
                      <select className="input" value={c.age} onChange={(e) => updChild(i, { age: e.target.value })}><option value="">Select age</option>{[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => <option key={a} value={a}>{a} years old</option>)}</select>
                    </Field>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <fieldset>
                      <legend className="label">What best describes your child&apos;s current reading experience? <span className="text-coral">*</span></legend>
                      <div className="space-y-1.5">
                        {Object.entries(READING_LEVELS).map(([k, v]) => (
                          <label key={k} className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" className="h-4 w-4 accent-teal" name={`lvl-${i}`} checked={c.readingLevel === k} onChange={() => updChild(i, { readingLevel: k })} /> {v}</label>
                        ))}
                      </div>
                      {errors[`children.${i}.readingLevel`] && <span className="text-xs font-semibold text-coral">{errors[`children.${i}.readingLevel`]}</span>}
                    </fieldset>
                    <Field label="Anything else you'd like us to know? (Optional)"><textarea rows={5} className="input" placeholder="For example, interests, learning style, or anything we should be aware of." value={c.notes} onChange={(e) => updChild(i, { notes: e.target.value })} /></Field>
                  </div>
                </div>
              ))}
              {children.length < 6 && <button type="button" onClick={() => setChildren([...children, emptyChild()])} className="w-full rounded-2xl border-2 border-dashed border-teal/50 bg-white py-3 font-bold text-teal flex items-center justify-center gap-2 hover:bg-teal-light"><PlusCircle size={20} /> Add Another Child</button>}
            </div>
          )}

          {step === 2 && (
            <>
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-teal-light p-3 text-sm"><CalendarClock className="text-teal shrink-0" /><span><b>Lessons are about 45 minutes and are scheduled within the one-hour slots you select.</b> The extra time allows for a smooth start and finish.</span></div>
              <AvailabilityGrid value={slots} onChange={setSlots} />
              {errors.availability && <p className="mt-2 text-sm font-semibold text-coral">{errors.availability}</p>}
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <ReviewCard icon={<User className="text-teal" />} title="Your account" onEdit={() => setStep(0)} rows={[["Name", `${account.firstName} ${account.lastName}`], ["Email", account.email], ["Location", [account.city, account.country].filter(Boolean).join(", ") + " (optional)"]]} />
              <ReviewCard icon={<Smile className="text-lemon-dark" />} title="Child(ren)" onEdit={() => setStep(1)} rows={children.flatMap((c, i) => [[`Child ${i + 1}`, c.firstName], ["Age", `${c.age} years old`], ["Reading experience", READING_LEVELS[c.readingLevel]], ...(c.notes ? [["Additional notes", c.notes]] : [])])} />
              <ReviewCard icon={<CalendarDays className="text-leaf" />} title="Family availability" onEdit={() => setStep(2)} rows={summarizeSlots(slots).map((s) => { const [d, ...r] = s.split(": "); return [d, r.join(": ")]; })} />
              {formError && <p className="rounded-xl bg-coral-light p-3 text-sm font-semibold text-coral-dark">{formError}</p>}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step === 0 ? <Link href="/" className="flex items-center gap-2 font-semibold"><ArrowLeft size={18} /> Cancel</Link> : <button type="button" onClick={back} className="btn-outline btn-sm"><ArrowLeft size={18} /> Back</button>}
            {step < 3 ? <button type="button" onClick={next} className="btn-coral">Continue <ArrowRight size={18} /></button>
              : <button type="button" onClick={submit} disabled={pending} className="btn-coral">{pending ? "Creating…" : "Create Parent Account"} <ArrowRight size={18} /></button>}
          </div>
          <p className="mt-6 text-sm text-navy/60">Already have an account? <Link href="/login" className="underline">Log in</Link></p>
        </div>
        <div className="hidden lg:block">{panels[step]}</div>
      </div>
    </div>
  );
}

function ReviewCard({ icon, title, rows, onEdit }: { icon: React.ReactNode; title: string; rows: string[][]; onEdit: () => void }) {
  return (
    <div className="card p-5 flex gap-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-cream">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between"><h3 className="text-xl">{title}</h3><button type="button" onClick={onEdit} className="flex items-center gap-1 text-sm font-semibold text-teal underline"><Pencil size={14} /> Edit</button></div>
        <dl className="mt-2 grid grid-cols-[160px_1fr] gap-y-1 text-sm">
          {rows.map(([k, v], i) => <Fragment key={i}><dt className="text-navy/70">{k}</dt><dd>{v}</dd></Fragment>)}
        </dl>
      </div>
    </div>
  );
}
