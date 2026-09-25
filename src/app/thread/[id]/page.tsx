import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/AppNav";
import { ChatComposer } from "@/components/ChatComposer";
import { PostItem } from "@/components/PostItem";
import { ReplyComposerProvider } from "@/components/ReplyComposer";
import { resolveReplyTo } from "@/lib/reply-marker";
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
  const postsByNumber = new Map(data.posts.map((post) => [post.resNumber, post]));

  return (
    <PageShell extraBottom>
      <p className="mb-4 text-sm">
        <Link href="/" className="font-medium text-sky-600 hover:text-sky-700">
          ← スレッド一覧
        </Link>
      </p>
      <h1 className="mb-6 text-3xl font-bold text-slate-950">{data.thread.title}</h1>
      <ReplyComposerProvider>
        <section className="space-y-3">
          {data.posts.map((post) => {
            const replyTo = resolveReplyTo(post);
            const parent = replyTo != null ? (postsByNumber.get(replyTo) ?? null) : null;
            return (
              <PostItem
                key={post.id}
                post={post}
                parent={parent}
                own={Boolean(authorKey && post.authorKey === authorKey)}
              />
            );
          })}
        </section>
        <ChatComposer threadId={data.thread.id} error={error} />
      </ReplyComposerProvider>
    </PageShell>
  );
}
