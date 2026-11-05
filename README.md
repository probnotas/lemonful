# 🍋 Lemonful

Free, one-on-one online reading lessons for children, taught by trained high-school volunteers.

This repo is the complete platform: the public website, parent and volunteer accounts, the onboarding and training flows, the live tutoring room (video plus synchronized interactive lessons), progress tracking, automatic tracking of community-service hours, and an admin console.

## Quick start

```bash
npm install
cp .env.example .env        # then set AUTH_SECRET to a long random string
npm run setup               # generate Prisma client, create the SQLite DB, load demo data
npm run dev                 # http://localhost:3000
```

All demo accounts use the password **`lemonful123`**:

| Role | Email | What you'll see |
|---|---|---|
| Admin | `admin@lemonful.ca` | Approvals, matching, inbox, email outbox, audit log |
| Parent | `parent@example.com` | Emma (matched, with a lesson open now) and Leo (waiting for a match) |
| Volunteer | `volunteer@example.com` | Taylor: approved, with one student, hours and achievements |
| Volunteer | `sam@example.com` | Training finished, waiting for approval |
| Volunteer | `jordan@example.com` | Still in training |

**Try a live lesson:** log in as the volunteer in one browser and as the parent in another browser or an incognito window. The volunteer clicks **Start lesson** and the parent clicks **Join lesson**. You get video in both directions and the activities stay in sync. When the volunteer clicks **End Session**, they write notes, the parent sees the summary, and the hours are logged.

In development, emails are not actually sent. They are printed to the console and saved in **Admin → Inbox → Email outbox**. The "check your email" page shows a link that verifies the account instantly.

## What's included

**Parents:** a 4-step sign-up (account → children → availability → review), email verification, a 5-minute reading check that decides which lesson the child starts on, a dashboard, a page per child showing the 8-lesson journey, milestones, skills practised and tutor notes, booking from the times both the family and the volunteer are free, cancelling, session history with star-rated feedback, parent resources (tips, letter-sound guide, books, camera/mic check), editing availability and account details, and deleting a child or the whole account.

**Volunteers:** an application with a code of conduct (a parent/guardian email is required for under-18s), 5 training modules with quizzes (they count as 2 hours), admin approval, a dashboard (next session, students, impact tracker, achievements), student profiles (parent notes, answers from the first-session chat, words to practise), a lesson library with full scripts and a **practice mode**, a schedule and availability page, post-session notes (a summary emailed to the parent, private notes, engagement, marking the lesson complete, reporting a safeguarding concern), and a community-hours log with a **printable certificate**.

**Tutoring room** (`/session/[id]`), built to match the mockups:
- Volunteer screen: lesson guide (goal / what to say / questions / tip), the shared activity, the child's video large with a small self-view, and controls (mute, camera, end session).
- Child screen: the tutor's video large with a small self-view, and the shared activity with the Lemony mascot.
- 7 activity types: All About Me, Letter Buckets (tap or drag), Sound Detective, Blend It, Word Builder, Tricky Words, and Story reader with words highlighted on both screens. There's also a Celebrate step with confetti.
- The volunteer's mouse pointer appears on the child's screen, and the child's appears on the volunteer's. Pictures and words are read aloud with the browser's text-to-speech.

**Admin:** program stats, volunteer approval and pausing, manual hour adjustments, matching (volunteers are ranked by how much availability they share with the family and how many students they already have), contact messages, the email outbox, and the audit log.

## Architecture

```
Next.js 15 (App Router, React 19, server actions) ─┐
Socket.IO realtime layer (server.ts)  ─────────────┼── one Node process
Prisma ORM → SQLite (dev) / Postgres (prod)  ──────┘
WebRTC peer-to-peer video (signalling relayed by Socket.IO)
```

| Piece | Where |
|---|---|
| Data model | `prisma/schema.prisma` |
| Curriculum (8 lessons, scripts, activities, books) | `src/lib/curriculum.ts` |
| Synchronized lesson state (shared reducer) | `src/lib/room-state.ts` |
| Realtime server: room access checks, authoritative state, signalling | `server.ts` |
| Video call | `src/components/room/useVideoCall.ts` |
| Activities UI | `src/components/room/Activities.tsx` |
| Auth (bcrypt + signed httpOnly JWT cookie) and route guards | `src/lib/auth.ts`, `src/lib/session-token.ts`, `src/middleware.ts` |
| Volunteer training content | `src/lib/training.ts` |
| Milestones and achievements | `src/lib/milestones.ts`, `src/lib/progress.ts` |

**How sync works:** each screen sends small *actions* (for example "drop sun into bucket S"). The server applies them with the same pure reducer the browsers use and sends the new state to both screens. The server checks who sent each action: only the volunteer can change steps or turn pages. Activity scores are taken from the server's copy of the state when the session ends.

## Child safety and privacy

- Children have **no accounts**. They join from their parent's login, and the only data stored about a child is a first name, age, reading level and progress.
- A user can join a session only if they are its assigned volunteer or the child's parent. This is checked on the server for every page, server action and socket connection.
- Video goes directly between the two browsers and is **never recorded**.
- Every view or change of a child's data is written to the audit log. Volunteers can report safeguarding concerns, which go straight to the admins.
- Parents can delete everything: deleting the account removes all of its data.
- Passwords are hashed with bcrypt. Logins are rate-limited. Security headers are set in `next.config.mjs`.

Have the privacy summary at `/privacy` reviewed by a lawyer (PIPEDA / provincial law, and COPPA if you serve US families) before launch.

## Going to production

1. **Database:** set `provider = "postgresql"` in `prisma/schema.prisma` and point `DATABASE_URL` at a managed Postgres (Neon, Supabase, RDS). Then run `npx prisma db push`, or move to `prisma migrate`.
2. **Hosting:** the realtime layer needs a long-running Node server, so it won't run on Vercel's serverless functions. Use Render, Railway, Fly.io or a container service. Run `npm run build`, then `npm start`.
3. **Email:** set `RESEND_API_KEY` and `EMAIL_FROM` and verify the sending domain.
4. **Video reliability:** peer-to-peer video fails on some school and corporate networks. Add a TURN server through `NEXT_PUBLIC_ICE_SERVERS`, for example `[{"urls":"turn:turn.example.com:3478","username":"…","credential":"…"}]`. You can also replace `useVideoCall.ts` with a managed service (LiveKit, Daily, Twilio); nothing else in the room needs to change.
5. **Scaling past one server:** move the in-memory room state and the login rate limiter to Redis, and use the Socket.IO Redis adapter.
6. **Timezone:** availability and session times use the program timezone (`TZ`, default `America/Toronto`). If families will be spread across timezones, store a timezone for each user.

## Content notes for Yvonne

- The **story text** in `src/lib/curriculum.ts` is placeholder text written to match each book's reading rule. Replace it with the real pages of your books; each page only needs `text` and `scene`.
- The illustrations in `public/art/` were cropped from the design mockups. Replace them with the original high-resolution artwork.
- Lesson scripts, training modules and milestones are plain data files, so you can edit them without touching any UI code.
