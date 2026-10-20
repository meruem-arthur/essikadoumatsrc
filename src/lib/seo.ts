export type SlugP = { params: Promise<{ slug: string }> };
export const meta = (title: string, description?: string | null, img?: { url: string } | null) => ({
  title,
  description: description?.slice(0, 160) ?? undefined,
  openGraph: { title, description: description?.slice(0, 160) ?? undefined, images: img ? [img.url] : undefined },
  twitter: { card: "summary_large_image" as const, images: img ? [img.url] : undefined },
});
