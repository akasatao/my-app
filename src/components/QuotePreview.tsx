import type { ReactNode } from "react";

export function QuotePreview({
  name,
  body,
  href,
  replyLabel = false,
  action,
}: {
  name: string;
  body: string;
  href?: string;
  replyLabel?: boolean;
  action?: ReactNode;
}) {
  const inner = (
    <>
      <span
        className="absolute inset-y-1.5 left-1.5 w-1 rounded-full bg-sky-500"
        aria-hidden
      />
      <div className="min-w-0 flex-1 pl-1">
        <p className="text-sm font-semibold leading-snug text-sky-800">
          {replyLabel ? `@${name} への返信` : `@${name}`}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[13.5px] leading-5 text-slate-700">
          {body || "削除された投稿"}
        </p>
      </div>
      {action}
    </>
  );

  const className =
    "relative flex items-start gap-2 overflow-hidden rounded-2xl bg-sky-50 py-2 pr-2.5 pl-3.5 ring-1 ring-sky-100";

  if (!href) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <a
      href={href}
      className={`mb-2.5 block no-underline transition hover:bg-sky-100/80 ${className}`}
    >
      {inner}
    </a>
  );
}
