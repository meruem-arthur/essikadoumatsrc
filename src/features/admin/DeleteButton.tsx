"use client";
export default function DeleteButton({ action, label = "Delete" }: { action: () => Promise<void>; label?: string }) {
  return (<form action={action} onSubmit={(e) => { if (!confirm("Delete this permanently? This cannot be undone.")) e.preventDefault(); }}>
    <button className="text-red-600">{label}</button></form>);
}
