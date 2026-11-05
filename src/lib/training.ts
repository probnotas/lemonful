/** Volunteer onboarding & training modules. Completing all of them credits TRAINING_MINUTES. */
export const TRAINING_MINUTES = 120;

export interface TrainingModule {
  id: string;
  title: string;
  minutes: number;
  emoji: string;
  sections: { heading: string; body: string }[];
  quiz: { q: string; options: string[]; answer: number }[];
}

export const TRAINING: TrainingModule[] = [
  {
    id: "welcome", title: "Welcome to Lemonful", minutes: 15, emoji: "🍋",
    sections: [
      { heading: "Our mission", body: "Lemonful gives every child free, one-on-one reading support. You'll meet with the same child each week for about 45 minutes, following a guided lesson. You don't need to be a teacher — the lesson script tells you what to say and do." },
      { heading: "What you commit to", body: "Show up on time, every scheduled week. If you can't make a session, cancel at least 24 hours ahead from your schedule page so the family is notified. Consistency is the single biggest factor in a child's progress." },
      { heading: "Your community-service hours", body: "Hours are tracked automatically: every completed session adds its time to your log, and this training counts too. You can print a certificate of your hours at any time from the Community Hours page." },
    ],
    quiz: [
      { q: "How long is a typical Lemonful session?", options: ["15 minutes", "About 45 minutes", "2 hours"], answer: 1 },
      { q: "You can't make a session. What do you do?", options: ["Just don't show up", "Cancel at least 24 hours ahead in your schedule", "Ask the child to message you"], answer: 1 },
    ],
  },
  {
    id: "safety", title: "Child Safety & Code of Conduct", minutes: 30, emoji: "🛡️",
    sections: [
      { heading: "Stay on the platform", body: "All contact with children and families happens inside Lemonful. Never share personal phone numbers, social media, or emails, and never accept friend/follow requests from families. Sessions happen only in the Lemonful tutoring room." },
      { heading: "A parent is nearby", body: "Children join from their parent's account, and a parent or guardian should be in the home during sessions. If a child is alone and something feels off, end the session kindly and report it." },
      { heading: "Privacy", body: "Never record, screenshot or share anything from a session. Only use the child's first name. Notes you write are private to Lemonful staff and the child's parent (summary only)." },
      { heading: "If a child tells you something worrying", body: "Stay calm, listen, don't promise to keep secrets, and don't investigate. After the session, use 'Report a concern' on the session notes page immediately — a Lemonful staff member will follow up the same day." },
    ],
    quiz: [
      { q: "A parent asks for your Instagram so their child can follow you. You…", options: ["Share it — they're nice", "Politely say all contact stays on Lemonful", "Give your phone number instead"], answer: 1 },
      { q: "Can you take a screenshot of a fun moment to post?", options: ["Yes, if you blur the face", "No — never record or share anything from a session", "Only on a private account"], answer: 1 },
      { q: "A child shares something that worries you. You…", options: ["Promise to keep it secret", "Listen calmly and report it right after via 'Report a concern'", "Ask lots of questions to find out more"], answer: 1 },
    ],
  },
  {
    id: "lessons", title: "How a Lesson Works", minutes: 25, emoji: "📘",
    sections: [
      { heading: "The lesson guide", body: "In the tutoring room, the left panel shows each step: Your goal, What to say, questions to ask, and a Tip. Press Next to move both screens to the next step. You control navigation; the child can tap and drag in activities." },
      { heading: "I do, we do, you do", body: "Model a skill first, do it together, then let the child try alone. Wait at least 5 seconds before helping — thinking time matters." },
      { heading: "Pointing & highlighting", body: "Move your mouse over the activity to show a pointer on the child's screen. In stories, tap a word to highlight it for both of you." },
      { heading: "After the session", body: "Write a short summary for the parent (what you did, one win, one thing to practise) and private notes for your next session. This takes ~5 minutes and counts toward your hours." },
    ],
    quiz: [
      { q: "Who moves the lesson to the next step?", options: ["The child", "The volunteer, using Next", "It moves automatically"], answer: 1 },
      { q: "What is 'I do, we do, you do'?", options: ["A way to model, practise together, then practise alone", "A goodbye song", "A grading system"], answer: 0 },
    ],
  },
  {
    id: "phonics", title: "Phonics Basics", minutes: 30, emoji: "🔤",
    sections: [
      { heading: "Sounds, not names", body: "Say the letter's sound, not its name: /s/ (sss), not \"ess\". Keep sounds clipped: /t/ not \"tuh\". This makes blending possible." },
      { heading: "Blending", body: "Blending is pushing sounds together: /s/ /a/ /t/ → sat. Start slow, then faster. If a child gets stuck, say the first two sounds together (\"sa…\") then add the last." },
      { heading: "Magic e, vowel teams, blends and digraphs", body: "Lemonful's books each focus on one rule. The lesson guide reminds you of the rule — read the short explanation aloud and use the actions suggested in the tips." },
      { heading: "Tricky (sight) words", body: "Words like 'the' and 'said' don't follow the rules. We learn them by sight. Mark each honestly as ✓ or 'practise' — it helps the next lesson focus on what's needed." },
    ],
    quiz: [
      { q: "What sound do you make for the letter s?", options: ["\"ess\"", "/s/ — a hissing sss", "\"suh\""], answer: 1 },
      { q: "A child is stuck blending c-a-t. A good hint is…", options: ["Say \"ca…\" then add /t/", "Tell them the answer immediately", "Skip the word"], answer: 0 },
    ],
  },
  {
    id: "encourage", title: "Encouragement & Connection", minutes: 20, emoji: "💛",
    sections: [
      { heading: "Specific praise", body: "Instead of \"good job\", say exactly what they did: \"You sounded out every letter in 'pin' — that's what readers do!\" Praise effort and strategies, not being 'smart'." },
      { heading: "When it's hard", body: "If a child is frustrated, go back to something they can do easily, take a 1-minute silly break, or switch to the story. Ending on a win matters more than finishing every step." },
      { heading: "Building the relationship", body: "Remember their answers from the welcome questions (they're saved for you) and bring them up later. Kids read more for people they feel connected to." },
    ],
    quiz: [
      { q: "Which is the best praise?", options: ["\"You're so smart!\"", "\"You stretched out every sound in 'sat' — great reading!\"", "\"Good job.\""], answer: 1 },
    ],
  },
];
