"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addImages } from "./more-actions";
import { OK_TYPES } from "./ImageField";

/** Multi-photo upload for albums: each file is signed + sent to Cloudinary, then all references are saved in one action. */
export default function GalleryUploader({ albumId }: { albumId: string }) {
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const router = useRouter();
  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []); if (!files.length) return;
    setBusy(true); const ok: { publicId: string; url: string; width?: number; height?: number }[] = []; let failed = 0;
    for (const [i, f] of files.entries()) {
      setMsg(`Uploading ${i + 1} of ${files.length}…`);
      if (!OK_TYPES.includes(f.type) || f.size > 10 * 1024 * 1024) { failed++; continue; }
      try {
        const sig = await (await fetch("/api/admin/upload-sign?folder=gallery")).json();
        const fd = new FormData(); fd.append("file", f); fd.append("api_key", sig.apiKey); fd.append("timestamp", sig.timestamp); fd.append("signature", sig.signature); fd.append("folder", sig.folder);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: "POST", body: fd }); const j = await r.json();
        if (!r.ok) throw 0; ok.push({ publicId: j.public_id, url: j.secure_url, width: j.width, height: j.height });
      } catch { failed++; }
    }
    try { if (ok.length) await addImages(albumId, ok); } catch { failed += ok.length; }
    setMsg(`${ok.length} uploaded${failed ? `, ${failed} failed (JPG/PNG/WebP/AVIF under 10MB only)` : ""}.`); setBusy(false); router.refresh();
  }
  return (<div className="space-y-2 rounded-xl bg-white p-5 shadow-sm"><input type="file" accept="image/*" multiple onChange={onPick} disabled={busy} />{msg && <p className="text-sm" role="status">{msg}</p>}</div>);
}
