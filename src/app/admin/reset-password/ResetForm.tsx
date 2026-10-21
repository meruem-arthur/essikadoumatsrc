"use client";
import { useActionState } from "react";
import { resetPassword } from "../login/reset-actions";

export default function ResetForm({ token }: { token: string }) {
  const [s, action, pending] = useActionState(resetPassword.bind(null, token), undefined);
  return (
    <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl bg-chalk p-8 shadow-2xl">
      <h1 className="display text-center text-4xl">New password</h1>
      <input name="next" type="password" required minLength={12} autoComplete="new-password" placeholder="New password (12+ chars)" className="w-full rounded-lg border border-black/15 px-3 py-2.5" />
      <input name="confirm" type="password" required autoComplete="new-password" placeholder="Confirm new password" className="w-full rounded-lg border border-black/15 px-3 py-2.5" />
      {s?.error && <p role="alert" className="text-sm text-red-600">{s.error}</p>}
      <button disabled={pending} className="w-full rounded-lg bg-emerald py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Set password"}</button>
    </form>
  );
}
