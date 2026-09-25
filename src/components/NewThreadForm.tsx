import { createThread } from "@/app/actions";

export function NewThreadForm({ error }: { error?: string }) {
  return (
    <form
      action={createThread}
      className="border border-gray-400 bg-white p-3"
    >
      <h2 className="mb-2 border-b border-gray-300 pb-1 text-sm font-bold">
        新規スレッド作成
      </h2>
      {error === "1" ? (
        <p className="mb-2 text-sm text-red-700">タイトルと本文は必須です。</p>
      ) : null}
      {error === "2" ? (
        <p className="mb-2 text-sm text-red-700">入力が長すぎます。</p>
      ) : null}
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center">
        <label className="w-24 shrink-0 text-sm" htmlFor="name">
          名前
        </label>
        <input
          id="name"
          name="name"
          placeholder="名無しさん"
          maxLength={20}
          className="w-full border border-gray-500 px-2 py-1 text-sm sm:max-w-xs"
        />
      </div>
      <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center">
        <label className="w-24 shrink-0 text-sm" htmlFor="title">
          タイトル
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={80}
          className="w-full border border-gray-500 px-2 py-1 text-sm"
        />
      </div>
      <div className="mb-2 flex flex-col gap-1 sm:flex-row">
        <label className="w-24 shrink-0 text-sm" htmlFor="body">
          本文
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={5}
          maxLength={4000}
          className="w-full border border-gray-500 px-2 py-1 text-sm"
        />
      </div>
      <div className="sm:pl-24">
        <button
          type="submit"
          className="border border-gray-600 bg-[#eee] px-4 py-1 text-sm hover:bg-[#ddd]"
        >
          スレッドを立てる
        </button>
      </div>
    </form>
  );
}
