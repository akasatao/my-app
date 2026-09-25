import { Avatar } from "@/components/Avatar";
import { PostActions } from "@/components/PostActions";
import { PostBody } from "@/components/PostBody";
import { cardClass } from "@/components/ui";
import { formatBoardDate } from "@/lib/format";
import type { Post } from "@/lib/types";

export function PostItem({ post, own }: { post: Post; own: boolean }) {
  const deleted = Boolean(post.deletedAt);

  return (
    <article id={String(post.resNumber)} className={`scroll-mt-24 p-5 ${cardClass}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={post.name} seed={post.posterId} />
          <div>
            <p className="font-semibold text-slate-950">{post.name}</p>
            <p className="text-sm text-slate-500">
              <a href={`#${post.resNumber}`} className="text-sky-600 hover:text-sky-700">
                #{post.resNumber}
              </a>
              <span> · </span>
              <time dateTime={post.createdAt}>{formatBoardDate(post.createdAt)}</time>
              <span> · ID {post.posterId}</span>
              {post.editedAt && !deleted ? <span> · 編集済み</span> : null}
            </p>
          </div>
        </div>
      </header>
      <div className="mt-4">
        {deleted ? (
          <p className="text-slate-500 italic">この投稿は削除されました</p>
        ) : (
          <PostBody body={post.body} />
        )}
      </div>
      {own && !deleted ? (
        <PostActions
          threadId={post.threadId}
          postId={post.id}
          name={post.name}
          body={post.body}
        />
      ) : null}
    </article>
  );
}
