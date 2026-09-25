export type Thread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
};

export type Post = {
  id: string;
  threadId: string;
  resNumber: number;
  name: string;
  body: string;
  createdAt: string;
  posterId: string;
  /** 画面には出さない。投稿者本人の判定用。 */
  authorKey: string;
  editedAt?: string;
  deletedAt?: string;
  /** 返信先のレス番号。本文には埋め込まない。 */
  replyTo?: number;
  mediaUrl?: string;
  mediaType?: "image" | "video";
};

export type CreateThreadInput = {
  title: string;
  name: string;
  body: string;
  posterId: string;
  authorKey: string;
};

export type AddPostInput = {
  threadId: string;
  name: string;
  body: string;
  posterId: string;
  authorKey: string;
  replyTo?: number;
  mediaUrl?: string;
  mediaType?: "image" | "video";
};

export type UpdatePostInput = {
  threadId: string;
  postId: string;
  authorKey: string;
  name: string;
  body: string;
};

export type DeletePostInput = {
  threadId: string;
  postId: string;
  authorKey: string;
};

export type UpdateThreadInput = {
  threadId: string;
  title: string;
};

export type DeleteThreadInput = {
  threadId: string;
};

export type ThreadWithPosts = {
  thread: Thread;
  posts: Post[];
};
