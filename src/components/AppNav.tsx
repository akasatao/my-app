import type { ReactNode } from "react";
import Link from "next/link";

export function AppNav({ invited = false }: { invited?: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-8">
        <Link href={invited ? "/" : "/invite"} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white">
            P
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-950 md:text-base">
            Private Lounge
          </span>
        </Link>
        {invited ? (
          <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            招待コード認証済み
          </span>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            招待制
          </span>
        )}
      </div>
    </header>
  );
}

export function PageShell({
  invited = true,
  children,
}: {
  invited?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <AppNav invited={invited} />
      <main className="mx-auto max-w-5xl p-4 pt-24 md:p-8 md:pt-28">{children}</main>
    </>
  );
}
