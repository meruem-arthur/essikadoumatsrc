"use client";
import Link from "next/link";
import { useActionState } from "react";
import { requestReset } from "../login/reset-actions";

export default function ForgotPassword() {
  const [s, action, pending] = useActionState(requestReset, undefined);
  return (
    <main className="grid min-h-screen place-items-center bg-forest p-4">
      <form action={action} className="w-full max-w-sm space-y-4 rounded-2xl bg-chalk p-8 shadow-2xl">
        <h1 className="display text-center text-4xl">Forgot password</h1>
        <p className="text-sm text-black/60">Enter your admin email and we'll send you a link to set a new password.</p>
        <input name="email" type="email" required autoComplete="username" placeholder="Email" className="w-full rounded-lg border border-black/15 px-3 py-2.5" />
        {s?.error && <p role="alert" className="text-sm text-red-600">{s.error}</p>}
        {s?.ok && <p role="status" className="rounded-lg bg-emerald/10 px-3 py-2 text-sm font-semibold text-emerald">{s.ok}</p>}
        <button disabled={pending} className="w-full rounded-lg bg-emerald py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Sending…" : "Send reset link"}</button>
        <Link href="/admin/login" className="block text-center text-sm text-emerald underline">Back to sign in</Link>
      </form>
    </main>
  );
}
