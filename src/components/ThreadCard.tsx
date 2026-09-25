"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { cardClass } from "@/components/ui";
import { formatBoardDate } from "@/lib/format";
import type { Thread } from "@/lib/types";

const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 10;

export function ThreadCard({ thread }: { thread: Thread }) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function openMenu(x: number, y: number) {
    const pad = 12;
    const width = 240;
    const height = 112;
    setMenu({
      x: Math.min(Math.max(pad, x), window.innerWidth - width - pad),
      y: Math.min(Math.max(pad, y), window.innerHeight - height - pad),
    });
    setPressed(true);
    suppressClickRef.current = true;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(12);
    }
  }

  function closeMenu() {
    setMenu(null);
    setPressed(false);
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    originRef.current = { x: event.clientX, y: event.clientY };

    if (event.pointerType === "touch" || event.pointerType === "pen") {
      setPressed(true);
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        openMenu(event.clientX, event.clientY);
      }, LONG_PRESS_MS);
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!originRef.current || timerRef.current === null) return;
    const dx = event.clientX - originRef.current.x;
    const dy = event.clientY - originRef.current.y;
    if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
      clearTimer();
      if (!menu) setPressed(false);
    }
  }

  function onPointerUp() {
    clearTimer();
    originRef.current = null;
    if (!menu) setPressed(false);
  }

  function onContextMenu(event: React.MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    clearTimer();
    openMenu(event.clientX, event.clientY);
  }

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  }

  async function rename() {
    closeMenu();
    const next = window.prompt("新しいスレッド名", thread.title);
    if (next == null) return;
    const title = next.trim();
    if (!title) {
      window.alert("スレッド名を入力してください。");
      return;
    }
    if (title.length > 80) {
      window.alert("スレッド名が長すぎます。");
      return;
    }
    if (title === thread.title) return;

    setBusy(true);
    try {
      const response = await fetch("/api/board", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id, title }),
      });
      if (!response.ok) {
        window.alert("スレッド名を更新できませんでした。");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    closeMenu();
    if (!window.confirm("本当にこのスレッドを削除しますか？")) return;

    setBusy(true);
    try {
      const response = await fetch("/api/board", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.id }),
      });
      if (!response.ok) {
        window.alert("スレッドを削除できませんでした。");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!menu) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeMenu();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  useEffect(() => () => clearTimer(), []);

  return (
    <div
      className={`origin-center touch-manipulation select-none transition duration-150 ${
        pressed ? "scale-95" : "scale-100"
      } ${busy ? "pointer-events-none opacity-60" : ""}`}
      style={{ WebkitTouchCallout: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={onContextMenu}
      onClickCapture={onClickCapture}
    >
      <Link
        href={`/thread/${thread.id}`}
        className={`block p-5 transition duration-150 hover:border-sky-200 hover:shadow-md ${cardClass}`}
      >
        <h3 className="text-lg font-semibold text-slate-950">{thread.title}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {thread.postCount} 件の投稿
          <span> · </span>
          {formatBoardDate(thread.createdAt)}
        </p>
      </Link>
      {menu && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[60]"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) closeMenu();
              }}
            >
              <div
                role="menu"
                className="absolute w-60 animate-in fade-in zoom-in-95 rounded-2xl border border-slate-100 bg-white/90 p-2 shadow-xl backdrop-blur-md"
                style={{ left: menu.x, top: menu.y }}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  role="menuitem"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void rename();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-900 transition hover:bg-sky-50"
                >
                  ✏️ スレッド名を編集
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void remove();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  🗑️ スレッドを削除
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
