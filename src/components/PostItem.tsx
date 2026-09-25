import { PostActions } from "@/components/PostActions";
import { PostBody } from "@/components/PostBody";
import { formatBoardDate } from "@/lib/format";
import type { Post } from "@/lib/types";

export function PostItem({ post, own }: { post: Post; own: boolean }) {
  const deleted = Boolean(post.deletedAt);

  return (
    <article
      id={String(post.resNumber)}
      className="scroll-mt-3 border-b border-dotted border-gray-400 py-2"
    >
      <header className="flex flex-wrap items-baseline gap-x-1 text-sm">
        <a href={`#${post.resNumber}`} className="font-bold text-black hover:text-red-700">
          {post.resNumber}
        </a>
        <span>：</span>
        <span className="font-bold text-[#008000]">{post.name}</span>
        <span>：</span>
        <time dateTime={post.createdAt}>{formatBoardDate(post.createdAt)}</time>
        <span className="text-[#555]"> ID:{post.posterId}</span>
        {post.editedAt && !deleted ? (
          <span className="text-xs text-gray-600"> 編集済</span>
        ) : null}
      </header>
      {deleted ? (
        <p className="mt-1 text-[15px] text-gray-500">削除されました</p>
      ) : (
        <PostBody body={post.body} />
      )}
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
