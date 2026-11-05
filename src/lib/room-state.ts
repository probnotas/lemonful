/**
 * Shared, deterministic state for a live tutoring room.
 *
 * The socket server holds the authoritative copy; both screens send *actions* and receive
 * the new state, so the volunteer and child always see exactly the same activity.
 * This file is imported by both server.ts and the React client — keep it pure.
 */
import { getLesson, type ActivityConfig } from "./curriculum";

export type Role = "volunteer" | "child";

export interface RoomState {
  lessonNumber: number;
  stepIndex: number;
  act: Record<string, ActState>;
  celebrate: number; // increments to trigger confetti
  pointer: { x: number; y: number; by: Role } | null;
  version: number;
}

export type ActState = Record<string, unknown>;

export type RoomAction =
  | { t: "step"; index: number }
  | { t: "act"; stepId: string; a: ActAction }
  | { t: "reset"; stepId: string }
  | { t: "celebrate" }
  | { t: "pointer"; x: number; y: number } // normalized 0..1 coords within the activity stage
  | { t: "pointer-clear" };

export type ActAction =
  | { k: "pick"; q: string; v: string } // all-about-me
  | { k: "select"; item: string | null } // letter-buckets
  | { k: "drop"; item: string; letter: string }
  | { k: "answer"; v: string } // first-sound
  | { k: "next" }
  | { k: "prev" }
  | { k: "tap"; i: number } // blend-it
  | { k: "reveal" }
  | { k: "add"; v: string } // word-builder
  | { k: "undo" }
  | { k: "flip" } // sight-words
  | { k: "mark"; v: "got" | "practise" }
  | { k: "page"; n: number } // story
  | { k: "highlight"; i: number | null };

/** Actions the child's screen may send. Navigation & marking stay with the volunteer. */
const CHILD_ALLOWED: ActAction["k"][] = ["pick", "select", "drop", "answer", "tap", "add", "undo", "flip", "highlight"];

export function initialRoomState(lessonNumber: number): RoomState {
  return { lessonNumber, stepIndex: 0, act: {}, celebrate: 0, pointer: null, version: 0 };
}

export function canPerform(role: Role, action: RoomAction): boolean {
  if (role === "volunteer") return true;
  if (action.t === "act") return CHILD_ALLOWED.includes(action.a.k);
  return action.t === "pointer" || action.t === "pointer-clear";
}

export function reduceRoom(state: RoomState, action: RoomAction, role: Role): RoomState {
  const lesson = getLesson(state.lessonNumber);
  if (!lesson || !canPerform(role, action)) return state;
  const next: RoomState = { ...state, version: state.version + 1 };
  switch (action.t) {
    case "step": {
      const i = Math.max(0, Math.min(lesson.steps.length - 1, action.index));
      return { ...next, stepIndex: i, pointer: null };
    }
    case "celebrate":
      return { ...next, celebrate: state.celebrate + 1 };
    case "pointer":
      return { ...next, pointer: { x: clamp01(action.x), y: clamp01(action.y), by: role } };
    case "pointer-clear":
      return { ...next, pointer: null };
    case "reset": {
      const act = { ...state.act };
      delete act[action.stepId];
      return { ...next, act };
    }
    case "act": {
      const step = lesson.steps.find((s) => s.id === action.stepId);
      if (!step) return state;
      const prev = state.act[step.id] ?? initialActState(step.activity);
      const updated = reduceActivity(step.activity, prev, action.a);
      let celebrate = state.celebrate;
      if (isComplete(step.activity, updated) && !isComplete(step.activity, prev)) celebrate++;
      return { ...next, celebrate, act: { ...state.act, [step.id]: updated } };
    }
  }
}

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0);

export function initialActState(cfg: ActivityConfig): ActState {
  switch (cfg.type) {
    case "all-about-me": return { picks: {} };
    case "letter-buckets": return { placed: {}, selected: null, wrong: null, attempts: 0 };
    case "first-sound": return { index: 0, results: [] as boolean[], last: null };
    case "blend-it": return { index: 0, lit: 0, revealed: false };
    case "word-builder": return { index: 0, built: [] as string[], solved: [] as number[], attempts: 0 };
    case "sight-words": return { index: 0, flipped: false, marks: {} };
    case "story": return { page: 0, highlight: null };
    case "celebrate": return {};
  }
}

// --- per-activity reducers -------------------------------------------------

