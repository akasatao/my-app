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
};

export type CreateThreadInput = {
  title: string;
  name: string;
  body: string;
  posterId: string;
};

export type AddPostInput = {
  threadId: string;
  name: string;
  body: string;
  posterId: string;
};

export type ThreadWithPosts = {
  thread: Thread;
  posts: Post[];
};
