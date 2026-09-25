import { getOrCreatePosterSeed, getUserName } from "@/lib/auth";
import { getBoard } from "@/lib/board";
import { displayName } from "@/lib/format";
import { parseMedia } from "@/lib/media";
import { dailyPosterId, stableAuthorKey } from "@/lib/poster-id";
import { stripLeadingReplyMarker } from "@/lib/reply-marker";
import type { Post } from "@/lib/types";

export async function saveReply(input: {
  threadId: string;
  body: string;
  replyTo?: number;
  mediaUrl?: string;
  mediaType?: string;
}): Promise<{ post: Post | null; error?: "empty" | "too_long" | "media" }> {
  const body = stripLeadingReplyMarker(input.body.trim());
  const name = displayName(await getUserName());
  const media = parseMedia(input.mediaUrl ?? "", input.mediaType ?? "");

  if (input.mediaUrl && !media) {
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
