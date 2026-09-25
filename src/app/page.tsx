import { BoardHeader } from "@/components/BoardHeader";
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
    <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-6">
      <BoardHeader />
      <section className="mt-4">
        <h2 className="mb-2 text-sm font-bold">スレッド一覧</h2>
        <ThreadTable threads={threads} />
      </section>
      <section className="mt-6" id="new">
        <NewThreadForm error={error} />
      </section>
      <footer className="mt-8 border-t border-gray-400 pt-2 text-xs text-gray-600">
        招待制なんでも実況板
      </footer>
    </div>
  );
}
