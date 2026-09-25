"use client";

import { QuotePreview } from "@/components/QuotePreview";
import { useReplyComposer } from "@/components/ReplyComposer";

export function ReplyTargetPreview() {
  const { target, setTarget } = useReplyComposer();
  if (!target) return null;

  return (
    <div className="mb-2 animate-in fade-in slide-in-from-top-2">
      <QuotePreview
        name={target.name}
        body={target.body}
        action={
          <button
            type="button"
            aria-label="返信を解除"
            onClick={() => setTarget(null)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm text-slate-500 transition hover:bg-white hover:text-slate-800"
          >
            ✕
          </button>
        }
      />
    </div>
  );
}
