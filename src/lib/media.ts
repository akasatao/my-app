export type MediaType = "image" | "video" | "audio";

export const MAX_MEDIA_CHARS = 7_000_000;
const MEDIA_TYPES = new Set<MediaType>(["image", "video", "audio"]);

export function detectMediaType(file: { type?: string; name?: string }): MediaType | null {
  const mime = (file.type ?? "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";

  const name = (file.name ?? "").toLowerCase();
  if (/\.(png|jpe?g|gif|webp|avif|bmp|svg)$/.test(name)) return "image";
  if (/\.(mp4|webm|mov|m4v)$/.test(name)) return "video";
  if (/\.(mp3|m4a|wav|ogg|aac|flac|weba)$/.test(name)) return "audio";
  if (name.endsWith(".m4a")) return "audio";
  return null;
}

export function parseMedia(
  mediaUrl: string,
  mediaType: string,
): { mediaUrl: string; mediaType: MediaType } | null {
  const url = mediaUrl.trim();
  const type = mediaType.trim() as MediaType;
  if (!url || !MEDIA_TYPES.has(type)) return null;

  const isHttp = url.startsWith("https://") || url.startsWith("http://");
  const isData = url.startsWith(`data:${type}/`) || url.startsWith("data:audio/") || url.startsWith("data:image/") || url.startsWith("data:video/");
  if (!isHttp && !isData) return null;
  if (!isHttp && url.length > MAX_MEDIA_CHARS) return null;
  return { mediaUrl: url, mediaType: type };
}
