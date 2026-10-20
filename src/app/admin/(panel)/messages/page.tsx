import { desc } from "drizzle-orm";
import { db } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { messages } from "@/db/schema";
import { markMessage, deleteMessage } from "@/features/admin/more-actions";
import DeleteButton from "@/features/admin/DeleteButton";

export default async function Page() {
  await requireAdmin("messages:write");
  const rows = await db.select().from(messages).orderBy(desc(messages.createdAt)).limit(100);
  return (<div className="max-w-3xl space-y-4"><h1 className="display text-4xl">Messages</h1>
    {rows.length === 0 ? <p className="rounded-xl bg-white p-10 text-center text-black/60">No messages yet.</p> : rows.map((m) => (
      <article key={m.id} className={`space-y-2 rounded-xl bg-white p-5 shadow-sm ${m.isRead ? "" : "border-l-4 border-gold"}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2"><p className="font-bold">{m.name} <span className="font-normal text-black/50">· <a className="underline" href={`mailto:${m.email}`}>{m.email}</a>{m.phone && ` · ${m.phone}`}</span></p>
          <p className="text-xs text-black/50">{m.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Accra" })}</p></div>
        {m.subject && <p className="font-semibold">{m.subject}</p>}<p className="whitespace-pre-line">{m.body}</p>
        <div className="flex gap-4 text-sm"><form action={markMessage.bind(null, m.id, !m.isRead)}><button className="text-emerald">{m.isRead ? "Mark unread" : "Mark read"}</button></form>
          <DeleteButton action={deleteMessage.bind(null, m.id)} /></div></article>))}</div>);
}
