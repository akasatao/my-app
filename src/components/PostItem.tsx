import { PostBody } from "@/components/PostBody";
import { formatBoardDate } from "@/lib/format";
import type { Post } from "@/lib/types";

export function PostItem({ post }: { post: Post }) {
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
      </header>
      <PostBody body={post.body} />
    </article>
  );
}
