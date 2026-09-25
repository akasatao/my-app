import Link from "next/link";
import { PageShell } from "@/components/AppNav";

export default function ThreadNotFound() {
  return (
    <PageShell>
      <h1 className="mb-3 text-3xl font-bold text-slate-950">スレッドが見つかりません</h1>
      <p className="text-slate-500">削除されたか、URL が間違っています。</p>
      <p className="mt-6">
        <Link href="/" className="font-medium text-sky-600 hover:text-sky-700">
          ← ラウンジに戻る
        </Link>
      </p>
    </PageShell>
  );
}
