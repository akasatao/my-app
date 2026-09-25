import type {
  AddPostInput,
  CreateThreadInput,
  DeletePostInput,
  Post,
  Thread,
  ThreadWithPosts,
  UpdatePostInput,
} from "./types";

/**
 * 掲示板データの抽象化。
 * 後から Supabase / Firebase 実装に差し替えやすいよう、I/O はこの interface に閉じる。
 */
export interface BoardRepository {
  listThreads(): Promise<Thread[]>;
  getThread(id: string): Promise<Thread | null>;
  getPosts(threadId: string): Promise<Post[]>;
  getThreadWithPosts(id: string): Promise<ThreadWithPosts | null>;
  createThread(input: CreateThreadInput): Promise<ThreadWithPosts>;
  addPost(input: AddPostInput): Promise<Post | null>;
  updatePost(input: UpdatePostInput): Promise<Post | null>;
  deletePost(input: DeletePostInput): Promise<Post | null>;
}
