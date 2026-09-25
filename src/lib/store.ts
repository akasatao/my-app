import type { BoardRepository } from "./board-repository";
import type {
  AddPostInput,
  CreateThreadInput,
  DeletePostInput,
  Post,
  Thread,
  ThreadWithPosts,
  UpdatePostInput,
} from "./types";

type BoardState = {
  threads: Thread[];
  posts: Record<string, Post[]>;
};

type GlobalBoard = typeof globalThis & {
  __inviteBoard?: BoardState;
};

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function seedState(): BoardState {
  const threadId = "thread_welcome";
  const createdAt = "2026-09-25T08:00:00.000Z";

  return {
    threads: [
      {
        id: threadId,
        title: "【重要】この板の使い方",
        createdAt,
        updatedAt: createdAt,
        postCount: 3,
      },
    ],
    posts: {
      [threadId]: [
        {
          id: "post_1",
          threadId,
          resNumber: 1,
          name: "名無しさん",
          body: "招待制の雑談スレです。\nルールは常識の範囲で。荒らしはスルーで。",
          createdAt,
          posterId: "Ab3kQ91z",
          authorKey: "",
        },
        {
          id: "post_2",
          threadId,
          resNumber: 2,
          name: "名無しさん",
          body: ">>1\n了解。まずは動作確認がてら書き込んでみる。",
          createdAt: "2026-09-25T08:05:00.000Z",
          posterId: "nW8pL2cR",
          authorKey: "",
        },
        {
          id: "post_3",
          threadId,
          resNumber: 3,
          name: "テスト",
          body: "アンカーは >>2 みたいに書けばリンクになります。",
          createdAt: "2026-09-25T08:10:00.000Z",
          posterId: "Ab3kQ91z",
          authorKey: "",
        },
      ],
    },
  };
}

function getState(): BoardState {
  const g = globalThis as GlobalBoard;
  if (!g.__inviteBoard) {
    g.__inviteBoard = seedState();
  }
  return g.__inviteBoard;
}

function touchThread(state: BoardState, threadId: string, updatedAt: string) {
  const threadIndex = state.threads.findIndex((thread) => thread.id === threadId);
  if (threadIndex < 0) return;
  state.threads[threadIndex] = {
    ...state.threads[threadIndex],
    updatedAt,
  };
}

/**
 * プロトタイプ用のメモリ内ストア。
 * Vercel ではファイル書き込みが使えないため、fs は使わない。
 * 同一プロセス内のみ保持（再起動・別インスタンスでは初期データに戻る）。
 */
class MemoryBoardStore implements BoardRepository {
  async listThreads(): Promise<Thread[]> {
    return [...getState().threads].sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  }

  async getThread(id: string): Promise<Thread | null> {
    return getState().threads.find((thread) => thread.id === id) ?? null;
  }

  async getPosts(threadId: string): Promise<Post[]> {
    return getState().posts[threadId] ?? [];
  }

  async getThreadWithPosts(id: string): Promise<ThreadWithPosts | null> {
    const state = getState();
    const thread = state.threads.find((item) => item.id === id);
    if (!thread) return null;
    return { thread, posts: state.posts[id] ?? [] };
  }

  async createThread(input: CreateThreadInput): Promise<ThreadWithPosts> {
    const state = getState();
    const id = createId("thread");
    const createdAt = nowIso();
    const thread: Thread = {
      id,
      title: input.title,
      createdAt,
      updatedAt: createdAt,
      postCount: 1,
    };
    const post: Post = {
      id: createId("post"),
      threadId: id,
      resNumber: 1,
      name: input.name,
      body: input.body,
      createdAt,
      posterId: input.posterId,
      authorKey: input.authorKey,
    };

    state.threads.push(thread);
    state.posts[id] = [post];
    return { thread, posts: [post] };
  }

  async addPost(input: AddPostInput): Promise<Post | null> {
    const state = getState();
    const threadIndex = state.threads.findIndex(
      (thread) => thread.id === input.threadId,
    );
    const existing = state.posts[input.threadId];
    if (threadIndex < 0 || !existing) return null;

    const createdAt = nowIso();
    const post: Post = {
      id: createId("post"),
      threadId: input.threadId,
      resNumber: existing.length + 1,
      name: input.name,
      body: input.body,
      createdAt,
      posterId: input.posterId,
      authorKey: input.authorKey,
    };

    existing.push(post);
    state.threads[threadIndex] = {
      ...state.threads[threadIndex],
      updatedAt: createdAt,
      postCount: existing.length,
    };

    return post;
  }

  async updatePost(input: UpdatePostInput): Promise<Post | null> {
    const state = getState();
    const posts = state.posts[input.threadId];
    if (!posts) return null;

    const index = posts.findIndex((post) => post.id === input.postId);
    if (index < 0) return null;

    const current = posts[index];
    if (!current.authorKey || current.authorKey !== input.authorKey) return null;
    if (current.deletedAt) return null;

    const editedAt = nowIso();
    const updated: Post = {
      ...current,
      name: input.name,
      body: input.body,
      editedAt,
    };
    posts[index] = updated;
    touchThread(state, input.threadId, editedAt);
    return updated;
  }

  async deletePost(input: DeletePostInput): Promise<Post | null> {
    const state = getState();
    const posts = state.posts[input.threadId];
    if (!posts) return null;

    const index = posts.findIndex((post) => post.id === input.postId);
    if (index < 0) return null;

    const current = posts[index];
    if (!current.authorKey || current.authorKey !== input.authorKey) return null;
    if (current.deletedAt) return current;

    const deletedAt = nowIso();
    const updated: Post = {
      ...current,
      body: "削除されました",
      deletedAt,
    };
    posts[index] = updated;
    touchThread(state, input.threadId, deletedAt);
    return updated;
  }
}

export const memoryBoardStore = new MemoryBoardStore();
