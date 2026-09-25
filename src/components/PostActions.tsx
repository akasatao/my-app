"use client";

import { useState } from "react";
import { deletePost, updatePost } from "@/app/actions";
import {
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/ui";

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
      <form action={updatePost} className="mt-4 space-y-3" data-no-reply-menu>
        <input type="hidden" name="threadId" value={threadId} />
        <input type="hidden" name="postId" value={postId} />
        <div>
          <label
            className="mb-1.5 block text-sm font-medium text-slate-700"
            htmlFor={`edit-name-${postId}`}
          >
            表示名
          </label>
          <input
            id={`edit-name-${postId}`}
            name="name"
            defaultValue={name === "名無しさん" ? "" : name}
            placeholder="名無しさん"
            maxLength={20}
            className={`${fieldClass} sm:max-w-xs`}
          />
        </div>
        <textarea
          name="body"
          required
          rows={5}
          maxLength={4000}
          defaultValue={body}
          className={fieldClass}
        />
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={primaryButtonClass}>
            保存
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className={secondaryButtonClass}
          >
            キャンセル
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-4 text-sm" data-no-reply-menu>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="font-medium text-sky-600 hover:text-sky-700"
      >
        編集
      </button>
      <form
        action={deletePost}
        onSubmit={(event) => {
          if (!window.confirm("この投稿を削除しますか？")) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="threadId" value={threadId} />
        <input type="hidden" name="postId" value={postId} />
        <button type="submit" className="font-medium text-slate-500 hover:text-slate-800">
          削除
        </button>
      </form>
    </div>
  );
}
