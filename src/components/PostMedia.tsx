"use client";

import { useState } from "react";
import type { MediaType } from "@/lib/media";

export function PostMedia({
  url,
  type,
}: {
  url: string;
  type: MediaType;
}) {
  const [open, setOpen] = useState(false);

  if (type === "audio") {
    return (
      <div
        className="mt-3 w-full max-w-md rounded-2xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200"
        data-no-reply-menu
      >
        <p className="mb-1.5 text-xs font-medium text-slate-500">音声</p>
        <audio src={url} controls preload="metadata" className="w-full" />
      </div>
    );
  }

  if (type === "video") {
    return (
      <div
        className="mt-3 inline-block max-w-full overflow-hidden rounded-2xl bg-slate-950"
        data-no-reply-menu
      >
        <video
          src={url}
          controls
          playsInline
          className="block h-auto max-h-80 w-auto max-w-full bg-black object-contain"
        />
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        data-no-reply-menu
        onClick={() => setOpen(true)}
        className="mt-3 inline-block max-w-full overflow-hidden rounded-2xl bg-slate-100 text-left"
        aria-label="画像を拡大"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="block h-auto max-h-80 w-auto max-w-full object-contain"
        />
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          data-no-reply-menu
          onClick={() => setOpen(false)}
          onContextMenu={(event) => event.preventDefault()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
          />
        </div>
      ) : null}
    </>
  );
}
