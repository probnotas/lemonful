"use client";
/**
 * Interactive activities rendered identically on both screens. Every interaction is an
 * ActAction dispatched to the shared room state, so both screens stay in sync.
 */
import { useEffect, useRef } from "react";
import { Volume2, Undo2, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import type { ActivityConfig } from "@/lib/curriculum";
import { BOOKS } from "@/lib/curriculum";
import type { ActAction, ActState, Role } from "@/lib/room-state";

export const BUCKET_COLORS = ["#ef4444", "#f97316", "#facc15", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6"];

export function speak(text: string) {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.pitch = 1.15;
    window.speechSynthesis.speak(u);
  } catch {}
}

type Props = { cfg: ActivityConfig; s: ActState; act: (a: ActAction) => void; role: Role; big?: boolean };

export function Activity(props: Props) {
  switch (props.cfg.type) {
    case "all-about-me": return <AllAboutMe {...props} cfg={props.cfg} />;
    case "letter-buckets": return <LetterBuckets {...props} cfg={props.cfg} />;
    case "first-sound": return <FirstSound {...props} cfg={props.cfg} />;
    case "blend-it": return <BlendIt {...props} cfg={props.cfg} />;
    case "word-builder": return <WordBuilder {...props} cfg={props.cfg} />;
    case "sight-words": return <SightWords {...props} cfg={props.cfg} />;
    case "story": return <Story {...props} cfg={props.cfg} />;
    case "celebrate": return <Celebrate msg={props.cfg.message} />;
  }
}

const Bucket = ({ letter, color, onDrop, onClick, active, count }: { letter: string; color: string; onDrop: () => void; onClick: () => void; active: boolean; count: number }) => (
  <button type="button" onClick={onClick} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onDrop(); }}
    className={`relative flex flex-col items-center transition ${active ? "scale-105" : ""}`} aria-label={`Bucket ${letter}`}>
    <svg viewBox="0 0 100 90" className="w-full drop-shadow-sm">
      <ellipse cx="50" cy="12" rx="46" ry="10" fill={color} />
      <path d="M4 12 L14 84 Q50 94 86 84 L96 12 Q50 24 4 12Z" fill={color} />
      <ellipse cx="50" cy="12" rx="40" ry="6" fill="black" opacity=".18" />
      <rect x="30" y="34" width="40" height="38" rx="9" fill="white" />
    </svg>
    <span className="absolute top-[40%] font-display text-[clamp(1.2rem,3vw,2.4rem)] font-bold text-navy">{letter.toUpperCase()}</span>
    {count > 0 && <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-leaf text-xs font-bold text-white">{count}</span>}
  </button>
);

