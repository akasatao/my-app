import { detectMediaType, type MediaType } from "./media";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export const MEDIA_BUCKET = "media";

let bucketReady: Promise<void> | null = null;

export async function ensureMediaBucket() {
  if (!isSupabaseConfigured()) return;
  if (!bucketReady) {
    bucketReady = createMediaBucket().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }
  await bucketReady;
}

async function createMediaBucket() {
  const supabase = getSupabaseAdmin();
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.warn("media バケットの確認に失敗しました", listError.message);
  }

  const exists = buckets?.some((bucket) => bucket.id === MEDIA_BUCKET || bucket.name === MEDIA_BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: "15728640",
    });
    if (error && !/already exists|duplicate/i.test(error.message)) {
      console.warn("media バケットの作成に失敗しました", error.message);
    }
  }

  await supabase.storage.updateBucket(MEDIA_BUCKET, { public: true }).catch(() => undefined);
}

function safeFileName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "file";
}

export async function uploadMediaFile(file: File) {
  const type = detectMediaType(file);
  if (!type) {
    throw new Error("対応していないファイル形式です");
  }

  await ensureMediaBucket();
  const supabase = getSupabaseAdmin();
  const path = `${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { mediaUrl: data.publicUrl, mediaType: type as MediaType };
}

export async function fileToDataUrl(file: File) {
  const type = detectMediaType(file);
  if (!type) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || `${type}/octet-stream`;
  return {
    mediaUrl: `data:${mime};base64,${buffer.toString("base64")}`,
    mediaType: type,
  };
}
