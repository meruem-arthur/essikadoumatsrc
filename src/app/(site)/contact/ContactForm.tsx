"use client";
import { useActionState } from "react";
import { sendMessage } from "./actions";
const cls = "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5";
export default function ContactForm() {
  const [s, action, pending] = useActionState(sendMessage, undefined);
  if (s?.ok) return <p role="status" className="rounded-xl bg-emerald/10 p-6 font-semibold text-emerald">Thank you. Your message has been sent to the SRC.</p>;
  return (
    <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-4 sm:grid-cols-2"><input name="name" required placeholder="Your name" className={cls} /><input name="email" type="email" required placeholder="Email" className={cls} /></div>
      <div className="grid gap-4 sm:grid-cols-2"><input name="phone" placeholder="Phone (optional)" className={cls} /><input name="subject" placeholder="Subject" className={cls} /></div>
      <textarea name="body" required rows={6} placeholder="How can we help?" className={cls} />
      {s?.error && <p role="alert" className="text-sm text-red-600">{s.error}</p>}
      <button disabled={pending} className="rounded-sm bg-emerald px-6 py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60">{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
