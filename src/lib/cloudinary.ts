import "server-only";
import { createHash } from "node:crypto";

export const ALLOWED_FOLDERS = ["hero", "executives", "committees", "news", "projects", "events", "gallery", "pillars", "pages", "site"];

/** Server signs; the browser uploads straight to Cloudinary (avoids Vercel's 4.5MB body limit). The secret never leaves the server. */
export function signUpload(folder: string) {
  if (!ALLOWED_FOLDERS.includes(folder)) throw new Error("Invalid folder");
  const timestamp = Math.floor(Date.now() / 1000);
  const toSign = `folder=umat-src/${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(toSign + process.env.CLOUDINARY_API_SECRET!).digest("hex");
  return {
    timestamp, signature, folder: `umat-src/${folder}`,
    apiKey: process.env.CLOUDINARY_API_KEY!, cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  };
}
export const cloudinaryPrefix = () => `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`;

/** Best-effort removal of an uploaded image. Only touches our own folder; never throws (a leftover file is harmless). */
export async function destroyImage(publicId?: string | null) {
  try {
    if (!publicId || !publicId.startsWith("umat-src/")) return;
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHash("sha1").update(`public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET!}`).digest("hex");
    const body = new URLSearchParams({ public_id: publicId, timestamp: String(timestamp), api_key: process.env.CLOUDINARY_API_KEY!, signature });
    await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`, { method: "POST", body });
  } catch (e) { console.error("[cloudinary destroy]", (e as Error).message); }
}
