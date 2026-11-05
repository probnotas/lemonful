"use server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  topic: z.enum(["parent", "volunteer", "school", "other"]),
  message: z.string().trim().min(5).max(4000),
});

export async function sendContact(_: unknown, form: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { ok: false, error: "Please fill in every field with a valid email." };
  await db.contactMessage.create({ data: parsed.data });
  return { ok: true, error: "" };
}
