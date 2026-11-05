/**
 * Lemonful curriculum: the 8-lesson reading journey.
 *
 * Content lives in code so it is versioned, reviewed and type-checked. Each lesson is a
 * sequence of steps; the volunteer sees the guide (goal / what to say / questions / tip)
 * and both screens see the step's interactive activity.
 *
 * NOTE FOR YVONNE: story text below is placeholder sample text written to exercise each
 * reading rule. Swap in the real Lemonful book pages — the activity engine only needs
 * `pages: [{ text, scene }]`.
 */

export type ActivityConfig =
  | { type: "all-about-me"; questions: { id: string; prompt: string; choices: { id: string; emoji: string; label: string }[] }[] }
  | { type: "letter-buckets"; letters: string[]; items: { id: string; emoji: string; word: string }[] }
  | { type: "first-sound"; items: { emoji: string; word: string; options: string[] }[] }
  | { type: "blend-it"; words: { word: string; emoji: string }[] }
  | { type: "word-builder"; words: { word: string; emoji: string }[]; tiles: string[] }
  | { type: "sight-words"; words: string[] }
  | { type: "story"; book: BookId; pages: { text: string; scene: string }[] }
  | { type: "celebrate"; message: string };

export type ActivityType = ActivityConfig["type"];

export interface LessonStep {
  id: string;
  title: string;
  minutes: number;
  goal: string;
  say: string;
  questions?: string[];
  tip: string;
  lemony: string; // what the Lemony mascot says on the child's screen
  activity: ActivityConfig;
}

export interface Lesson {
  number: number;
  title: string;
  focus: string;
  rule: string;
  book?: BookId;
  skills: string[];
  steps: LessonStep[];
}

export type BookId = "dream-time" | "time-for-cake" | "sail-with-me" | "a-perfect-hike" | "my-wish-for-you" | "all-the-times";

export const BOOKS: Record<BookId, { title: string; cover: string; rule: string; blurb: string }> = {
  "dream-time": { title: "Dream Time", cover: "/art/book-dream-time.png", rule: "Short vowel sounds", blurb: "A gentle whale drifts through a dreamy sea, one short vowel sound at a time." },
  "time-for-cake": { title: "Time for Cake", cover: "/art/book-time-for-cake.png", rule: "Magic e (a_e, i_e)", blurb: "Bear bakes a very big cake and learns how a silent e changes a word." },
  "sail-with-me": { title: "Sail with Me", cover: "/art/book-sail-with-me.png", rule: "Vowel teams (ai, ee)", blurb: "Two friends sail away and find that some vowels like to work as a team." },
  "a-perfect-hike": { title: "A Perfect Hike", cover: "/art/book-a-perfect-hike.png", rule: "Consonant blends (st, tr, cl)", blurb: "Up the trail and over the stream — blends help us read every step." },
  "my-wish-for-you": { title: "My Wish for You", cover: "/art/book-my-wish-for-you.png", rule: "Digraphs (sh, ch, th, wh)", blurb: "Pup makes a wish for a friend and discovers letters that make one sound together." },
  "all-the-times": { title: "All the Times", cover: "/art/book-all-the-times.png", rule: "Reading with fluency & expression", blurb: "Under the moon, Bear and Pup remember all the times they shared." },
};

const goodbye = (n: number, next: string): LessonStep => ({
  id: `l${n}-goodbye`,
  title: "Celebrate & Goodbye",
  minutes: 4,
  goal: "End on a high note so the child is excited for next time.",
  say: `"You worked SO hard today! I'm really proud of you. Next time we're going to ${next}. Can you give me a big wave goodbye?"`,
  questions: ["What was your favourite part today?", "Can you remember one sound or word we learned?"],
  tip: "Name one specific thing they did well (\"You remembered /s/ all by yourself!\"). Specific praise builds confidence.",
  lemony: "Hooray! You did it! See you next time!",
  activity: { type: "celebrate", message: "Amazing reading today!" },
});

