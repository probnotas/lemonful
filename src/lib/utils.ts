import clsx, { type ClassValue } from "clsx";
export const cn = (...c: ClassValue[]) => clsx(c);

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAYS_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAY_HOURS = [16, 17, 18, 19];
export const WEEKEND_HOURS = [9, 10, 11, 12, 13, 14, 15, 16];

export function hourLabel(h: number) {
  const f = (x: number) => `${((x + 11) % 12) + 1}:00 ${x < 12 ? "AM" : "PM"}`;
  return `${f(h)} – ${f(h + 1)}`;
}

export const READING_LEVELS: Record<string, string> = {
  JUST_STARTING: "Just starting to learn letters and sounds",
  SOME_SOUNDS: "Knows some letter sounds",
  SIMPLE_WORDS: "Beginning to read simple words",
  SIMPLE_BOOKS: "Reading simple books or sentences",
  NOT_SURE: "Not sure yet",
};

export function fmtDate(d: Date | string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) {
  return new Date(d).toLocaleDateString("en-CA", opts);
}
export function fmtTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit" });
}
export function fmtHours(minutes: number) {
  const h = minutes / 60;
  return Number.isInteger(h) ? `${h}` : h.toFixed(1);
}

export const AVATARS: Record<string, string> = { bear: "🐻", pup: "🐶", whale: "🐋", frog: "🐸", bunny: "🐰", lion: "🦁", owl: "🦉", fox: "🦊" };
export const avatar = (k: string) => AVATARS[k] ?? "🐻";

/** A child may join from 30 min before until the scheduled end, or any time the volunteer has opened the room. */
export function canJoin(s: { status: string; scheduledAt: Date; durationMin: number }) {
  if (s.status === "LIVE") return true;
  if (s.status !== "SCHEDULED") return false;
  const t = +new Date(s.scheduledAt), now = Date.now();
  return now >= t - 30 * 60_000 && now <= t + (s.durationMin + 15) * 60_000;
}
