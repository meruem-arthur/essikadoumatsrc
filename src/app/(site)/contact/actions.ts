"use server";
import { z } from "zod";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { sendMail } from "@/lib/mail";
import { clientIp, isLimited, record } from "@/lib/ratelimit";
import { getSettings } from "@/lib/queries";

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
  try {
    const ip = await clientIp();
    if (await isLimited("contact", ip, 3, 3600)) return { error: "You've sent several messages recently. Please try again later." };
    await db.insert(messages).values(p.data);
    await record("contact", ip);
  } catch { return { error: "Could not send right now. Please try again later." }; }
  // Email the SRC inbox. Failure here must never lose the message (it is already saved in the admin).
  try {
    const st = await getSettings();
    const to = st.email || process.env.CONTACT_NOTIFY_EMAIL;
    if (to) await sendMail({ to, replyTo: p.data.email, subject: `Website message: ${p.data.subject || p.data.name}`,
      text: `From: ${p.data.name} <${p.data.email}>${p.data.phone ? `\nPhone: ${p.data.phone}` : ""}\n\n${p.data.body}\n\n(Also saved in Admin → Messages.)` });
  } catch (e) { console.error("[contact mail]", (e as Error).message); }
  return { ok: true };
}
