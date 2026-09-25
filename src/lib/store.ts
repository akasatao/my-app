import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import type { BoardRepository } from "./board-repository";
import type {
  AddPostInput,
  CreateThreadInput,
  Post,
  Thread,
  ThreadWithPosts,
} from "./types";

type BoardState = {
  threads: Thread[];
  posts: Record<string, Post[]>;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_PATH = path.join(DATA_DIR, "board.json");

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
        },
        {
          id: "post_2",
          threadId,
          resNumber: 2,
          name: "名無しさん",
          body: ">>1\n了解。まずは動作確認がてら書き込んでみる。",
          createdAt: "2026-09-25T08:05:00.000Z",
          posterId: "nW8pL2cR",
        },
        {
          id: "post_3",
          threadId,
          resNumber: 3,
          name: "テスト",
          body: "アンカーは >>2 みたいに書けばリンクになります。",
          createdAt: "2026-09-25T08:10:00.000Z",
          posterId: "Ab3kQ91z",
        },
      ],
    },
  };
}

function persist(state: BoardState) {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(state, null, 2), "utf8");
}

function loadState(): BoardState {
  if (existsSync(DATA_PATH)) {
    return JSON.parse(readFileSync(DATA_PATH, "utf8")) as BoardState;
  }
  const seeded = seedState();
  persist(seeded);
  return seeded;
}

function getState(): BoardState {
  const g = globalThis as GlobalBoard;
  if (!g.__inviteBoard) {
    g.__inviteBoard = loadState();
  }
  return g.__inviteBoard;
}

function mutate<T>(updater: (state: BoardState) => T): T {
  const state = getState();
  const result = updater(state);
  persist(state);
  return result;
}

/**
 * プロトタイプ用ストア。
 * メモリ（HMR 耐性のため globalThis）+ data/board.json に永続化。
 * 後から BoardRepository 実装を差し替えれば DB へ移行できる。
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
    return mutate((state) => {
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
      };

      state.threads.push(thread);
      state.posts[id] = [post];
      return { thread, posts: [post] };
    });
  }

  async addPost(input: AddPostInput): Promise<Post | null> {
    return mutate((state) => {
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
      };

      existing.push(post);
      state.threads[threadIndex] = {
        ...state.threads[threadIndex],
        updatedAt: createdAt,
        postCount: existing.length,
      };

      return post;
    });
  }
}

export const memoryBoardStore = new MemoryBoardStore();
