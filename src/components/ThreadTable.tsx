import Link from "next/link";
import { cardClass } from "@/components/ui";
import { formatBoardDate } from "@/lib/format";
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
          <Link
            href={`/thread/${thread.id}`}
            className={`block p-5 transition duration-150 hover:border-sky-200 hover:shadow-md ${cardClass}`}
          >
            <h3 className="text-lg font-semibold text-slate-950">{thread.title}</h3>
            <p className="mt-2 text-sm text-slate-500">
              {thread.postCount} 件の投稿
              <span> · </span>
              {formatBoardDate(thread.createdAt)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