export function reduceActivity(cfg: ActivityConfig, s: ActState, a: ActAction): ActState {
  switch (cfg.type) {
    case "all-about-me":
      if (a.k === "pick") return { picks: { ...(s.picks as object), [a.q]: a.v } };
      return s;

    case "letter-buckets": {
      const placed = s.placed as Record<string, string>;
      if (a.k === "select") return { ...s, selected: a.item, wrong: null };
      if (a.k === "drop") {
        const item = cfg.items.find((i) => i.id === a.item);
        if (!item || placed[item.id]) return s;
        const attempts = (s.attempts as number) + 1;
        if (item.word[0].toLowerCase() === a.letter.toLowerCase())
          return { ...s, placed: { ...placed, [item.id]: a.letter }, selected: null, wrong: null, attempts };
        return { ...s, wrong: item.id, attempts };
      }
      return s;
    }

    case "first-sound": {
      const index = s.index as number;
      const results = s.results as boolean[];
      if (a.k === "answer") {
        const item = cfg.items[index];
        if (!item || results.length > index) return s;
        const correct = item.word.toLowerCase().startsWith(a.v.toLowerCase()) && bestPrefix(item) === a.v;
        return { ...s, results: [...results, correct], last: a.v };
      }
      if (a.k === "next") return { ...s, index: Math.min(cfg.items.length, index + 1), last: null };
      if (a.k === "prev") return { ...s, index: Math.max(0, index - 1), last: null };
      return s;
    }

    case "blend-it": {
      const index = s.index as number;
      const word = cfg.words[index]?.word ?? "";
      if (a.k === "tap") return { ...s, lit: Math.min(word.length, Math.max(s.lit as number, a.i + 1)) };
      if (a.k === "reveal") return { ...s, revealed: true, lit: word.length };
      if (a.k === "next") return { index: Math.min(cfg.words.length, index + 1), lit: 0, revealed: false };
      if (a.k === "prev") return { index: Math.max(0, index - 1), lit: 0, revealed: false };
      return s;
    }

    case "word-builder": {
      const index = s.index as number;
      const built = s.built as string[];
      const solved = s.solved as number[];
      const target = cfg.words[index]?.word ?? "";
      if (a.k === "add") {
        if (built.length >= target.length || solved.includes(index)) return s;
        const nb = [...built, a.v];
        const done = nb.join("") === target;
        return { ...s, built: nb, solved: done ? [...solved, index] : solved, attempts: (s.attempts as number) + (nb.length === target.length ? 1 : 0) };
      }
      if (a.k === "undo") return solved.includes(index) ? s : { ...s, built: built.slice(0, -1) };
      if (a.k === "next") return { ...s, index: Math.min(cfg.words.length, index + 1), built: [] };
      if (a.k === "prev") return { ...s, index: Math.max(0, index - 1), built: [] };
      return s;
    }

    case "sight-words": {
      const index = s.index as number;
      if (a.k === "flip") return { ...s, flipped: !s.flipped };
      if (a.k === "mark") {
        const w = cfg.words[index];
        if (!w) return s;
        return { ...s, marks: { ...(s.marks as object), [w]: a.v }, index: Math.min(cfg.words.length, index + 1), flipped: false };
      }
      if (a.k === "prev") return { ...s, index: Math.max(0, index - 1), flipped: false };
      if (a.k === "next") return { ...s, index: Math.min(cfg.words.length, index + 1), flipped: false };
      return s;
    }

    case "story": {
      const page = s.page as number;
      if (a.k === "page") return { page: Math.max(0, Math.min(cfg.pages.length - 1, a.n)), highlight: null };
      if (a.k === "next") return { page: Math.min(cfg.pages.length - 1, page + 1), highlight: null };
      if (a.k === "prev") return { page: Math.max(0, page - 1), highlight: null };
      if (a.k === "highlight") return { ...s, highlight: a.i };
      return s;
    }

    case "celebrate":
      return s;
  }
}

/** For multi-letter options (sh, st…) the right answer is the longest option the word starts with. */
function bestPrefix(item: { word: string; options: string[] }): string {
  return [...item.options].filter((o) => item.word.startsWith(o)).sort((a, b) => b.length - a.length)[0] ?? "";
}

export function isComplete(cfg: ActivityConfig, s: ActState): boolean {
  switch (cfg.type) {
    case "letter-buckets": return Object.keys(s.placed as object).length === cfg.items.length;
    case "first-sound": return (s.results as boolean[]).length === cfg.items.length;
    case "blend-it": return (s.index as number) >= cfg.words.length;
    case "word-builder": return (s.solved as number[]).length === cfg.words.length;
    case "sight-words": return Object.keys(s.marks as object).length === cfg.words.length;
    case "all-about-me": return Object.keys(s.picks as object).length === cfg.questions.length;
    default: return false;
  }
}

/** Turn final room state into per-activity scores for the child's progress record. */
export function scoreRoom(state: RoomState): { activityId: string; correct: number; total: number; detail: Record<string, unknown> }[] {
  const lesson = getLesson(state.lessonNumber);
  if (!lesson) return [];
  const out: { activityId: string; correct: number; total: number; detail: Record<string, unknown> }[] = [];
  for (const step of lesson.steps) {
    const s = state.act[step.id];
    if (!s) continue;
    const cfg = step.activity;
    switch (cfg.type) {
      case "letter-buckets": {
        const placed = Object.keys(s.placed as object).length;
        out.push({ activityId: step.id, correct: placed, total: Math.max(placed, s.attempts as number), detail: { letters: cfg.letters } });
        break;
      }
      case "first-sound": {
        const r = s.results as boolean[];
        out.push({ activityId: step.id, correct: r.filter(Boolean).length, total: r.length, detail: { sounds: cfg.items.slice(0, r.length).map((i) => i.word) } });
        break;
      }
      case "word-builder": {
        const solved = (s.solved as number[]).length;
        out.push({ activityId: step.id, correct: solved, total: Math.max(solved, s.attempts as number), detail: { words: cfg.words.map((w) => w.word) } });
        break;
      }
      case "sight-words": {
        const marks = s.marks as Record<string, string>;
        const got = Object.entries(marks).filter(([, v]) => v === "got").map(([k]) => k);
        out.push({ activityId: step.id, correct: got.length, total: Object.keys(marks).length, detail: { mastered: got, practise: Object.keys(marks).filter((k) => marks[k] !== "got") } });
        break;
      }
      case "blend-it": {
        const n = Math.min(cfg.words.length, s.index as number);
        out.push({ activityId: step.id, correct: n, total: n, detail: { words: cfg.words.slice(0, n).map((w) => w.word) } });
        break;
      }
      case "story": {
        const pages = (s.page as number) + 1;
        out.push({ activityId: step.id, correct: pages, total: cfg.pages.length, detail: { book: cfg.book } });
        break;
      }
      case "all-about-me":
        out.push({ activityId: step.id, correct: 0, total: 0, detail: { picks: s.picks } });
        break;
    }
  }
  return out.filter((r) => r.total > 0 || r.activityId.endsWith("welcome"));
}