export const LESSONS: Lesson[] = [
  {
    number: 1,
    title: "First Steps in Reading",
    focus: "Meet the first six letter sounds",
    rule: "Letters make sounds: s, a, t, p, i, n",
    skills: ["s", "a", "t", "p", "i", "n"],
    steps: [
      {
        id: "l1-welcome",
        title: "Welcome & Connection",
        minutes: 8,
        goal: "Make the child comfortable and have fun together.",
        say: "\"Hi! My name is ___. What's your name? I'm so excited we get to spend some time together today! But before we do anything, I need to ask you some really important questions. Is that okay? Are you ready?\"",
        questions: [
          "If you could be any animal, what would you be? And why?",
          "If you could have any superpower, what would you choose? And why?",
          "Tell me how you feel about reading. Do you think you can read yet?",
        ],
        tip: "Keep it silly and conversational. There are no right or wrong answers.",
        lemony: "Hi friend! Tap your favourites so your tutor can get to know you!",
        activity: {
          type: "all-about-me",
          questions: [
            { id: "animal", prompt: "Pick an animal you'd be", choices: [
              { id: "lion", emoji: "🦁", label: "Lion" }, { id: "dolphin", emoji: "🐬", label: "Dolphin" }, { id: "bear", emoji: "🐻", label: "Bear" },
              { id: "bunny", emoji: "🐰", label: "Bunny" }, { id: "eagle", emoji: "🦅", label: "Eagle" }, { id: "turtle", emoji: "🐢", label: "Turtle" } ] },
            { id: "power", prompt: "Pick a superpower", choices: [
              { id: "fly", emoji: "🦸", label: "Flying" }, { id: "invisible", emoji: "🫥", label: "Invisible" }, { id: "fast", emoji: "⚡", label: "Super speed" },
              { id: "animals", emoji: "🐾", label: "Talk to animals" } ] },
            { id: "feel", prompt: "How do you feel about reading?", choices: [
              { id: "love", emoji: "😍", label: "I love it" }, { id: "ok", emoji: "🙂", label: "It's okay" }, { id: "hard", emoji: "😕", label: "It's tricky" }, { id: "unsure", emoji: "🤔", label: "Not sure" } ] },
          ],
        },
      },
      {
        id: "l1-buckets",
        title: "Letter Buckets",
        minutes: 12,
        goal: "Hear the first sound in a word and match it to a letter.",
        say: "\"Each bucket has a letter, and each letter makes a sound. /s/ like a snake — sss! Let's say each picture's name slowly and listen for the very first sound. Which bucket does it go in?\"",
        questions: ["What sound does this picture start with?", "Can you think of something else that starts with that sound?"],
        tip: "Say the sound, not the letter name: /s/ not \"ess\". Stretch it out: \"sssun\".",
        lemony: "Let's put the pictures in the right letter buckets!",
        activity: {
          type: "letter-buckets",
          letters: ["s", "a", "t", "p", "i", "n"],
          items: [
            { id: "sun", emoji: "☀️", word: "sun" }, { id: "apple", emoji: "🍎", word: "apple" }, { id: "turtle", emoji: "🐢", word: "turtle" },
            { id: "pig", emoji: "🐷", word: "pig" }, { id: "igloo", emoji: "🛖", word: "igloo" }, { id: "net", emoji: "🥅", word: "net" },
            { id: "ant", emoji: "🐜", word: "ant" }, { id: "sock", emoji: "🧦", word: "sock" }, { id: "nail", emoji: "🔩", word: "nail" },
            { id: "avocado", emoji: "🥑", word: "avocado" }, { id: "pizza", emoji: "🍕", word: "pizza" }, { id: "nose", emoji: "👃", word: "nose" },
          ],
        },
      },
      {
        id: "l1-first-sound",
        title: "Sound Detective",
        minutes: 10,
        goal: "Practise picking out the first sound without help from buckets.",
        say: "\"You're a sound detective now! I'll say a word, and you find the letter that makes its first sound. Ready? Tiger... t-t-tiger!\"",
        questions: ["Was that sound at the start or the end of the word?"],
        tip: "If they miss one, say the word again slowly and let them try again — no \"wrong\", just \"let's listen again\".",
        lemony: "Which letter makes the first sound?",
        activity: {
          type: "first-sound",
          items: [
            { emoji: "🐯", word: "tiger", options: ["t", "s", "n"] }, { emoji: "🍝", word: "pasta", options: ["a", "p", "i"] },
            { emoji: "🐍", word: "snake", options: ["s", "t", "p"] }, { emoji: "🦓", word: "nest", options: ["i", "n", "a"] },
            { emoji: "🐊", word: "alligator", options: ["a", "s", "t"] }, { emoji: "🦔", word: "insect", options: ["p", "n", "i"] },
          ],
        },
      },
      goodbye(1, "use these sounds to read our very first words"),
    ],
  },
  {
    number: 2,
    title: "Sounds Make Words",
    focus: "Blend s, a, t, p, i, n into real words",
    rule: "Blending: push sounds together to read a word",
    book: "dream-time",
    skills: ["blending", "sat", "pin", "tap"],
    steps: [
      {
        id: "l2-warmup", title: "Warm-up Sounds", minutes: 6,
        goal: "Reconnect and review last lesson's sounds.",
        say: "\"Welcome back! Do you remember our bucket letters? Let's see how fast you can find the right bucket!\"",
        questions: ["What did you do since last time?", "Which sound is your favourite?"],
        tip: "Celebrate what they remember. If a sound is shaky, note it for your session notes.",
        lemony: "Welcome back! Let's warm up our sounds!",
        activity: { type: "letter-buckets", letters: ["s", "a", "t", "p", "i", "n"], items: [
          { id: "sun", emoji: "☀️", word: "sun" }, { id: "ant", emoji: "🐜", word: "ant" }, { id: "tent", emoji: "⛺", word: "tent" },
          { id: "pan", emoji: "🍳", word: "pan" }, { id: "ink", emoji: "🖋️", word: "ink" }, { id: "nut", emoji: "🥜", word: "nut" } ] },
      },
      {
        id: "l2-blend", title: "Blend It!", minutes: 12,
        goal: "Blend 3 sounds into a word (s-a-t → sat).",
        say: "\"Watch me! I touch each letter and say its sound: /s/ /a/ /t/. Now I push them together faster... sat! Your turn — tap each letter and say the sound.\"",
        questions: ["Can you say it faster?", "What does that word mean?"],
        tip: "Model it first, then do it together, then let them try alone (I do, we do, you do).",
        lemony: "Tap each letter, say the sound, then smoosh them together!",
        activity: { type: "blend-it", words: [
          { word: "sat", emoji: "🪑" }, { word: "pin", emoji: "📌" }, { word: "tap", emoji: "🚰" },
          { word: "nap", emoji: "😴" }, { word: "tin", emoji: "🥫" }, { word: "pit", emoji: "🍑" } ] },
      },
      {
        id: "l2-build", title: "Word Builder", minutes: 10,
        goal: "Spell simple words by listening to each sound.",
        say: "\"Now let's go backwards! I'll show you a picture. Say the word slowly and pick a letter for each sound.\"",
        questions: ["What's the first sound? The middle? The last?"],
        tip: "Hold up three fingers and touch one per sound — it helps kids hear the parts.",
        lemony: "Build the word that matches the picture!",
        activity: { type: "word-builder", tiles: ["s", "a", "t", "p", "i", "n"], words: [
          { word: "pan", emoji: "🍳" }, { word: "sit", emoji: "🧘" }, { word: "ant", emoji: "🐜" }, { word: "tip", emoji: "👆" } ] },
      },
      {
        id: "l2-story", title: "Read: Dream Time", minutes: 10,
        goal: "Read a short story together, pointing at each word.",
        say: "\"This is a Lemonful book called Dream Time! I'll read a page, then you help me find the words you can read.\"",
        questions: ["What do you think will happen next?", "Can you find the word 'sat'?"],
        tip: "Tap a word to highlight it on their screen. Let them read any word they can decode; read the rest for them.",
        lemony: "Story time! Follow along with me.",
        activity: { type: "story", book: "dream-time", pages: [
          { scene: "🐋🌊", text: "A big whale sat in the sea." },
          { scene: "🐟🐟", text: "The fish tap tap tap on the whale." },
          { scene: "🌙✨", text: "It is time to nap, said the whale." },
          { scene: "💤🐋", text: "The whale had a dream in the sea." } ] },
      },
      goodbye(2, "read a story about a very big cake"),
    ],
  },
  {
    number: 3,
    title: "Time for Cake",
    focus: "Magic e changes the vowel sound",
    rule: "When e sits at the end, the vowel says its name (cap → cape)",
    book: "time-for-cake",
    skills: ["a_e", "i_e", "magic e"],
    steps: [
      {
        id: "l3-sight", title: "Tricky Words", minutes: 7,
        goal: "Learn a few words we read by sight.",
        say: "\"Some words are tricky — we can't sound them out, so we remember them like a friend's face. Let's meet some!\"",
        tip: "Flip a card, say the word, have them say it back. Mark ✓ or 'practise' honestly — it guides future lessons.",
        lemony: "Let's meet some tricky words!",
        activity: { type: "sight-words", words: ["the", "is", "a", "to", "I", "said"] },
      },
      {
        id: "l3-magic-e", title: "Magic e", minutes: 12,
        goal: "Notice how adding e changes the middle sound.",
        say: "\"Here's a secret: when the letter e sits at the end of a word, it's MAGIC. It doesn't make a sound, but it makes the vowel say its name! cap... cape!\"",
        questions: ["What sound does a make in 'cap'? In 'cape'?"],
        tip: "Make a 'magic wand' motion when e appears — kids love it and remember the rule.",
        lemony: "Blend the words. Watch out for magic e!",
        activity: { type: "blend-it", words: [
          { word: "cake", emoji: "🎂" }, { word: "cape", emoji: "🦸" }, { word: "time", emoji: "⏰" },
          { word: "bike", emoji: "🚲" }, { word: "kite", emoji: "🪁" }, { word: "game", emoji: "🎲" } ] },
      },
      {
        id: "l3-story", title: "Read: Time for Cake", minutes: 12,
        goal: "Read magic-e words inside a story.",
        say: "\"Let's read Time for Cake! Every time you spot a magic-e word, give it a magic wand wave!\"",
        questions: ["How many magic-e words can you find on this page?", "What would you put on a cake?"],
        tip: "Highlight words as you go so they can track along.",
        lemony: "It's time for cake! Let's read!",
        activity: { type: "story", book: "time-for-cake", pages: [
          { scene: "🐻🎂", text: "Bear will bake a cake." },
          { scene: "🥚🧈", text: "He makes it big. He makes it fine." },
          { scene: "🍓🍰", text: "Bear puts a ripe plum on top." },
          { scene: "🎉🐻", text: "It is time for cake! Bear can not wait." } ] },
      },
      goodbye(3, "go sailing with a pair of vowel friends"),
    ],
  },
  {
    number: 4,
    title: "Sail with Me",
    focus: "Vowel teams: ai and ee",
    rule: "When two vowels go walking, the first one does the talking",
    book: "sail-with-me",
    skills: ["ai", "ee"],
    steps: [
      {
        id: "l4-warmup", title: "Warm-up: Magic e", minutes: 6,
        goal: "Review magic e before learning vowel teams.",
        say: "\"Quick! Show me your magic wand. Let's blend some magic-e words super fast!\"",
        tip: "Quick wins at the start build momentum.",
        lemony: "Magic e warm-up!",
        activity: { type: "blend-it", words: [{ word: "lake", emoji: "🏞️" }, { word: "hide", emoji: "🙈" }, { word: "bone", emoji: "🦴" }] },
      },
      {
        id: "l4-teams", title: "Vowel Teams", minutes: 12,
        goal: "Read ai and ee words.",
        say: "\"Some vowels like to work as a team! When a and i go walking, a does the talking: rain, sail. When e and e are together they say /ee/: tree, see.\"",
        questions: ["Which team is in this word?"],
        tip: "Point to the team with your cursor and say 'team!' together.",
        lemony: "Vowel teams work together!",
        activity: { type: "blend-it", words: [{ word: "sail", emoji: "⛵" }, { word: "rain", emoji: "🌧️" }, { word: "tree", emoji: "🌳" }, { word: "bee", emoji: "🐝" }, { word: "feet", emoji: "🦶" }, { word: "snail", emoji: "🐌" }] },
      },
      {
        id: "l4-story", title: "Read: Sail with Me", minutes: 12,
        goal: "Read vowel-team words in a story.",
        say: "\"Grab your captain's hat! Let's read Sail with Me.\"",
        questions: ["Where would you sail to?"],
        tip: "Let them read the vowel-team words on their own.",
        lemony: "All aboard! Let's read!",
        activity: { type: "story", book: "sail-with-me", pages: [
          { scene: "⛵🐻", text: "Bear and Pup set sail on the sea." },
          { scene: "🌧️🌊", text: "Rain fell on the sail. Drip, drip, drip." },
          { scene: "🐝🌳", text: "They see a tree and a bee on an island." },
          { scene: "☀️⛵", text: "Sail with me, said Bear. And Pup did." } ] },
      },
      goodbye(4, "go on a hike with some letter blends"),
    ],
  },
  {
    number: 5,
    title: "A Perfect Hike",
    focus: "Consonant blends",
    rule: "Two consonants side by side each keep their sound (st, tr, cl)",
    book: "a-perfect-hike",
    skills: ["st", "tr", "cl", "fr"],
    steps: [
      {
        id: "l5-build", title: "Blend Builder", minutes: 10,
        goal: "Hear and build words that start with blends.",
        say: "\"Let's build some hiking words! Listen: s-t-o-p. Can you hear both /s/ and /t/?\"",
        tip: "Blends are two sounds said quickly, not one new sound — stretch them out.",
        lemony: "Build the hiking words!",
        activity: { type: "word-builder", tiles: ["s", "t", "r", "o", "p", "e", "c", "l", "a", "m", "i"], words: [{ word: "stop", emoji: "🛑" }, { word: "trip", emoji: "🎒" }, { word: "clam", emoji: "🦪" }, { word: "step", emoji: "👣" }] },
      },
      {
        id: "l5-story", title: "Read: A Perfect Hike", minutes: 14,
        goal: "Read blend words in a story.",
        say: "\"Lace up your boots! Let's read A Perfect Hike together.\"",
        questions: ["What would you pack for a hike?", "Can you find a word that starts with 'st'?"],
        tip: "Ask them to predict what's on the next page before you turn it.",
        lemony: "Let's go on a hike!",
        activity: { type: "story", book: "a-perfect-hike", pages: [
          { scene: "🎒🥾", text: "Pup and Bear pack a snack for the trip." },
          { scene: "🌲🪨", text: "They step on stones and climb the trail." },
          { scene: "🐸💧", text: "A frog sits by the stream. Plop!" },
          { scene: "⛰️🌄", text: "At the top they stop. What a perfect hike!" } ] },
      },
      {
        id: "l5-sight", title: "Tricky Words", minutes: 6,
        goal: "Add new sight words.",
        say: "\"Time for some new tricky-word friends!\"",
        tip: "Review any 'practise' words from Lesson 3 too.",
        lemony: "More tricky words!",
        activity: { type: "sight-words", words: ["they", "was", "what", "of", "you", "do"] },
      },
      goodbye(5, "make a wish and learn letters that team up"),
    ],
  },
  {
    number: 6,
    title: "My Wish for You",
    focus: "Digraphs: sh, ch, th, wh",
    rule: "Two letters, one sound",
    book: "my-wish-for-you",
    skills: ["sh", "ch", "th", "wh"],
    steps: [
      {
        id: "l6-digraphs", title: "Two Letters, One Sound", minutes: 12,
        goal: "Read words with sh, ch, th and wh.",
        say: "\"Some letters hold hands and make ONE new sound. s and h say /sh/ — like when we tell someone to be quiet! shhh!\"",
        questions: ["Which two letters are holding hands?"],
        tip: "Add actions: finger on lips for sh, choo-choo train arm for ch.",
        lemony: "These letters hold hands!",
        activity: { type: "blend-it", words: [{ word: "ship", emoji: "🚢" }, { word: "chin", emoji: "🧔" }, { word: "fish", emoji: "🐟" }, { word: "bath", emoji: "🛁" }, { word: "whale", emoji: "🐋" }, { word: "chick", emoji: "🐥" }] },
      },
      {
        id: "l6-story", title: "Read: My Wish for You", minutes: 14,
        goal: "Read digraph words in a story with expression.",
        say: "\"This story is about a wish. Let's read it with our happy voices!\"",
        questions: ["What would you wish for a friend?"],
        tip: "Model expressive reading, then let them try a page with feeling.",
        lemony: "Make a wish and read with me!",
        activity: { type: "story", book: "my-wish-for-you", pages: [
          { scene: "🐶🌠", text: "Pup sees a shooting star in the sky." },
          { scene: "🐻💭", text: "I wish, I wish, I wish, said Pup." },
          { scene: "🍫🐟", text: "Not a ship or a fish or a chocolate chip." },
          { scene: "💛🐻", text: "My wish is for you, Bear. That you are happy." } ] },
      },
      goodbye(6, "read a story under the moon"),
    ],
  },
  {
    number: 7,
    title: "All the Times",
    focus: "Reading with fluency and expression",
    rule: "Smooth reading: scoop words into phrases",
    book: "all-the-times",
    skills: ["fluency", "expression"],
    steps: [
      {
        id: "l7-sight", title: "Speedy Tricky Words", minutes: 6,
        goal: "Recognise sight words quickly.",
        say: "\"Let's see how speedy your eyes are!\"",
        tip: "Speed is a goal now — but accuracy first.",
        lemony: "Speedy eyes!",
        activity: { type: "sight-words", words: ["the", "said", "they", "was", "you", "come", "some", "were"] },
      },
      {
        id: "l7-story", title: "Read: All the Times", minutes: 18,
        goal: "Read a full story smoothly, using expression.",
        say: "\"This is a special story. I'll read a page like a robot — then like a storyteller. Which is better? Now you be the storyteller!\"",
        questions: ["How does Bear feel on this page?", "Which time was your favourite?"],
        tip: "Echo-read: you read a sentence, they read it back with the same expression.",
        lemony: "Read like a storyteller!",
        activity: { type: "story", book: "all-the-times", pages: [
          { scene: "🌙🐻🐶", text: "The moon was big and the night was still." },
          { scene: "🏕️🔥", text: "Do you remember the time we went camping? said Bear." },
          { scene: "⛵🎂", text: "And the time we had cake, and the time we set sail!" },
          { scene: "⭐💛", text: "All the times are the best times, said Pup, when they are with you." } ] },
      },
      goodbye(7, "show off everything you've learned"),
    ],
  },
  {
    number: 8,
    title: "I Am a Reader!",
    focus: "Review and celebrate independent reading",
    rule: "Put it all together",
    skills: ["review", "independent reading"],
    steps: [
      {
        id: "l8-review", title: "Sound Review", minutes: 8,
        goal: "Review the sounds from the whole journey.",
        say: "\"Wow, look how far you've come! Let's do a super-review of everything you know.\"",
        tip: "Note anything still shaky for the parent summary.",
        lemony: "Super review time!",
        activity: { type: "first-sound", items: [
          { emoji: "🚢", word: "ship", options: ["sh", "ch", "s"] }, { emoji: "🌳", word: "tree", options: ["tr", "t", "th"] },
          { emoji: "🧀", word: "cheese", options: ["sh", "ch", "c"] }, { emoji: "⭐", word: "star", options: ["s", "st", "sp"] } ] },
      },
      {
        id: "l8-read", title: "Read It Yourself", minutes: 15,
        goal: "Child reads independently; volunteer only helps when asked.",
        say: "\"Today YOU are the reader and I'm the listener. If you get stuck, try sounding it out first — I'm right here.\"",
        questions: ["Which word was the trickiest?", "How do you feel about reading now?"],
        tip: "Wait 5 seconds before helping. Praise effort and strategies, not just correct answers.",
        lemony: "You're the reader today!",
        activity: { type: "story", book: "dream-time", pages: [
          { scene: "🐋🌊", text: "The whale swims in the deep blue sea." },
          { scene: "🐟⭐", text: "She sees fish and shells and a starfish." },
          { scene: "🌙💤", text: "When the moon comes out, the whale has a dream." },
          { scene: "📚🏆", text: "I can read this book all by myself!" } ] },
      },
      {
        id: "l8-celebrate", title: "Reader Celebration", minutes: 6,
        goal: "Celebrate! The child is a reader.",
        say: "\"You did it! You are officially a Lemonful Reader! Let's celebrate!\"",
        questions: ["What do you want to read next?"],
        tip: "Tell the parent this is the final lesson — they'll see the Reader certificate in their dashboard.",
        lemony: "You are a Lemonful Reader!",
        activity: { type: "celebrate", message: "You are a Lemonful Reader! 🏆" },
      },
    ],
  },
];

export function getLesson(n: number): Lesson | undefined {
  return LESSONS.find((l) => l.number === n);
}

export const TOTAL_LESSONS = LESSONS.length;
