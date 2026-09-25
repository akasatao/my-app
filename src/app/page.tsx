import { PageShell } from "@/components/AppNav";
import { NewThreadForm } from "@/components/NewThreadForm";
import { ThreadTable } from "@/components/ThreadTable";
import { requireInvite } from "@/lib/auth";
import { getBoard } from "@/lib/board";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireInvite();
  const { error } = await searchParams;
  const threads = await getBoard().listThreads();

  return (
    <PageShell>
      <h1 className="mb-2 text-3xl font-bold text-slate-950">スレッド</h1>
      <p className="mb-6 text-slate-500">招待メンバーだけの静かなラウンジです。</p>
      <section>
        <ThreadTable threads={threads} />
      </section>
      <section className="mt-10" id="new">
        <NewThreadForm error={error} />
      </section>
    </PageShell>
  );
}
