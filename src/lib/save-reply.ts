import { getOrCreatePosterSeed, getUserName } from "@/lib/auth";
import { getBoard } from "@/lib/board";
import { displayName } from "@/lib/format";
import { parseMedia } from "@/lib/media";
import { fileToDataUrl, uploadMediaFile } from "@/lib/media-storage";
import { dailyPosterId, stableAuthorKey } from "@/lib/poster-id";
import { stripLeadingReplyMarker } from "@/lib/reply-marker";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { Post } from "@/lib/types";

export async function saveReply(input: {
  threadId: string;
  body: string;
  replyTo?: number;
  mediaUrl?: string;
  mediaType?: string;
  mediaFile?: File | null;
}): Promise<{ post: Post | null; error?: "empty" | "too_long" | "media" }> {
  const body = stripLeadingReplyMarker(input.body.trim());
  const name = displayName(await getUserName());
  let media = parseMedia(input.mediaUrl ?? "", input.mediaType ?? "");

  if (input.mediaFile && input.mediaFile.size > 0) {
    try {
      media = isSupabaseConfigured()
        ? await uploadMediaFile(input.mediaFile)
        : await fileToDataUrl(input.mediaFile);
    } catch (error) {
      console.error(error);
      return { post: null, error: "media" };
    }
  }

  if (input.mediaUrl && !media && !(input.mediaFile && input.mediaFile.size > 0)) {
    return { post: null, error: "media" };
  }

  if (!body && !media) {
    return { post: null, error: "empty" };
  }

  if (body.length > 4000 || name.length > 20) {
    return { post: null, error: "too_long" };
  }

  const seed = await getOrCreatePosterSeed();
  const post = await getBoard().addPost({
    threadId: input.threadId,
    name,
    body,
    posterId: dailyPosterId(seed),
    authorKey: stableAuthorKey(seed),
    replyTo: input.replyTo,
    mediaUrl: media?.mediaUrl,
    mediaType: media?.mediaType,
  });

  return { post };
}
