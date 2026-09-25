import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/AppNav";
import { PostItem } from "@/components/PostItem";
import { ReplyForm } from "@/components/ReplyForm";
import { getPosterSeed, requireInvite } from "@/lib/auth";
import { getBoard } from "@/lib/board";
import { stableAuthorKey } from "@/lib/poster-id";

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

  const seed = await getPosterSeed();
  const authorKey = seed ? stableAuthorKey(seed) : "";

  return (
    <PageShell>
      <p className="mb-4 text-sm">
        <Link href="/" className="font-medium text-sky-600 hover:text-sky-700">
          ← スレッド一覧
        </Link>
        <span className="mx-2 text-slate-300">·</span>
        <a href="#form" className="font-medium text-sky-600 hover:text-sky-700">
          返信フォームへ
        </a>
      </p>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">{data.thread.title}</h1>
      <section className="space-y-4">
        {data.posts.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            own={Boolean(authorKey && post.authorKey === authorKey)}
          />
        ))}
      </section>
      <section className="mt-10" id="form">
        <ReplyForm threadId={data.thread.id} error={error} />
      </section>
    </PageShell>
  );
}
