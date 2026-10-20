import { requireAdmin } from "@/lib/auth";
import { ChangePasswordForm } from "@/features/admin/UserForms";

export default async function Page() {
  const s = await requireAdmin();
  return (<div className="space-y-4"><h1 className="display text-4xl">My account</h1>
    <p className="text-black/60">{s.name} · {s.email} · {s.role}</p><ChangePasswordForm /></div>);
}
