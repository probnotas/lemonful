export const MILESTONES: Record<string, { title: string; emoji: string; description: string }> = {
  "first-session": { title: "First Lesson", emoji: "🌱", description: "Completed a first lesson with a tutor" },
  "satpin": { title: "Sound Starter", emoji: "🔤", description: "Matched the first six letter sounds" },
  "first-word": { title: "First Words", emoji: "🗣️", description: "Blended sounds into a real word" },
  "first-book": { title: "First Book", emoji: "📖", description: "Read a whole Lemonful book" },
  "sight-words": { title: "Tricky Word Tamer", emoji: "🦁", description: "Mastered 10 sight words" },
  "five-sessions": { title: "Reading Habit", emoji: "🔥", description: "Completed 5 lessons" },
  "halfway": { title: "Halfway There", emoji: "⛰️", description: "Finished 4 of 8 lessons" },
  "reader": { title: "Lemonful Reader", emoji: "🏆", description: "Completed the full reading journey" },
};

export const VOLUNTEER_ACHIEVEMENTS = [
  { key: "trained", title: "Ready to Tutor", emoji: "🎓", test: (s: VStats) => s.trained },
  { key: "first", title: "First Session", emoji: "🌟", test: (s: VStats) => s.sessions >= 1 },
  { key: "ten-hours", title: "10 Hours of Impact", emoji: "⏱️", test: (s: VStats) => s.minutes >= 600 },
  { key: "five-sessions", title: "High Five", emoji: "🖐️", test: (s: VStats) => s.sessions >= 5 },
  { key: "two-kids", title: "Reading Buddy x2", emoji: "👫", test: (s: VStats) => s.kids >= 2 },
  { key: "reader-maker", title: "Reader Maker", emoji: "🏆", test: (s: VStats) => s.readers >= 1 },
  { key: "forty-hours", title: "40-Hour Hero", emoji: "🦸", test: (s: VStats) => s.minutes >= 2400 },
];
export interface VStats { trained: boolean; sessions: number; minutes: number; kids: number; readers: number }
