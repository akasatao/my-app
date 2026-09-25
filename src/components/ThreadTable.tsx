import { ThreadCard } from "@/components/ThreadCard";
import { cardClass } from "@/components/ui";
import type { Thread } from "@/lib/types";

export function ThreadTable({ threads }: { threads: Thread[] }) {
  if (threads.length === 0) {
    return (
      <div className={`p-8 text-center ${cardClass}`}>
        <p className="text-slate-900 font-medium">まだスレッドがありません</p>
        <p className="mt-1 text-sm text-slate-500">
          最初の話題を投稿して、ラウンジを始めましょう。
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {threads.map((thread) => (
        <li key={thread.id}>
          <ThreadCard thread={thread} />
        </li>
      ))}
    </ul>
  );
}
