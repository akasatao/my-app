import { addReply } from "@/app/actions";
import { cardClass, fieldClass, primaryButtonClass } from "@/components/ui";

export function ReplyForm({
  threadId,
  error,
}: {
  threadId: string;
  error?: string;
}) {
  return (
    <form action={addReply} className={`p-6 ${cardClass}`}>
      <h2 className="mb-5 text-lg font-semibold text-slate-950">返信する</h2>
      {error === "1" ? (
        <p className="mb-4 text-sm text-red-600">本文は必須です。</p>
      ) : null}
      {error === "2" ? (
        <p className="mb-4 text-sm text-red-600">入力が長すぎます。</p>
      ) : null}
      {error === "3" ? (
        <p className="mb-4 text-sm text-red-600">この投稿は編集・削除できません。</p>
      ) : null}
      <input type="hidden" name="threadId" value={threadId} />
      <div className="space-y-4">
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-slate-700"
            htmlFor="reply-name"
          >
            表示名
          </label>
          <input
            id="reply-name"
            name="name"
            placeholder="名無しさん"
            maxLength={20}
            className={`${fieldClass} sm:max-w-xs`}
          />
        </div>
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-slate-700"
            htmlFor="reply-body"
          >
            メッセージ
          </label>
          <textarea
            id="reply-body"
            name="body"
            required
            rows={5}
            maxLength={4000}
            placeholder="#1 へ返信する場合は >>1 と書けます"
            className={fieldClass}
          />
        </div>
        <button type="submit" className={primaryButtonClass}>
          投稿する
        </button>
      </div>
    </form>
  );
}
