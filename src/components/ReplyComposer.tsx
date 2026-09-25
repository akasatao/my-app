"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ReplyTarget = {
  resNumber: number;
  name: string;
  body: string;
};

type ReplyComposer = {
  target: ReplyTarget | null;
  setTarget: (target: ReplyTarget | null) => void;
};

const ReplyComposerContext = createContext<ReplyComposer | null>(null);

export function ReplyComposerProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<ReplyTarget | null>(null);
  const value = useMemo(() => ({ target, setTarget }), [target]);
  return (
    <ReplyComposerContext.Provider value={value}>{children}</ReplyComposerContext.Provider>
  );
}

export function useReplyComposer() {
  const context = useContext(ReplyComposerContext);
  if (!context) {
    throw new Error("useReplyComposer は ReplyComposerProvider 内で使ってください");
  }
  return context;
}
