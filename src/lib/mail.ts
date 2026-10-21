import "server-only";

/** Sends one email through Resend's HTTP API. Without RESEND_API_KEY it logs instead (handy in local dev). */
export async function sendMail({ to, subject, text, replyTo }: { to: string; subject: string; text: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY, from = process.env.MAIL_FROM;
  if (!key || !from) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured (RESEND_API_KEY / MAIL_FROM)");
    console.log(`\n[mail:dev] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  if (!res.ok) throw new Error(`Mail provider error ${res.status}`);
}
