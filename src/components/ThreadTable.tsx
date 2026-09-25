import Link from "next/link";
import { formatBoardDate } from "@/lib/format";
import type { Thread } from "@/lib/types";

export function ThreadTable({ threads }: { threads: Thread[] }) {
  if (threads.length === 0) {
    return (
      <p className="border border-gray-400 bg-white p-3 text-sm">
        まだスレッドがありません。最初のスレッドを立ててください。
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-400 bg-white">
      <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-gray-400 bg-[#d0d8e8]">
            <th className="px-2 py-1 font-bold">No.</th>
            <th className="px-2 py-1 font-bold">タイトル</th>
            <th className="px-2 py-1 font-bold">レス</th>
            <th className="px-2 py-1 font-bold">作成日時</th>
          </tr>
        </thead>
        <tbody>
          {threads.map((thread, index) => (
            <tr
              key={thread.id}
              className="border-b border-gray-300 odd:bg-white even:bg-[#f7f9fc]"
            >
              <td className="px-2 py-1 align-top">{index + 1}</td>
              <td className="px-2 py-1">
                <Link
                  href={`/thread/${thread.id}`}
                  className="text-[#0000cc] underline hover:text-red-700"
                >
                  {thread.title}
                </Link>
              </td>
              <td className="px-2 py-1 align-top">{thread.postCount}</td>
              <td className="px-2 py-1 align-top whitespace-nowrap">
                {formatBoardDate(thread.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
