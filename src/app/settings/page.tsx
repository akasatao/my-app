import { updateUserName } from "@/app/actions";
import { PageShell } from "@/components/AppNav";
import { cardClass, fieldClass, primaryButtonClass } from "@/components/ui";
import { getUserName, requireInvite } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireInvite();
  const { error, saved } = await searchParams;
  const userName = await getUserName();

  return (
    <PageShell>
      <p className="mb-4 text-sm">
        <Link href="/" className="font-medium text-sky-600 hover:text-sky-700">
          ← スレッド一覧
        </Link>
      </p>
      <h1 className="mb-2 text-3xl font-bold text-slate-950">設定</h1>
      <p className="mb-6 text-slate-500">ラウンジで使う表示名を変更できます。</p>
      <form action={updateUserName} className={`max-w-md p-6 ${cardClass}`}>
        {saved ? (
          <p className="mb-4 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-800">
            ユーザーネームを保存しました。
          </p>
        ) : null}
        {error === "name" ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            ユーザーネームを入力してください。
          </p>
        ) : null}
        {error === "long" ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            ユーザーネームは20文字以内にしてください。
          </p>
        ) : null}
        <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="userName">
          ユーザーネーム
        </label>
        <input
          id="userName"
          name="userName"
          type="text"
          required
          maxLength={20}
          defaultValue={userName}
          autoComplete="nickname"
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-slate-500">
          投稿時の初期表示名になります。空欄で投稿すると「名無しさん」になります。
        </p>
        <button type="submit" className={`mt-5 ${primaryButtonClass}`}>
          保存する
        </button>
      </form>
    </PageShell>
  );
}
