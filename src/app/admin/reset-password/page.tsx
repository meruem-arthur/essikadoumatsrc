import Link from "next/link";
import ResetForm from "./ResetForm";
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (<main className="grid min-h-screen place-items-center bg-forest p-4">
    {token ? <ResetForm token={token} /> : <div className="space-y-3 rounded-2xl bg-chalk p-8 text-center"><p>This reset link is incomplete.</p><Link href="/admin/forgot-password" className="text-emerald underline">Request a new link</Link></div>}</main>);
}
