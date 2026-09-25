export type MediaType = "image" | "video";

export const MAX_MEDIA_CHARS = 7_000_000;

export function parseMedia(
  mediaUrl: string,
  mediaType: string,
): { mediaUrl: string; mediaType: MediaType } | null {
  const url = mediaUrl.trim();
  const type = mediaType.trim();
  if (!url) return null;
  if (type !== "image" && type !== "video") return null;
  if (type === "image" && !url.startsWith("data:image/")) return null;
  if (type === "video" && !url.startsWith("data:video/")) return null;
  if (url.length > MAX_MEDIA_CHARS) return null;
  return { mediaUrl: url, mediaType: type };
}
