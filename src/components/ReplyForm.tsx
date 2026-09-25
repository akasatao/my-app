import { addReply } from "@/app/actions";

export function ReplyForm({
  threadId,
  error,
}: {
  threadId: string;
  error?: string;
}) {
  return (
    <form
      action={addReply}
      className="border border-gray-400 bg-white p-3"
    >
      <h2 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold">
        レスを書く
      </h2>
      {error === "1" ? (
        <p className="mb-2 text-sm text-red-700">本文は必須です。</p>
      ) : null}
      {error === "2" ? (
        <p className="mb-2 text-sm text-red-700">入力が長すぎます。</p>
      ) : null}
      <input type="hidden" name="threadId" value={threadId} />
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center">
        <label className="w-24 shrink-0 text-sm" htmlFor="reply-name">
          名前
        </label>
        <input
          id="reply-name"
          name="name"
          placeholder="名無しさん"
          maxLength={20}
          className="w-full border border-gray-500 px-2 py-1 text-sm sm:max-w-xs"
        />
      </div>
      <div className="mb-2 flex flex-col gap-1 sm:flex-row">
        <label className="w-24 shrink-0 text-sm" htmlFor="reply-body">
          本文
        </label>
        <textarea
          id="reply-body"
          name="body"
          required
          rows={6}
          maxLength={4000}
          placeholder=">>1 のようにアンカーを書けます"
          className="w-full border border-gray-500 px-2 py-1 text-sm"
        />
      </div>
      <div className="sm:pl-24">
        <button
          type="submit"
          className="border border-gray-600 bg-[#eee] px-4 py-1 text-sm hover:bg-[#ddd]"
        >
          書き込む
        </button>
      </div>
    </form>
  );
}
