import type { ReactNode } from "react";
import Link from "next/link";
import { getUserName } from "@/lib/auth";

export function AppNav({
  invited = false,
  userName = "",
}: {
  invited?: boolean;
  userName?: string;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 md:px-8">
        <Link href={invited ? "/" : "/invite"} className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-sm font-bold text-white">
            P
          </span>
          <span className="truncate text-sm font-semibold tracking-tight text-slate-950 md:text-base">
            Private Lounge
          </span>
        </Link>
        {invited ? (
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {userName ? (
              <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-600 sm:inline">
                {userName}
              </span>
            ) : null}
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-sky-200 hover:text-sky-700"
            >
              <span aria-hidden>⚙️</span>
              設定
            </Link>
          </div>
        ) : (
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            招待制
          </span>
        )}
      </div>
    </header>
  );
}

export async function PageShell({
  invited = true,
  extraBottom = false,
  children,
}: {
  invited?: boolean;
  extraBottom?: boolean;
  children: ReactNode;
}) {
  const userName = invited ? await getUserName() : "";

  return (
    <>
      <AppNav invited={invited} userName={userName} />
      <main
        className={`mx-auto max-w-5xl p-4 pt-24 md:p-8 md:pt-28 ${
          extraBottom ? "pb-52 md:pb-56" : ""
        }`}
      >
        {children}
      </main>
    </>
  );
}
