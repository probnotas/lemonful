import { z } from "zod";

export const ROLES = ["PARENT", "VOLUNTEER", "ADMIN"] as const;
export const READING_LEVEL_KEYS = ["JUST_STARTING", "SOME_SOUNDS", "SIMPLE_WORDS", "SIMPLE_BOOKS", "NOT_SURE"] as const;

export const slotSchema = z.object({ day: z.number().int().min(0).max(6), hour: z.number().int().min(0).max(23) });

export const childSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(40),
  age: z.coerce.number().int().min(3, "Lemonful is for ages 3–10").max(12, "Lemonful is for ages 3–12"),
  readingLevel: z.enum(READING_LEVEL_KEYS),
  notes: z.string().max(1000).optional().default(""),
});

export const accountSchema = z.object({
  firstName: z.string().trim().min(1, "Required").max(50),
  lastName: z.string().trim().min(1, "Required").max(50),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters").max(200),
  country: z.string().max(60).optional(),
  city: z.string().max(80).optional(),
  postalCode: z.string().max(12).optional(),
});

export const parentSignupSchema = z.object({
  account: accountSchema,
  children: z.array(childSchema).min(1, "Add at least one child").max(6),
  availability: z.array(slotSchema).min(1, "Pick at least one time slot").max(80),
});

export const volunteerSignupSchema = z.object({
  account: accountSchema,
  profile: z.object({
    school: z.string().trim().min(2, "Required").max(120),
    grade: z.coerce.number().int().min(9, "Grades 9–12").max(12, "Grades 9–12"),
    age: z.coerce.number().int().min(14, "Volunteers must be 14 or older").max(20),
    whyVolunteer: z.string().max(1500).optional().default(""),
    guardianName: z.string().max(100).optional(),
    guardianEmail: z.string().email().optional().or(z.literal("")),
    agreedToCode: z.literal(true, { errorMap: () => ({ message: "Please agree to the code of conduct" }) }),
  }),
  availability: z.array(slotSchema).min(1, "Pick at least one time slot").max(80),
});
