"use server";
import { z } from "zod";
import { db } from "@/db";
import { messages } from "@/db/schema";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().max(150).optional(),
  body: z.string().trim().min(10, "Message is too short").max(5000),
});

export async function sendMessage(_: { error?: string; ok?: boolean } | undefined, fd: FormData) {
  if (fd.get("website")) return { ok: true }; // honeypot: bots fill hidden fields
  const p = schema.safeParse({ name: fd.get("name"), email: fd.get("email"), phone: fd.get("phone") || undefined, subject: fd.get("subject") || undefined, body: fd.get("body") });
  if (!p.success) return { error: p.error.issues[0].message };
  try { await db.insert(messages).values(p.data); } catch { return { error: "Could not send right now. Please try again later." }; }
  return { ok: true };
}
