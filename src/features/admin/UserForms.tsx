"use client";
import { useActionState } from "react";
import { createUser, updateUser, changeOwnPassword } from "./user-actions";

const cls = "w-full rounded-lg border border-black/15 bg-white px-3 py-2";
const Msg = ({ s }: { s?: { error?: string; ok?: string } }) => s?.error ? <p role="alert" className="text-sm text-red-600">{s.error}</p> : s?.ok ? <p role="status" className="text-sm font-semibold text-emerald">{s.ok}</p> : null;
type Role = { id: string; name: string };

export function CreateUserForm({ roles }: { roles: Role[] }) {
  const [s, action, pending] = useActionState(createUser, undefined);
  return (
    <form action={action} className="space-y-3 rounded-xl bg-white p-5 shadow-sm">
      <h2 className="font-bold">Add admin user</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" required placeholder="Full name" className={cls} />
        <input name="email" type="email" required placeholder="Email" className={cls} />
        <select name="roleId" required defaultValue="" className={cls}><option value="" disabled>Role…</option>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <input name="password" type="text" required minLength={12} autoComplete="off" placeholder="Temporary password (12+ chars)" className={cls} />
      </div>
      <Msg s={s} />
      <button disabled={pending} className="rounded-lg bg-emerald px-4 py-2 font-semibold text-white disabled:opacity-60">{pending ? "Creating…" : "Create user"}</button>
      <p className="text-xs text-black/50">Share the temporary password privately; they can change it under My account.</p>
    </form>
  );
}

export function EditUserForm({ id, roles, user, isSelf }: { id: string; roles: Role[]; user: { name: string; email: string; roleId: string; isActive: boolean }; isSelf: boolean }) {
  const [s, action, pending] = useActionState(updateUser.bind(null, id), undefined);
  return (
    <form action={action} className="max-w-xl space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm text-black/60">{user.email}</p>
      <label className="block space-y-1 text-sm font-medium">Name<input name="name" defaultValue={user.name} required className={cls} /></label>
      <label className="block space-y-1 text-sm font-medium">Role<select name="roleId" defaultValue={user.roleId} className={cls}>{roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
      <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" name="isActive" defaultChecked={user.isActive} disabled={isSelf} />Active (can sign in){isSelf && " · you can't deactivate yourself"}</label>
      {isSelf && user.isActive && <input type="hidden" name="isActive" value="on" />}
      <label className="block space-y-1 text-sm font-medium">Reset password (leave blank to keep)<input name="newPassword" type="text" autoComplete="off" placeholder="New password (12+ chars)" className={cls} /></label>
      <Msg s={s} />
      <button disabled={pending} className="rounded-lg bg-emerald px-5 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Saving…" : "Save"}</button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [s, action, pending] = useActionState(changeOwnPassword, undefined);
  return (
    <form action={action} className="max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm">
      <input name="current" type="password" required autoComplete="current-password" placeholder="Current password" className={cls} />
      <input name="next" type="password" required minLength={12} autoComplete="new-password" placeholder="New password (12+ chars)" className={cls} />
      <input name="confirm" type="password" required autoComplete="new-password" placeholder="Confirm new password" className={cls} />
      <Msg s={s} />
      <button disabled={pending} className="rounded-lg bg-emerald px-5 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Updating…" : "Change password"}</button>
    </form>
  );
}
