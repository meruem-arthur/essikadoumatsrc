/** Accepts watch?v=, youtu.be/, /embed/, /shorts/, /live/ links (or a bare 11-char id). Returns the video id or null. */
export function youtubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") id = u.searchParams.get("v") ?? u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{11})/)?.[1] ?? null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch { return null; }
}
