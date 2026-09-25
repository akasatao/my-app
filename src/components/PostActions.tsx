"use client";

import { useState } from "react";
import { deletePost, updatePost } from "@/app/actions";

export function PostActions({
  threadId,
  postId,
  name,
  body,
}: {
  threadId: string;
  postId: string;
  name: string;
  body: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={updatePost} className="mt-2 border border-gray-400 bg-white p-2">
        <input type="hidden" name="threadId" value={threadId} />
        <input type="hidden" name="postId" value={postId} />
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center">
          <label className="w-16 shrink-0 text-sm" htmlFor={`edit-name-${postId}`}>
            名前
          </label>
          <input
            id={`edit-name-${postId}`}
            name="name"
            defaultValue={name === "名無しさん" ? "" : name}
            placeholder="名無しさん"
            maxLength={20}
            className="w-full border border-gray-500 px-2 py-1 text-sm sm:max-w-xs"
          />
        </div>
        <textarea
          name="body"
          required
          rows={5}
          maxLength={4000}
          defaultValue={body}
          className="w-full border border-gray-500 px-2 py-1 text-sm"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="submit"
            className="border border-gray-600 bg-[#eee] px-3 py-1 text-sm hover:bg-[#ddd]"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="border border-gray-600 bg-[#eee] px-3 py-1 text-sm hover:bg-[#ddd]"
          >
            キャンセル
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-[#0000cc] underline hover:text-red-700"
      >
        編集
      </button>
      <form
        action={deletePost}
        onSubmit={(event) => {
          if (!window.confirm("このレスを削除しますか？")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="threadId" value={threadId} />
        <input type="hidden" name="postId" value={postId} />
        <button type="submit" className="text-[#0000cc] underline hover:text-red-700">
          削除
        </button>
      </form>
    </div>
  );
}
