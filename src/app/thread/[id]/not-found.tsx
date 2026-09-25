import Link from "next/link";

export default function ThreadNotFound() {
  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-8 sm:px-6">
      <h1 className="text-lg font-bold text-red-700">スレッドが見つかりません</h1>
      <p className="mt-2 text-sm">削除されたか、URL が間違っています。</p>
      <p className="mt-4 text-sm">
        <Link href="/" className="text-[#0000cc] underline">
          掲示板に戻る
        </Link>
      </p>
    </div>
  );
}
