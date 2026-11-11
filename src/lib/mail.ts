import "server-only";

/**
 * Sends one email through Brevo's transactional HTTP API (same BREVO_* variables as the Railers site).
 * Without BREVO_API_KEY / BREVO_SENDER_EMAIL it logs instead in dev, and throws in production.
 */
export function isMailConfigured() {
  return !!(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}

export async function sendMail({ to, subject, text, replyTo }: { to: string; subject: string; text: string; replyTo?: string }) {
  const key = process.env.BREVO_API_KEY, senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!key || !senderEmail) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured (BREVO_API_KEY / BREVO_SENDER_EMAIL)");
    console.log(`\n[mail:dev] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: senderEmail, name: process.env.BREVO_SENDER_NAME || "UMaT Essikado SRC" },
      to: [{ email: to }],
      subject,
      textContent: text,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Mail provider error ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
