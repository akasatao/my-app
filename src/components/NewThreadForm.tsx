import { createThread } from "@/app/actions";
import { cardClass, fieldClass, primaryButtonClass } from "@/components/ui";

export function NewThreadForm({ error }: { error?: string }) {
  return (
    <form action={createThread} className={`p-6 ${cardClass}`}>
      <h2 className="mb-5 text-lg font-semibold text-slate-950">新しいスレッド</h2>
      {error === "1" ? (
        <p className="mb-4 text-sm text-red-600">タイトルと本文は必須です。</p>
      ) : null}
      {error === "2" ? (
        <p className="mb-4 text-sm text-red-600">入力が長すぎます。</p>
      ) : null}
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="title">
            タイトル
          </label>
          <input id="title" name="title" required maxLength={80} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="body">
            本文
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={5}
            maxLength={4000}
            className={fieldClass}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          スレッドを作成
        </button>
      </div>
    </form>
  );
}
