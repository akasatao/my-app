"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useReplyComposer, type ReplyTarget } from "@/components/ReplyComposer";

const LONG_PRESS_MS = 500;
const MOVE_CANCEL_PX = 10;

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("button, input, textarea, select, [data-no-reply-menu]"))
  );
}

export function PostCardMenu({
  target,
  children,
}: {
  target: ReplyTarget;
  children: ReactNode;
}) {
  const { setTarget } = useReplyComposer();
  const [pressed, setPressed] = useState(false);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const originRef = useRef<{ x: number; y: number } | null>(null);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function openMenu(x: number, y: number) {
    const pad = 12;
    const width = 220;
    const height = 56;
    setMenu({
      x: Math.min(Math.max(pad, x), window.innerWidth - width - pad),
      y: Math.min(Math.max(pad, y), window.innerHeight - height - pad),
    });
    setPressed(true);
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
    if (isEditableTarget(event.target)) return;

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
    if (isEditableTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    clearTimer();
    openMenu(event.clientX, event.clientY);
  }

  function reply(event: React.SyntheticEvent) {
    event.preventDefault();
    event.stopPropagation();
    setTarget(target);
    closeMenu();
    window.setTimeout(() => {
      document.getElementById("reply-body")?.focus();
    }, 50);
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
      }`}
      style={{ WebkitTouchCallout: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onContextMenu={onContextMenu}
    >
      {children}
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
                className="absolute w-52 animate-in fade-in zoom-in-95 rounded-2xl border border-slate-100 bg-white/90 p-2 shadow-xl backdrop-blur-md"
                style={{ left: menu.x, top: menu.y }}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  role="menuitem"
                  onPointerDown={reply}
                  onClick={reply}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-900 transition hover:bg-sky-50"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                      <path d="M10 8.5V4.75L3.75 11 10 17.25V13.4c4.8.15 8.15 1.7 10.25 5.35C19.4 14.1 16.2 9.1 10 8.5Z" />
                    </svg>
                  </span>
                  返信する
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
