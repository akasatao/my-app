"use client";

import { useEffect, useRef, useState } from "react";
import { addReply } from "@/app/actions";
import { useReplyComposer } from "@/components/ReplyComposer";
import { ReplyTargetPreview } from "@/components/ReplyTargetPreview";
import { detectMediaType, type MediaType } from "@/lib/media";

const MAX_FILE_BYTES = 12 * 1024 * 1024;

export function ChatComposer({
  threadId,
  error,
}: {
  threadId: string;
  error?: string;
}) {
  const { target } = useReplyComposer();
  const fileRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<{ url: string; type: MediaType } | null>(null);
  const [mediaError, setMediaError] = useState("");

  function clearMedia() {
    if (media?.url.startsWith("blob:")) URL.revokeObjectURL(media.url);
    setMedia(null);
    setMediaError("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function attachFile(file: File) {
    const type = detectMediaType(file);
    if (!type) {
      setMediaError("画像・動画・音声ファイルを選んでください。");
      return false;
    }

    if (file.size > MAX_FILE_BYTES) {
      setMediaError("ファイルは 12MB 以下にしてください。");
      return false;
    }

    setMedia((current) => {
      if (current?.url.startsWith("blob:")) URL.revokeObjectURL(current.url);
      return { url: URL.createObjectURL(file), type };
    });
    setMediaError("");
    return true;
  }

  function attachFromClipboard(clipboard: DataTransfer | null) {
    if (!clipboard) return false;

    const candidates = [
      ...[...clipboard.items].map((item) => item.getAsFile()),
      ...clipboard.files,
    ].filter((file): file is File => Boolean(file));

    for (const file of candidates) {
      if (!detectMediaType(file)) continue;
      if (fileRef.current) {
        const transfer = new DataTransfer();
        transfer.items.add(file);
        fileRef.current.files = transfer.files;
      }
      attachFile(file);
      return true;
    }

    return false;
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!attachFile(file)) {
      event.target.value = "";
    }
  }

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const el = event.target;
      if (
        el instanceof HTMLElement &&
        el.closest("input:not([type=file]), textarea, select, [contenteditable='true']") &&
        !el.closest("#form")
      ) {
        return;
      }

      if (attachFromClipboard(event.clipboardData)) {
        event.preventDefault();
      }
    }

    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div
      id="form"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
    >
      <div className="mx-auto max-w-5xl px-4 pt-3 md:px-8">
        {error === "1" ? (
          <p className="mb-2 text-sm text-red-600">メッセージまたは添付を入力してください。</p>
        ) : null}
        {error === "2" ? (
          <p className="mb-2 text-sm text-red-600">入力が長すぎます。</p>
        ) : null}
        {error === "3" ? (
          <p className="mb-2 text-sm text-red-600">この投稿は編集・削除できません。</p>
        ) : null}
        {mediaError ? <p className="mb-2 text-sm text-red-600">{mediaError}</p> : null}
        {target ? <ReplyTargetPreview /> : null}
        {media ? (
          <div className="mb-2 flex items-start">
            <div className="relative overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
              {media.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={media.url} alt="" className="h-16 w-16 object-cover" />
              ) : media.type === "video" ? (
                <video src={media.url} muted className="h-16 w-16 object-cover" />
              ) : (
                <audio src={media.url} controls className="h-10 max-w-[16rem]" />
              )}
              <button
                type="button"
                aria-label="添付を解除"
                onClick={clearMedia}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] text-white"
              >
                ✕
              </button>
            </div>
          </div>
        ) : null}
        <form action={addReply} className="flex items-end gap-2">
          <input type="hidden" name="threadId" value={threadId} />
          <input type="hidden" name="replyTo" value={target ? String(target.resNumber) : ""} />
          <input type="hidden" name="mediaType" value={media?.type ?? ""} />
          <input
            ref={fileRef}
            type="file"
            name="media"
            accept="image/*,video/*,audio/*"
            className="hidden"
            onChange={onFile}
          />
          <button
            type="button"
            aria-label="写真・動画・音声を添付"
            onClick={() => fileRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg text-slate-600 transition hover:border-sky-200 hover:text-sky-700"
          >
            📷
          </button>
          <textarea
            id="reply-body"
            name="body"
            required={!media}
            rows={1}
            maxLength={4000}
            placeholder={target ? `@${target.name} に返信` : "メッセージを入力"}
            className="max-h-36 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
          />
          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white transition hover:bg-sky-700"
            aria-label="送信"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M3.4 20.6 21 12 3.4 3.4 3 10.1 15 12 3 13.9z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
