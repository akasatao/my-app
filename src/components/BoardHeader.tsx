import Link from "next/link";

export function BoardHeader({ title }: { title?: string }) {
  return (
    <header className="border-b border-gray-500 pb-3">
      <p className="text-xs text-gray-700">
        <Link href="/" className="text-[#0000cc] underline hover:text-red-700">
          ■掲示板に戻る
        </Link>
      </p>
      <h1 className="mt-1 text-xl font-bold text-red-700 sm:text-2xl">
        {title ?? "招待制なんでも実況板"}
      </h1>
      <p className="mt-1 text-xs sm:text-sm">
        招待コードを知っている人だけが読めて書き込めるクローズドな掲示板です。
      </p>
    </header>
  );
}
