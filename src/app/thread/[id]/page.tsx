import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardHeader } from "@/components/BoardHeader";
import { PostItem } from "@/components/PostItem";
import { ReplyForm } from "@/components/ReplyForm";
import { requireInvite } from "@/lib/auth";
import { getBoard } from "@/lib/board";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireInvite();
  const { id } = await params;
  const { error } = await searchParams;
  const data = await getBoard().getThreadWithPosts(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-6">
      <BoardHeader title={data.thread.title} />
      <p className="mt-2 text-xs">
        <Link href="/" className="text-[#0000cc] underline hover:text-red-700">
          スレッド一覧
        </Link>
        <span>{" ／ "}</span>
        <a href="#form" className="text-[#0000cc] underline hover:text-red-700">
          書き込みフォームへ
        </a>
      </p>
      <section className="mt-3 border border-gray-400 bg-[#f7f9fc] px-3 py-2 sm:px-4">
        {data.posts.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </section>
      <section className="mt-6" id="form">
        <ReplyForm threadId={data.thread.id} error={error} />
      </section>
    </div>
  );
}
