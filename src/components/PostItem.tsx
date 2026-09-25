import { Avatar } from "@/components/Avatar";
import { PostActions } from "@/components/PostActions";
import { PostBody } from "@/components/PostBody";
import { PostCardMenu } from "@/components/PostCardMenu";
import { QuotePreview } from "@/components/QuotePreview";
import { PostMedia } from "@/components/PostMedia";
import { cardClass } from "@/components/ui";
import { formatBoardDate } from "@/lib/format";
import { resolveReplyTo, stripLeadingReplyMarker } from "@/lib/reply-marker";
import type { Post } from "@/lib/types";

export function PostItem({
  post,
  own,
  parent,
}: {
  post: Post;
  own: boolean;
  parent?: Post | null;
}) {
  const deleted = Boolean(post.deletedAt);
  const quoted = parent ?? null;
  const displayBody = stripLeadingReplyMarker(
    post.body,
    resolveReplyTo(post) ?? undefined,
  );

  return (
    <PostCardMenu
      target={{
        resNumber: post.resNumber,
        name: post.name,
        body: deleted ? "" : displayBody,
      }}
    >
      <article id={String(post.resNumber)} className={`scroll-mt-24 p-4 ${cardClass}`}>
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={post.name} seed={post.posterId} />
            <div>
              <p className="font-semibold text-slate-950">{post.name}</p>
              <p className="text-sm text-slate-500">
                <time dateTime={post.createdAt}>{formatBoardDate(post.createdAt)}</time>
                {post.editedAt && !deleted ? <span> · 編集済み</span> : null}
              </p>
            </div>
          </div>
        </header>
        <div className="mt-3">
          {deleted ? (
            <p className="text-slate-500 italic">この投稿は削除されました</p>
          ) : (
            <>
              {quoted ? (
                <QuotePreview
                  name={quoted.name}
                  body={
                    quoted.deletedAt
                      ? "削除された投稿"
                      : stripLeadingReplyMarker(quoted.body)
                  }
                  href={`#${quoted.resNumber}`}
                  replyLabel
                />
              ) : null}
              {displayBody.trim() ? <PostBody body={displayBody} /> : null}
              {post.mediaUrl && post.mediaType ? (
                <PostMedia url={post.mediaUrl} type={post.mediaType} />
              ) : null}
            </>
          )}
        </div>
        {own && !deleted ? (
          <PostActions
            threadId={post.threadId}
            postId={post.id}
            name={post.name}
            body={displayBody}
          />
        ) : null}
      </article>
    </PostCardMenu>
  );
}
