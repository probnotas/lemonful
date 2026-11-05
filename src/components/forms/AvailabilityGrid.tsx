"use client";
import { CalendarDays, Sun } from "lucide-react";
import { DAYS_LONG, WEEKDAY_HOURS, WEEKEND_HOURS, hourLabel } from "@/lib/utils";

export type Slot = { day: number; hour: number };
const key = (s: Slot) => `${s.day}-${s.hour}`;

export function AvailabilityGrid({ value, onChange }: { value: Slot[]; onChange: (v: Slot[]) => void }) {
  const set = new Set(value.map(key));
  const toggle = (s: Slot) => {
    const k = key(s);
    onChange(set.has(k) ? value.filter((x) => key(x) !== k) : [...value, s]);
  };
  const setMany = (slots: Slot[], on: boolean) => {
    const keys = new Set(slots.map(key));
    const rest = value.filter((x) => !keys.has(key(x)));
    onChange(on ? [...rest, ...slots] : rest);
  };
  const weekdays = [1, 2, 3, 4, 5];
  const all = (days: number[], hours: number[]) => days.flatMap((day) => hours.map((hour) => ({ day, hour })));

  const Table = ({ days, hours }: { days: number[]; hours: number[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-navy/70">
            <th className="py-1 pr-2 font-semibold">Time</th>
            {days.map((d) => <th key={d} className="py-1 text-center font-semibold">{DAYS_LONG[d].slice(0, 3)}</th>)}
          </tr>
        </thead>
        <tbody>
          {hours.map((h) => (
            <tr key={h} className="border-t border-navy/5">
              <td className="py-1.5 pr-2 whitespace-nowrap">{hourLabel(h)}</td>
              {days.map((d) => {
                const on = set.has(`${d}-${h}`);
                return (
                  <td key={d} className="text-center">
                    <button type="button" aria-pressed={on} aria-label={`${DAYS_LONG[d]} ${hourLabel(h)}`} onClick={() => toggle({ day: d, hour: h })}
                      className={`h-6 w-6 rounded-md border-2 transition ${on ? "bg-teal border-teal text-white" : "border-navy/25 bg-white hover:border-teal"}`}>
                      {on ? "✓" : ""}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-teal/20 bg-teal-light/60 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2"><CalendarDays className="text-teal" /><div><p className="font-display text-lg font-bold leading-tight">Weekdays (Monday to Friday)</p><p className="text-xs text-navy/70">Select the times that work for you.</p></div></div>
          <div className="flex gap-2 text-xs font-semibold">
            <button type="button" className="rounded-lg border bg-white px-2 py-1" onClick={() => setMany(all(weekdays, WEEKDAY_HOURS), true)}>Select all weekdays</button>
            <button type="button" className="rounded-lg border bg-white px-2 py-1" onClick={() => setMany(all(weekdays, WEEKDAY_HOURS), false)}>Clear all</button>
          </div>
        </div>
        <Table days={weekdays} hours={WEEKDAY_HOURS} />
      </div>
      <div className="rounded-2xl border border-lemon/40 bg-lemon-light/70 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2"><Sun className="text-lemon-dark" /><div><p className="font-display text-lg font-bold leading-tight">Weekends (Saturday and Sunday)</p><p className="text-xs text-navy/70">Select the times that work for you.</p></div></div>
          <div className="flex gap-2 text-xs font-semibold">
            <button type="button" className="rounded-lg border bg-white px-2 py-1" onClick={() => setMany(all([6], WEEKEND_HOURS), true)}>Select all Saturdays</button>
            <button type="button" className="rounded-lg border bg-white px-2 py-1" onClick={() => setMany(all([0], WEEKEND_HOURS), true)}>Select all Sundays</button>
            <button type="button" className="rounded-lg border bg-white px-2 py-1" onClick={() => setMany(all([6, 0], WEEKEND_HOURS), false)}>Clear all</button>
          </div>
        </div>
        <Table days={[6, 0]} hours={WEEKEND_HOURS} />
      </div>
    </div>
  );
}

export function summarizeSlots(slots: Slot[]) {
  const byDay = new Map<number, number[]>();
  for (const s of slots) byDay.set(s.day, [...(byDay.get(s.day) ?? []), s.hour]);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.filter((d) => byDay.has(d)).map((d) => `${DAYS_LONG[d].slice(0, 3)}: ${byDay.get(d)!.sort((a, b) => a - b).map((h) => hourLabel(h)).join(", ")}`);
}
