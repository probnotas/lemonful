/** Demo data so every screen has something to show. Run with `npm run db:seed`. */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { TRAINING, TRAINING_MINUTES } from "../src/lib/training";

const db = new PrismaClient();
const PASSWORD = "lemonful123";

async function main() {
  await db.$transaction([
    db.auditLog.deleteMany(), db.emailOutbox.deleteMany(), db.contactMessage.deleteMany(), db.hourEntry.deleteMany(),
    db.activityResult.deleteMany(), db.milestone.deleteMany(), db.lessonProgress.deleteMany(), db.tutoringSession.deleteMany(),
    db.child.deleteMany(), db.availability.deleteMany(), db.volunteerProfile.deleteMany(), db.user.deleteMany(),
  ]);
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const verified = new Date();
  const allModules = JSON.stringify(TRAINING.map((m) => m.id));
  const weekdayEvenings = [1, 2, 3, 4, 5].flatMap((day) => [16, 17, 18].map((hour) => ({ day, hour })));
  const saturdays = [10, 11].map((hour) => ({ day: 6, hour }));

  await db.user.create({ data: { email: "admin@lemonful.ca", passwordHash, role: "ADMIN", firstName: "Yvonne", lastName: "Lee", emailVerified: verified } });

  const taylor = await db.user.create({
    data: {
      email: "volunteer@example.com", passwordHash, role: "VOLUNTEER", firstName: "Taylor", lastName: "Nguyen", emailVerified: verified, city: "Toronto",
      volunteerProfile: { create: { school: "Northview Secondary", grade: 11, age: 16, status: "APPROVED", completedModules: allModules, agreedToCode: true, approvedAt: verified, guardianName: "Mai Nguyen", guardianEmail: "guardian@example.com", whyVolunteer: "My little brother struggled with reading and a tutor made all the difference." } },
      availability: { create: [...weekdayEvenings, ...saturdays] },
    },
  });
  await db.user.create({
    data: {
      email: "sam@example.com", passwordHash, role: "VOLUNTEER", firstName: "Sam", lastName: "Patel", emailVerified: verified,
      volunteerProfile: { create: { school: "Riverdale Collegiate", grade: 12, age: 17, status: "AWAITING_APPROVAL", completedModules: allModules, agreedToCode: true, guardianEmail: "patel.family@example.com" } },
      availability: { create: [{ day: 2, hour: 17 }, { day: 4, hour: 17 }, { day: 6, hour: 10 }] },
      hours: { create: { kind: "TRAINING", minutes: TRAINING_MINUTES, description: "Lemonful volunteer training (5 modules)" } },
    },
  });
  await db.user.create({
    data: {
      email: "jordan@example.com", passwordHash, role: "VOLUNTEER", firstName: "Jordan", lastName: "Smith", emailVerified: verified,
      volunteerProfile: { create: { school: "Northview Secondary", grade: 10, age: 15, status: "PENDING_TRAINING", completedModules: JSON.stringify(["welcome"]), agreedToCode: true, guardianEmail: "smith@example.com" } },
      availability: { create: [{ day: 1, hour: 16 }] },
    },
  });

  const parent = await db.user.create({
    data: {
      email: "parent@example.com", passwordHash, role: "PARENT", firstName: "Yvonne", lastName: "Lee", emailVerified: verified, country: "Canada", city: "Toronto", postalCode: "M5V 2T6",
      availability: { create: [{ day: 1, hour: 16 }, { day: 2, hour: 16 }, { day: 4, hour: 16 }, { day: 1, hour: 17 }, { day: 2, hour: 17 }, { day: 4, hour: 17 }, { day: 6, hour: 10 }, { day: 0, hour: 10 }] },
    },
  });
  const emma = await db.child.create({
    data: {
      parentId: parent.id, firstName: "Emma", age: 7, readingLevel: "SIMPLE_WORDS", notes: "Loves animals and drawing.", avatar: "bunny",
      volunteerId: taylor.id, matchedAt: verified, startLesson: 1, assessedAt: verified,
      assessment: JSON.stringify({ sounds: {}, blending: {}, sight: {}, sentence: "some", score: { sounds: 5, blend: 2, sight: 1 } }),
    },
  });
  await db.child.create({ data: { parentId: parent.id, firstName: "Leo", age: 5, readingLevel: "JUST_STARTING", notes: "Very energetic! Loves dinosaurs.", avatar: "lion" } });

  // A completed first lesson with notes and results…
  const lastWeek = new Date(Date.now() - 7 * 864e5); lastWeek.setHours(16, 0, 0, 0);
  const done = await db.tutoringSession.create({
    data: {
      childId: emma.id, volunteerId: taylor.id, lessonNumber: 1, scheduledAt: lastWeek, startedAt: lastWeek, endedAt: new Date(+lastWeek + 44 * 60_000), status: "COMPLETED",
      summaryForParent: "Emma was a superstar! She sorted 11 of 12 pictures into the right letter buckets and told me she'd be a bunny with super speed. Let's keep practising the /i/ sound — try 'I spy' with words like igloo and insect.",
      privateNotes: "Shy for the first 5 min, warmed up with the animal question. /i/ vs /e/ confusion.", childEngagement: 5, lessonCompleted: true, parentRating: 5, parentFeedback: "She hasn't stopped talking about Taylor!",
    },
  });
  await db.lessonProgress.create({ data: { childId: emma.id, lessonNumber: 1, completedAt: lastWeek } });
  await db.activityResult.createMany({ data: [
    { sessionId: done.id, childId: emma.id, activityId: "l1-welcome", correct: 0, total: 0, detail: JSON.stringify({ picks: { animal: "Bunny", power: "Super speed", feel: "It's okay" } }) },
    { sessionId: done.id, childId: emma.id, activityId: "l1-buckets", correct: 12, total: 13, detail: JSON.stringify({ letters: ["s", "a", "t", "p", "i", "n"] }) },
    { sessionId: done.id, childId: emma.id, activityId: "l1-first-sound", correct: 5, total: 6, detail: JSON.stringify({ sounds: ["tiger", "pasta", "snake", "nest", "alligator", "insect"] }) },
  ] });
  await db.milestone.createMany({ data: [{ childId: emma.id, key: "first-session", achievedAt: lastWeek }, { childId: emma.id, key: "satpin", achievedAt: lastWeek }] });
  await db.hourEntry.createMany({ data: [
    { userId: taylor.id, kind: "TRAINING", minutes: TRAINING_MINUTES, description: "Lemonful volunteer training (5 modules)", date: new Date(Date.now() - 14 * 864e5) },
    { userId: taylor.id, kind: "SESSION", minutes: 55, description: "Tutoring session — Lesson 1 + session notes", sessionId: done.id, date: lastWeek },
  ] });

  // …and one starting right now, so you can open the tutoring room immediately.
  const now = new Date(); now.setMinutes(0, 0, 0);
  await db.tutoringSession.create({ data: { childId: emma.id, volunteerId: taylor.id, lessonNumber: 2, scheduledAt: now } });

  await db.contactMessage.create({ data: { name: "Ms. Chen", email: "chen@school.example", topic: "school", message: "Hi! Our grade 11 students are looking for volunteer opportunities. Could we partner with Lemonful?" } });

  console.log(`\nSeeded. All demo accounts use the password "${PASSWORD}":
  Admin:      admin@lemonful.ca
  Parent:     parent@example.com   (Emma — matched, lesson live now; Leo — awaiting match)
  Volunteer:  volunteer@example.com (Taylor — approved)
  Volunteer:  sam@example.com       (awaiting approval)
  Volunteer:  jordan@example.com    (in training)\n`);
}

main().finally(() => db.$disconnect());