function LetterBuckets({ cfg, s, act }: Props & { cfg: Extract<ActivityConfig, { type: "letter-buckets" }> }) {
  const placed = s.placed as Record<string, string>;
  const selected = s.selected as string | null;
  const dragging = useRef<string | null>(null);
  return (
    <div>
      <div className={`grid gap-2 md:gap-3`} style={{ gridTemplateColumns: `repeat(${cfg.letters.length}, minmax(0,1fr))` }}>
        {cfg.letters.map((l, i) => (
          <Bucket key={l} letter={l} color={BUCKET_COLORS[i % BUCKET_COLORS.length]} active={!!selected}
            count={Object.values(placed).filter((x) => x === l).length}
            onDrop={() => dragging.current && act({ k: "drop", item: dragging.current, letter: l })}
            onClick={() => selected && act({ k: "drop", item: selected, letter: l })} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
        {cfg.items.map((it) => {
          const done = placed[it.id];
          const wrong = s.wrong === it.id;
          return (
            <button key={it.id} type="button" draggable={!done}
              onDragStart={() => { dragging.current = it.id; act({ k: "select", item: it.id }); }}
              onClick={() => { if (!done) { act({ k: "select", item: selected === it.id ? null : it.id }); speak(it.word); } }}
              className={`relative aspect-square rounded-2xl border-2 bg-white text-[clamp(1.6rem,4vw,2.8rem)] transition
                ${done ? "opacity-30 border-leaf" : selected === it.id ? "border-teal ring-4 ring-teal/30 -translate-y-1" : "border-navy/10 hover:border-teal"}
                ${wrong ? "animate-shake border-coral" : ""}`}
              aria-label={it.word}>
              {it.emoji}
              {done && <span className="absolute bottom-0.5 right-1 font-display text-sm font-bold text-leaf">{done}</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-navy/50">Tap a picture, then tap its bucket — or drag it in.</p>
    </div>
  );
}

function AllAboutMe({ cfg, s, act }: Props & { cfg: Extract<ActivityConfig, { type: "all-about-me" }> }) {
  const picks = s.picks as Record<string, string>;
  return (
    <div className="space-y-4">
      {cfg.questions.map((q) => (
        <div key={q.id}>
          <p className="mb-2 font-display text-lg font-bold">{q.prompt}</p>
          <div className="flex flex-wrap gap-2">
            {q.choices.map((c) => (
              <button key={c.id} type="button" onClick={() => act({ k: "pick", q: q.id, v: c.label })}
                className={`flex flex-col items-center rounded-2xl border-2 px-3 py-2 transition ${picks[q.id] === c.label ? "border-coral bg-coral-light scale-105" : "border-navy/10 bg-white hover:border-coral"}`}>
                <span className="text-4xl">{c.emoji}</span><span className="text-xs font-bold">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FirstSound({ cfg, s, act, role }: Props & { cfg: Extract<ActivityConfig, { type: "first-sound" }> }) {
  const index = s.index as number;
  const results = s.results as boolean[];
  const item = cfg.items[index];
  if (!item) return <Done text={`${results.filter(Boolean).length} of ${results.length} correct!`} onRestart={role === "volunteer" ? () => act({ k: "prev" }) : undefined} />;
  const answered = results.length > index;
  const right = results[index];
  return (
    <div className="text-center">
      <button type="button" onClick={() => speak(item.word)} className="mx-auto flex flex-col items-center rounded-3xl bg-white px-10 py-4 shadow-soft">
        <span className="text-[clamp(4rem,10vw,7rem)] leading-none">{item.emoji}</span>
        <span className="mt-1 flex items-center gap-1 text-sm font-bold text-teal"><Volume2 size={16} /> {answered ? item.word : "Tap to hear"}</span>
      </button>
      <div className="mt-5 flex justify-center gap-3">
        {item.options.map((o, i) => (
          <button key={o} type="button" disabled={answered} onClick={() => act({ k: "answer", v: o })}
            className={`h-20 w-20 rounded-2xl font-display text-4xl font-bold text-white shadow-pop transition hover:-translate-y-1 ${answered && s.last === o ? (right ? "ring-4 ring-leaf" : "ring-4 ring-coral animate-shake") : ""}`}
            style={{ background: BUCKET_COLORS[(i * 2) % BUCKET_COLORS.length] }}>{o}</button>
        ))}
      </div>
      {answered && <p className={`mt-4 font-display text-2xl font-bold ${right ? "text-leaf" : "text-coral"}`}>{right ? "Yes! 🎉" : "Good try! Let's listen again."}</p>}
      <Nav role={role} act={act} pos={`${index + 1} / ${cfg.items.length}`} canNext={answered} />
    </div>
  );
}

function BlendIt({ cfg, s, act, role }: Props & { cfg: Extract<ActivityConfig, { type: "blend-it" }> }) {
  const index = s.index as number;
  const w = cfg.words[index];
  if (!w) return <Done text={`You blended ${cfg.words.length} words!`} onRestart={role === "volunteer" ? () => act({ k: "prev" }) : undefined} />;
  const lit = s.lit as number;
  const revealed = s.revealed as boolean;
  const graphemes = splitGraphemes(w.word);
  return (
    <div className="text-center">
      <div className="flex justify-center gap-2 md:gap-3">
        {graphemes.map((g, i) => (
          <button key={i} type="button" onClick={() => { act({ k: "tap", i }); speak(g); }}
            className={`min-w-[4.5rem] rounded-2xl px-3 py-4 font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-none shadow-pop transition ${i < lit ? "bg-lemon text-navy -translate-y-1" : "bg-white text-navy/80"}`}>{g}</button>
        ))}
      </div>
      <div className="mt-2 flex justify-center gap-1">{graphemes.map((_, i) => <span key={i} className={`h-2 w-16 rounded-full ${i < lit ? "bg-coral" : "bg-navy/10"}`} />)}</div>
      <div className="mt-5 min-h-[7rem]">
        {revealed ? <div className="animate-pop"><span className="text-7xl">{w.emoji}</span><p className="font-display text-4xl font-bold text-coral">{w.word}!</p></div>
          : <button type="button" onClick={() => { act({ k: "reveal" }); speak(w.word); }} disabled={lit < graphemes.length} className="btn-coral text-xl">Smoosh it together! 👏</button>}
      </div>
      <Nav role={role} act={act} pos={`${index + 1} / ${cfg.words.length}`} canNext={revealed} />
    </div>
  );
}

function WordBuilder({ cfg, s, act, role }: Props & { cfg: Extract<ActivityConfig, { type: "word-builder" }> }) {
  const index = s.index as number;
  const w = cfg.words[index];
  if (!w) return <Done text="Word builder complete!" onRestart={role === "volunteer" ? () => act({ k: "prev" }) : undefined} />;
  const built = s.built as string[];
  const solved = (s.solved as number[]).includes(index);
  const full = built.length === w.word.length;
  return (
    <div className="text-center">
      <button type="button" onClick={() => speak(w.word)} className="text-[clamp(4rem,10vw,6.5rem)] leading-none" aria-label="Hear the word">{w.emoji}</button>
      <div className="mt-3 flex justify-center gap-2">
        {w.word.split("").map((_, i) => (
          <span key={i} className={`grid h-16 w-14 md:h-20 md:w-16 place-items-center rounded-xl border-b-4 bg-white font-display text-4xl font-bold ${solved ? "border-leaf text-leaf" : full ? "border-coral animate-shake" : "border-navy/30"}`}>{built[i] ?? ""}</span>
        ))}
        {!solved && <button type="button" onClick={() => act({ k: "undo" })} className="ml-2 grid h-16 w-12 place-items-center rounded-xl bg-navy/5" aria-label="Undo"><Undo2 /></button>}
      </div>
      {solved && <p className="mt-2 font-display text-2xl font-bold text-leaf animate-pop">You built &ldquo;{w.word}&rdquo;! 🎉</p>}
      {full && !solved && <p className="mt-2 font-semibold text-coral">Hmm, listen again… tap ↩ to fix it.</p>}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {cfg.tiles.map((t, i) => (
          <button key={t} type="button" disabled={solved || full} onClick={() => { act({ k: "add", v: t }); speak(t); }}
            className="h-14 w-14 rounded-xl font-display text-3xl font-bold text-white shadow-pop transition hover:-translate-y-1 disabled:opacity-50" style={{ background: BUCKET_COLORS[i % BUCKET_COLORS.length] }}>{t}</button>
        ))}
      </div>
      <Nav role={role} act={act} pos={`${index + 1} / ${cfg.words.length}`} canNext />
    </div>
  );
}

function SightWords({ cfg, s, act, role }: Props & { cfg: Extract<ActivityConfig, { type: "sight-words" }> }) {
  const index = s.index as number;
  const marks = s.marks as Record<string, string>;
  const w = cfg.words[index];
  if (!w) {
    const got = Object.values(marks).filter((v) => v === "got").length;
    return <Done text={`${got} of ${cfg.words.length} tricky words — amazing!`} onRestart={role === "volunteer" ? () => act({ k: "prev" }) : undefined} />;
  }
  return (
    <div className="text-center">
      <button type="button" onClick={() => act({ k: "flip" })} className={`mx-auto grid h-48 w-72 max-w-full place-items-center rounded-3xl shadow-soft transition ${s.flipped ? "bg-lemon" : "bg-white"}`}>
        <span className="font-display text-7xl font-bold">{w}</span>
        {!!s.flipped && <span className="-mt-6 text-sm font-semibold">⭐ tricky word ⭐</span>}
      </button>
      <div className="mt-3 flex justify-center gap-1">{cfg.words.map((x) => <span key={x} className={`h-3 w-3 rounded-full ${marks[x] === "got" ? "bg-leaf" : marks[x] ? "bg-coral" : "bg-navy/15"}`} />)}</div>
      {role === "volunteer" ? (
        <div className="mt-4 flex justify-center gap-3">
          <button type="button" onClick={() => act({ k: "mark", v: "practise" })} className="btn-ghost btn-sm">Practise more</button>
          <button type="button" onClick={() => act({ k: "mark", v: "got" })} className="btn-teal btn-sm">✓ Got it!</button>
        </div>
      ) : <p className="mt-4 font-semibold text-navy/70">Read the word to your tutor!</p>}
    </div>
  );
}

function Story({ cfg, s, act, role }: Props & { cfg: Extract<ActivityConfig, { type: "story" }> }) {
  const page = s.page as number;
  const hl = s.highlight as number | null;
  const p = cfg.pages[page];
  const words = p.text.split(" ");
  const book = BOOKS[cfg.book];
  return (
    <div className="rounded-3xl bg-white p-4 md:p-6 shadow-soft">
      <div className="flex items-center justify-between text-xs font-bold text-navy/50"><span>📖 {book.title}</span><span>Page {page + 1} of {cfg.pages.length}</span></div>
      <div className="my-3 grid h-28 md:h-36 place-items-center rounded-2xl bg-gradient-to-b from-sky-100 to-leaf-light text-[clamp(3rem,8vw,5.5rem)]">{p.scene}</div>
      <p className="text-center font-display text-[clamp(1.6rem,3.6vw,2.6rem)] font-bold leading-snug">
        {words.map((w, i) => (
          <button key={i} type="button" onClick={() => { act({ k: "highlight", i: hl === i ? null : i }); speak(w.replace(/[^\w']/g, "")); }}
            className={`mx-1 rounded-lg px-1 transition ${hl === i ? "bg-lemon scale-110 inline-block" : "hover:bg-lemon-light"}`}>{w}</button>
        ))}
      </p>
      <div className="mt-4 flex items-center justify-between">
        {role === "volunteer" ? <button type="button" disabled={page === 0} onClick={() => act({ k: "prev" })} className="btn-ghost btn-sm"><ChevronLeft size={16} /> Back</button> : <span />}
        <div className="flex gap-1">{cfg.pages.map((_, i) => <span key={i} className={`h-2.5 w-2.5 rounded-full ${i === page ? "bg-coral" : "bg-navy/15"}`} />)}</div>
        {role === "volunteer" ? <button type="button" disabled={page === cfg.pages.length - 1} onClick={() => act({ k: "next" })} className="btn-teal btn-sm">Turn page <ChevronRight size={16} /></button> : <span />}
      </div>
    </div>
  );
}

export function Celebrate({ msg }: { msg: string }) {
  return (
    <div className="py-6 text-center">
      <p className="text-8xl animate-float">🏆</p>
      <p className="mt-4 font-display text-4xl font-bold text-coral">{msg}</p>
      <p className="mt-2 text-6xl">🎉 🍋 ⭐</p>
    </div>
  );
}

function Done({ text, onRestart }: { text: string; onRestart?: () => void }) {
  return (
    <div className="py-8 text-center animate-pop">
      <p className="text-7xl">🌟</p>
      <p className="mt-2 font-display text-3xl font-bold text-leaf">{text}</p>
      {onRestart && <button type="button" onClick={onRestart} className="btn-ghost btn-sm mt-4"><RotateCcw size={14} /> Back one</button>}
    </div>
  );
}

function Nav({ role, act, pos, canNext }: { role: Role; act: (a: ActAction) => void; pos: string; canNext: boolean }) {
  return (
    <div className="mt-5 flex items-center justify-center gap-4">
      {role === "volunteer" && <button type="button" onClick={() => act({ k: "prev" })} className="btn-ghost btn-sm"><ChevronLeft size={16} /></button>}
      <span className="text-sm font-bold text-navy/50">{pos}</span>
      {role === "volunteer" && <button type="button" onClick={() => act({ k: "next" })} className={`btn-sm ${canNext ? "btn-teal" : "btn-ghost"}`}>Next <ChevronRight size={16} /></button>}
    </div>
  );
}

/** Split a word into sound units so digraphs/teams/magic-e show as one tile (sh, ai, ee…). */
const UNITS = ["sh", "ch", "th", "wh", "ck", "ai", "ee", "ea", "oa"];
export function splitGraphemes(word: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < word.length; ) {
    const two = word.slice(i, i + 2);
    if (UNITS.includes(two)) { out.push(two); i += 2; } else { out.push(word[i]); i++; }
  }
  return out;
}

export function useConfetti(trigger: number) {
  const first = useRef(trigger);
  useEffect(() => {
    if (trigger === first.current) return;
    const colors = ["#fbcd2f", "#f0365a", "#0f8ca8", "#8b5cf6", "#22a06b"];
    const box = document.createElement("div");
    box.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden";
    for (let i = 0; i < 80; i++) {
      const p = document.createElement("i");
      p.style.cssText = `position:absolute;top:0;left:${Math.random() * 100}%;width:10px;height:14px;background:${colors[i % 5]};border-radius:3px;animation:confetti ${1.6 + Math.random() * 1.6}s ${Math.random() * 0.4}s ease-in forwards`;
      box.appendChild(p);
    }
    document.body.appendChild(box);
    const t = setTimeout(() => box.remove(), 3800);
    return () => clearTimeout(t);
  }, [trigger]);
}
