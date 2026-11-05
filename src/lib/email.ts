import "server-only";
import { db } from "./db";

/**
 * Sends an email. Every message is recorded in the EmailOutbox table (visible to admins).
 * With RESEND_API_KEY set it is delivered via Resend; otherwise it is logged to the console.
 */
export async function sendEmail(to: string, subject: string, body: string) {
  let delivered = false;
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "Lemonful <hello@lemonful.ca>", to, subject, text: body }),
      });
      delivered = res.ok;
    } catch (e) {
      console.error("[email] delivery failed", e);
    }
  } else {
    console.log(`\n[email] To: ${to}\nSubject: ${subject}\n${body}\n`);
  }
  await db.emailOutbox.create({ data: { to, subject, body, delivered } });
}

export function appUrl(path = "") {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "") + path;
}
